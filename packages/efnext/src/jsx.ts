export interface FunctionComponent {
  // seems like react lets you just return children here, so even
  // though my instinct is to return SourceNode here, that seems to not work.
  (props: ComponentProps): ComponentChildren;
}

export interface SourceNode {
  type: FunctionComponent | string;
  props: ComponentProps;
}

export type ComponentChild = SourceNode | string | number | boolean | null | undefined;
export type ComponentChildren = ComponentChild | ComponentChild[];
export type ComponentProps = Record<string, any> & { children?: ComponentChildren };

export function jsx(component: FunctionComponent, props?: Record<string, any>): SourceNode {
  return createSourceElement(component, props);
}

export function Fragment(props: ComponentProps): ComponentChildren {
  return props.children;
}

export function jsxs(component: FunctionComponent, props?: Record<string, any>): SourceNode {
  return createSourceElement(component, props);
}

function createSourceElement(
  type: FunctionComponent | string,
  props?: Record<string, any>
): SourceNode {
  return {
    type,
    props: props ?? {},
  };
}
