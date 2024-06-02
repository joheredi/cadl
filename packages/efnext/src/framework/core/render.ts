import { ComponentChild, ComponentChildren, FunctionComponent, SourceNode } from "#jsx/jsx-runtime";
import { MetaNode, getMeta } from "./metatree.js";

export interface RenderContext {
  node?: RenderedTreeNode;
  meta?: MetaNode;
}

let renderContext: RenderContext = {
  node: undefined,
  meta: undefined,
};

export function getRenderContext() {
  return renderContext;
}

export type RenderedTreeNode = (string | RenderedTreeNode)[];

const intrinsicMap: Record<string, string> = {
  rb: "}",
  lb: "{",
  br: "\n",
};

export function render(root: SourceNode, unsettledPromises: Promise<any>[]): RenderedTreeNode {
  if (isIntrinsicComponent(root)) {
    return [intrinsicMap[root.type]];
  }

  assertIsFunctionComponent(root);
  const node: RenderedTreeNode = [];
  const meta = getMeta(node);
  meta.parent = renderContext.meta;
  const oldContext = renderContext;
  renderContext = {
    meta,
    node,
  };

  let children = root.type(root.props);
  if (children instanceof Promise) {
    const unsettledPromise = children.then((children) => {
      handleChildren(node, children, unsettledPromises);
    });
    unsettledPromises.push(unsettledPromise);
  } else {
    handleChildren(node, children, unsettledPromises);
  }

  renderContext = oldContext;

  return node;
}

function handleChildren(
  node: RenderedTreeNode,
  children: ComponentChildren,
  unsettledPromises: Promise<any>[]
) {
  if (!Array.isArray(children)) {
    children = [children];
  }

  children = children.flat(Infinity);

  for (const child of children) {
    if (isSourceNode(child)) {
      const childRender = render(child, unsettledPromises);
      node.push(childRender);
    } else if (child instanceof Promise) {
      const index = node.push("{ pending }");
      const unsettledPromise = child.then((v) => {
        node[index - 1] = v;
      });

      unsettledPromises.push(unsettledPromise);
    } else if (child === undefined || child === null || typeof child === "boolean") {
      continue;
    } else {
      node.push(String(child));
    }
  }
}
function isIntrinsicComponent(node: SourceNode): node is SourceNode & { type: string } {
  return typeof node.type === "string";
}

function assertIsFunctionComponent(
  node: SourceNode
): asserts node is SourceNode & { type: FunctionComponent } {
  if (typeof node.type !== "function") {
    throw new Error("Expected function component");
  }
}

function isSourceNode(element: ComponentChild): element is SourceNode {
  return typeof element === "object" && element !== null && Object.hasOwn(element, "type");
}
