import {
  Type,
  DiagnosticTarget,
  NoTarget,
  getEffectiveModelType,
  IntrinsicType,
  Namespace,
  LiteralType,
  isArrayModelType,
  getFriendlyName,
} from "@typespec/compiler";
import { JsContext, Module, isImportableType } from "../ctx.js";
import { getJsScalar } from "./scalar.js";
import { emitWellKnownModel, isWellKnownModel } from "./model.js";
import { parseCase } from "../util/case.js";
import { createOrGetModuleForNamespace } from "./namespace.js";
import { asArrayType, getArrayElementName } from "../util/pluralism.js";
import { emitUnionType } from "./union.js";

export type NamespacedType = Extract<Type, { namespace?: Namespace }>;

/**
 * Emits a reference to a host type.
 *
 * This function will automatically ensure that the referenced type is included in the emit graph, and will import the
 * type into the current module if necessary.
 *
 * Optionally, a `preferredAlternativeName` may be supplied. This alternative name will be used if a declaration is
 * required, but the type is anonymous. The alternative name can only be set once. If two callers provide different
 * alternative names for the same anonymous type, the first one is used in all cases. If a declaration _is_ required,
 * and no alternative name is supplied (or has been supplied in a prior call to `emitTypeReference`), this function will
 * throw an error. Callers must be sure to provide an alternative name if the type _may_ have an unknown name. However,
 * callers may know that they have previously emitted a reference to the type and provided an alternative name in that
 * call, in which case the alternative name may be safely omitted.
 *
 * @param ctx - The emitter context.
 * @param type - The type to emit a reference to.
 * @param position - The syntactic position of the reference, for diagnostics.
 * @param module - The module that the reference is being emitted into.
 * @param preferredAlternativeName - An optional alternative name to use for the type if it is not named.
 * @returns a string containing a reference to the TypeScript type that represents the given TypeSpec type.
 */
export function emitTypeReference(
  ctx: JsContext,
  type: Type,
  position: DiagnosticTarget | typeof NoTarget,
  module: Module,
  preferredAlternativeName?: string
): string {
  switch (type.kind) {
    case "Scalar":
      // Get the scalar and return it directly, as it is a primitive.
      return getJsScalar(ctx.program, type, position);
    case "Model": {
      // First handle arrays.
      if (isArrayModelType(ctx.program, type)) {
        const argumentType = type.templateMapper!.args[0];

        const argTypeReference = emitTypeReference(
          ctx,
          argumentType,
          position,
          module,
          preferredAlternativeName &&
            getArrayElementName(preferredAlternativeName)
        );

        if (isImportableType(ctx, argumentType) && argumentType.namespace) {
          module.imports.push({
            binder: [argTypeReference],
            from: createOrGetModuleForNamespace(ctx, argumentType.namespace),
          });
        }

        return asArrayType(argTypeReference);
      }

      // Now other well-known models.
      if (isWellKnownModel(ctx, type)) {
        return emitWellKnownModel(ctx, type, module, preferredAlternativeName);
      }

      // Try to reduce the model to an effective model if possible.
      const effectiveModel = getEffectiveModelType(ctx.program, type);

      if (effectiveModel.name === "") {
        // We might have seen the model before and synthesized a declaration for it already.
        if (ctx.syntheticNames.has(effectiveModel)) {
          // TODO/witemple: I feel like I'm missing an import here.
          return ctx.syntheticNames.get(effectiveModel)!;
        }

        // Require preferredAlternativeName at this point, as we have an anonymous model that we have not visited.
        if (!preferredAlternativeName) {
          throw new Error(
            "UNREACHABLE: anonymous model without preferredAlternativeName"
          );
        }

        // Anonymous model, synthesize a new model with the preferredName
        ctx.synthetics.push({
          kind: "anonymous",
          name: preferredAlternativeName,
          underlying: effectiveModel,
        });

        module.imports.push({
          binder: [preferredAlternativeName],
          from: ctx.syntheticModule,
        });

        ctx.syntheticNames.set(effectiveModel, preferredAlternativeName);

        return preferredAlternativeName;
      } else {
        // The effective model is good for a declaration, so enqueue it.
        ctx.typeQueue.add(effectiveModel);
      }

      const friendlyName = getFriendlyName(ctx.program, effectiveModel);

      // The model may be a template instance, so we generate a name for it.
      const templatedName = parseCase(
        friendlyName
          ? friendlyName
          : effectiveModel.templateMapper
            ? effectiveModel
                .templateMapper!.args.map((a) =>
                  "name" in a ? String(a.name) : ""
                )
                .join("_") + effectiveModel.name
            : effectiveModel.name
      );

      if (!effectiveModel.namespace) {
        throw new Error(
          "UNREACHABLE: no parent namespace of named model in emitTypeReference"
        );
      }

      // TODO/witemple: I believe this is going to declare all template instances in the module of the template itself, which
      // might not be desirable.
      const parentModule = createOrGetModuleForNamespace(
        ctx,
        effectiveModel.namespace
      );

      module.imports.push({
        binder: [templatedName.pascalCase],
        from: parentModule,
      });

      return templatedName.pascalCase;
    }
    case "Union": {
      return emitUnionType(ctx, [...type.variants.values()], module);
    }
    case "Enum": {
      ctx.typeQueue.add(type);

      const name = parseCase(type.name).pascalCase;

      module.imports.push({
        binder: [name],
        from: createOrGetModuleForNamespace(ctx, type.namespace!),
      });

      return name;
    }
    case "String":
      return JSON.stringify(type.value);
    case "Number":
    case "Boolean":
      return String(type.value);
    case "Intrinsic":
      switch (type.name) {
        case "never":
          return "never";
        case "null":
          return "null";
        case "void":
          // TODO/witemple: is this correct? I think I need to know whether or not we're emitting a return type to be able to
          // correctly use `void` here.
          return "void";
        case "ErrorType":
          throw new Error(
            "UNREACHABLE: Encountered ErrorType in emitTypeReference"
          );
        case "unknown":
          return "unknown";
        default:
          throw new Error(
            `encountered unknown intrinsic type '${
              (type satisfies never as IntrinsicType).name
            }' in type graph"`
          );
      }
    case "Interface": {
      if (type.namespace === undefined) {
        throw new Error("UNREACHABLE: unparented interface");
      }

      const typeName = parseCase(type.name).pascalCase;

      ctx.typeQueue.add(type);

      const parentModule = createOrGetModuleForNamespace(ctx, type.namespace);

      module.imports.push({
        binder: [typeName],
        from: parentModule,
      });

      return typeName;
    }
    case "ModelProperty": {
      // Forward to underlying type.
      return emitTypeReference(
        ctx,
        type.type,
        position,
        module,
        preferredAlternativeName
      );
    }
    default:
      throw new Error(`UNREACHABLE: ${type.kind}`);
  }
}

export type JsTypeSpecLiteralType =
  | LiteralType
  | (IntrinsicType & { name: "null" });

export function isValueLiteralType(t: Type): t is JsTypeSpecLiteralType {
  switch (t.kind) {
    case "String":
    case "Number":
    case "Boolean":
      return true;
    case "Intrinsic":
      return t.name === "null";
    default:
      return false;
  }
}