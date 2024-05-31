import { SourceNode } from "#jsx/jsx-runtime";

export interface ValueProps {
  jsValue?: unknown;
  tspValue?: unknown;
}

export function Value({ jsValue, tspValue }: ValueProps) {
  if (jsValue) {
    switch (typeof jsValue) {
      case "object":
        if (jsValue === null) {
          return "null";
        } else {
          return <ObjectValue jsValue={jsValue} />;
        }
    }
  }

  return `"Unknown Value"`;
}

export interface ObjectValueProps {
  jsValue?: object;
}
export function ObjectValue({ jsValue }: ObjectValueProps) {
  if (jsValue) {
    const entries = Object.entries(jsValue);

    // Had to do this to be able to render the empty object
    if (entries.length === 0) {
      return <>{"{ }"}</>;
    }

    const val = Object.entries(jsValue)
      .map(([key, jsPropValue]) => {
        return <ObjectValue.Property name={key} jsPropertyValue={jsPropValue} />;
      })
      .reduce((prev, curr) => {
        // This prevents a trailing comma
        if (!prev || prev.length === 0) {
          return [curr];
        }
        return [prev, ", ", curr];
      }, []); // no idea why this works, and why join doesn't.

    return val;
  }
  return <></>;
}

export interface ObjectValuePropertyProps {
  name?: string;
  value?: SourceNode;
  jsPropertyValue?: unknown;
}

ObjectValue.Property = function Property({
  name,
  jsPropertyValue,
  value,
}: ObjectValuePropertyProps) {
  // TODO: Revisit - Noy sure about this change TBH, If I passed the Reference as jsPropertyValue, it goes into an infinite loop "Maximum call stack size exceeded"
  if (value) {
    return (
      <>
        {name}: {value}
      </>
    );
  }
  return (
    <>
      {name}: <Value jsValue={jsPropertyValue} />
    </>
  );
};

export function NullValue() {
  return "null";
}
