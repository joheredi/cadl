import "../dist/lib/decorators.js";

using TypeSpec.Reflection;

namespace TypeSpec;

/**
 * Typically a short, single-line description.
 * @param summary Summary string.
 *
 * @example
 * ```typespec
 * @summary("This is a pet")
 * model Pet {}
 * ```
 */
extern dec summary(target: unknown, summary: string);

/**
 * Attach a documentation string.
 * @param doc Documentation string
 * @param formatArgs Record with key value pair that can be interpolated in the doc.
 *
 * @example
 * ```typespec
 * @doc("Represent a Pet available in the PetStore")
 * model Pet {}
 * ```
 */
extern dec doc(target: unknown, doc: string, formatArgs?: object);

/**
 * Mark this type as deprecated
 * @param message Deprecation message.
 *
 * @example
 *
 * ```typespec
 * @deprecated("Use ActionV2")
 * op Action<T>(): T;
 * ```
 */
extern dec deprecated(target: unknown, message: string);

/**
 * Service options.
 */
model ServiceOptions {
  /**
   * Title of the service.
   */
  title?: string;
  /**
   * Version of the service.
   */
  version?: string;
}

/**
 * Mark this namespace as describing a service and configure service properties.
 * @param options Optional configuration for the service.
 *
 * @example
 * ```typespec
 * @service
 * namespace PetStore;
 * ```
 *
 * @example Setting service title
 * ```typespec
 * @service({title: "Pet store"})
 * namespace PetStore;
 * ```
 *
 * @example Setting service version
 * ```typespec
 * @service({version: "1.0"})
 * namespace PetStore;
 * ```
 */
extern dec service(target: Namespace, options?: ServiceOptions);

/**
 * Specify that this model is an error type. Operations return error types when the operation has failed.
 *
 * @example
 * ```typespec
 * @error
 * model PetStoreError {
 *   code: string;
 *   message: string;
 * }
 * ```
 */
extern dec error(target: object);

/**
 * Specify a known data format hint for this string type. For example `uuid`, `uri`, etc.
 * This differ from the @pattern decorator that is meant to specify a regular expression while @format takes in a known format name.
 * The format names are open ended and are left to emitter to interpret.
 *
 * @param format format name.
 *
 * @example
 * ```typespec
 * @format("uuid")
 * scalar uuid extends string;
 * ```
 */
extern dec format(target: string | bytes | ModelProperty, format: string);

/**
 * Specify the the pattern this string should respect using simple regular expression syntax.
 * The following syntax is allowed: alternations (`|`), quantifiers (`?`, `*`, `+`, and `{ }`), wildcard (`.`), and grouping parentheses.
 * Advanced features like look-around, capture groups, and references are not supported.
 *
 * @param pattern Regular expression.
 *
 * @example
 * ```typespec
 * @pattern("[a-z]+")
 * scalar LowerAlpha extends string;
 * ```
 */
extern dec pattern(target: string | bytes | ModelProperty, pattern: string);

/**
 * Specify the minimum length this string type should be.
 * @param value Minimum length
 *
 * @example
 * ```typespec
 * @minLength(2)
 * scalar Username extends string;
 * ```
 */
extern dec minLength(target: string | ModelProperty, value: integer);

/**
 * Specify the maximum length this string type should be.
 * @param value Maximum length
 *
 * @example
 * ```typespec
 * @maxLength(20)
 * scalar Username extends string;
 * ```
 */
extern dec maxLength(target: string | ModelProperty, value: integer);

/**
 * Specify the minimum number of items this array should have.
 * @param value Minimum number
 *
 * @example
 * ```typespec
 * @minItems(1)
 * model Endpoints is string[];
 * ```
 */
extern dec minItems(target: unknown[] | ModelProperty, value: integer);

/**
 * Specify the maximum number of items this array should have.
 * @param value Maximum number
 *
 * @example
 * ```typespec
 * @maxItems(5)
 * model Endpoints is string[];
 * ```
 */
extern dec maxItems(target: unknown[] | ModelProperty, value: integer);

/**
 * Specify the minimum value this numeric type should be.
 * @param value Minimum value
 *
 * @example
 * ```typespec
 * @minValue(18)
 * scalar Age is int32;
 * ```
 */
extern dec minValue(target: numeric | ModelProperty, value: numeric);

/**
 * Specify the maximum value this numeric type should be.
 * @param value Maximum value
 *
 * @example
 * ```typespec
 * @maxValue(200)
 * scalar Age is int32;
 * ```
 */
extern dec maxValue(target: numeric | ModelProperty, value: numeric);

/**
 * Specify the minimum value this numeric type should be, exclusive of the given
 * value.
 * @param value Minimum value
 *
 * @example
 * ```typespec
 * @minValueExclusive(0)
 * scalar distance is float64;
 * ```
 */
extern dec minValueExclusive(target: numeric | ModelProperty, value: numeric);

/**
 * Specify the maximum value this numeric type should be, exclusive of the given
 * value.
 * @param value Maximum value
 *
 * @example
 * ```typespec
 * @maxValueExclusive(50)
 * scalar distance is float64;
 * ```
 */
extern dec maxValueExclusive(target: numeric | ModelProperty, value: numeric);

/**
 * Mark this string as a secret value that should be treated carefully to avoid exposure
 *
 * @example
 * ```typespec
 * @secret
 * scalar Password is string;
 * ```
 */
extern dec secret(target: string | ModelProperty);

/**
 * Attaches a tag to an operation, interface, or namespace. Multiple `@tag` decorators can be specified to attach multiple tags to a TypeSpec element.
 * @param tag Tag value
 */
extern dec tag(target: Namespace | Interface | Operation, tag: string);

/**
 * Specifies how a templated type should name their instances.
 * @param name name the template instance should take
 * @formatArgs Model with key value used to interpolate the name
 *
 * @example
 * ```typespec
 * @friendlyName("{name}List", T)
 * model List<T> {
 *   value: T[];
 *   nextLink: string;
 * }
 * ```
 */
extern dec friendlyName(target: unknown, name: string, formatArgs?: unknown);

/**
 * Provide a set of known values to a string type.
 * @param values Known values enum.
 *
 * @example
 * ```typespec
 * @knownValues(KnownErrorCode)
 * scalar ErrorCode extends string;
 *
 * enum KnownErrorCode {
 *   NotFound,
 *   Invalid,
 * }
 * ```
 */
extern dec knownValues(target: string | numeric | ModelProperty, values: Enum);

/**
 * Mark a model property as the key to identify instances of that type
 *
 * @example
 * ```typespec
 * model Pet {
 *   @key id: string;
 * }
 * ```
 */
extern dec key(target: ModelProperty, altName?: string);

/**
 * Specify this operation is an overload of the given operation.
 * @param overloadbase Base operation that should be a union of all overloads
 *
 * @example
 * ```typespec
 * op upload(data: string | bytes, @header contentType: "text/plain" | "application/octet-stream"): void;
 * @overload(upload)
 * op uploadString(data: string, @header contentType: "text/plain" ): void;
 * @overload(upload)
 * op uploadBytes(data: bytes, @header contentType: "application/octet-stream"): void;
 * ```
 */
extern dec overload(target: Operation, overloadbase: Operation);

/**
 * Provide an alternative name for this type.
 * @param targetName Projection target
 * @param projectedName Alternative name
 *
 * @example
 * ```typespec
 * model Certificate {
 *   @projectedName("json", "exp")
 *   expireAt: int32;
 * }
 * ```
 */
extern dec projectedName(target: unknown, targetName: string, projectedName: string);

/**
 * Specify the property to be used to discriminate this type.
 *
 * @example
 *
 * ```typespec
 * @discriminator("kind")
 * union Pet{ cat: Cat, dog: Dog }
 *
 * model Cat {kind: "cat", meow: boolean}
 * model Dog {kind: "dog", bark: boolean}
 * ```
 *
 * ```typespec
 * @discriminator("kind")
 * model Pet{ kind: string }
 *
 * model Cat extends Pet {kind: "cat", meow: boolean}
 * model Dog extends Pet  {kind: "dog", bark: boolean}
 * ```
 */
extern dec discriminator(target: object | Union, propertyName: string);

/**
 * Indicates that a property is only considered to be present or applicable ("visible") with
 * the in the given named contexts ("visibilities"). When a property has no visibilities applied
 * to it, it is implicitly visible always.
 *
 * As far as the TypeSpec core library is concerned, visibilities are open-ended and can be arbitrary
 * strings, but  the following visibilities are well-known to standard libraries and should be used
 * with standard emitters that interpret them as follows:
 *
 * - "read": output of any operation.
 * - "create": input to operations that create an entity..
 * - "query": input to operations that read data.
 * - "update": input to operations that update data.
 * - "delete": input to operations that delete data.
 *
 * See also: [Automatic visibility](https://microsoft.github.io/typespec/standard-library/rest/operations#automatic-visibility)
 *
 * @example
 *
 * ```typespec
 * model Dog {
 *   // the service will generate an ID, so you don't need to send it.
 *   @visibility("read") id: int32;
 *   // the service will store this secret name, but won't ever return it
 *   @visibility("create", "update") secretName: string;
 *   // the regular name is always present
 *   name: string;
 * }
 * ```
 */
extern dec visibility(target: ModelProperty, ...visibilities: string[]);

/**
 * Removes properties that are not considered to be present or applicable
 * ("visible") in the given named contexts ("visibilities"). Can be used
 * together with spread to effectively spread only visible properties into
 * a new model.
 *
 * See also: [Automatic visibility](https://microsoft.github.io/typespec/standard-library/rest/operations#automatic-visibility)
 *
 * When using an emitter that applies visibility automatically, it is generally
 * not necessary to use this decorator.
 *
 * @example
 * ```typespec
 * model Dog {
 *   @visibility("read") id: int32;
 *   @visibility("create", "update") secretName: string;
 *   name: string;
 * }
 *
 * // The spread operator will copy all the properties of Dog into DogRead,
 * // and @withVisibility will then remove those that are not visible with
 * // create or update visibility.
 * //
 * // In this case, the id property is removed, and the name and secretName
 * // properties are kept.
 * @withVisibility("create", "update")
 * model DogCreateOrUpdate {
 *   ...Dog;
 * }
 *
 * // In this case the id and name properties are kept and the secretName property
 * // is removed.
 * @withVisibility("read")
 * model DogRead {
 *   ...Dog;
 * }
 * ```
 */
extern dec withVisibility(target: object, ...visibilities: string[]);
extern dec withDefaultKeyVisibility(target: object, visibility: unknown);
extern dec withUpdateableProperties(target: object);
extern dec withoutDefaultValues(target: object);
extern dec withoutOmittedProperties(target: object, omit: string | Union);

//---------------------------------------------------------------------------
// Debugging
//---------------------------------------------------------------------------
extern dec inspectType(target: unknown, text: string);
extern dec inspectTypeName(target: unknown, text: string);