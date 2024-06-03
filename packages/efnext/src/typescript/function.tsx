import { SourceNode } from "#jsx/jsx-runtime";
import { Model, Operation } from "@typespec/compiler";
import { Declaration } from "../framework/components/declaration.js";
import { Scope } from "../framework/components/scope.js";
import { Block } from "./block.js";
import { TypeExpression } from "./type-expression.js";
export interface FunctionProps {
  operation?: Operation;
  name?: string;
  children?: SourceNode[];
}

export function Function({ operation, name, children }: FunctionProps) {
  // todo: take an Operation type and emit an empty function based on that.
  const functionName = name ?? operation!.name;
  const parameters = operation?.parameters;
  const typeExpression = operation?.returnType ? (
    <>
      : <TypeExpression type={operation.returnType} />
    </>
  ) : (
    <></>
  );
  if (!children) {
    return (
      <Declaration name={functionName} refkey={operation?.name ?? functionName}>
        function {functionName} (
        <Function.Parameters parameters={parameters} />){typeExpression}
        <Block>
          <Function.Body />
        </Block>
      </Declaration>
    );
  }

  const parametersChild = children?.find((child) => (child as any).type === Function.Parameters);
  const bodyChild = children?.find((child) => (child as any).type === Function.Body);
  if (!parametersChild && !bodyChild) {
    // the direct children are the body...
    return (
      <Declaration name={functionName} refkey={operation?.name ?? functionName}>
        function {functionName}() {typeExpression}
        <Block>{children}</Block>
      </Declaration>
    );
  }
  return (
    <Declaration name={functionName} refkey={operation?.name ?? functionName}>
      function {functionName}({parametersChild}){typeExpression}
      <Block>
        <Scope name={functionName}>{bodyChild}</Scope>
      </Block>
    </Declaration>
  );
}

export interface FunctionParametersProps {
  parameters?: Model;
  children?: SourceNode[];
}

Function.Parameters = function Parameters({ parameters, children }: FunctionParametersProps) {
  if (children) {
    return children;
  } else {
    return <></>;
    // do the default thing.
  }
};

export interface FunctionBodyProps {
  operation?: Operation;
  children?: SourceNode[];
}

Function.Body = function Body({ operation, children }: FunctionBodyProps) {
  return children;
};

export interface FunctionSignatureProps {
  name?: string;
  operation?: Operation;
}

export function FunctionSignature({ operation, name }: FunctionSignatureProps) {
  const functionName = name ?? operation!.name;
  const parameters = operation?.parameters;
  const typeExpression = operation?.returnType ? (
    <>
      : <TypeExpression type={operation.returnType} />
    </>
  ) : (
    <></>
  );
  return (
    <>
      {functionName} (
      <Function.Parameters parameters={parameters} />){typeExpression}
    </>
  );
}
