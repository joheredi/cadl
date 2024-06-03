import { ComponentChild, ComponentChildren, FunctionComponent, SourceNode } from "#jsx/jsx-runtime";
import { useContext } from "./context.js";
import { MetaNode, getMeta } from "./metatree.js";
import { TaskQueueContext } from "./task-queue.js";

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

export async function render(root: SourceNode): Promise<RenderedTreeNode> {
  // todo: check for forward progress.
  // I /think/ this should work to ensure render doesn't resolve until
  // all async work called from render finishes. But, it won't work
  // for any async work that is queued as a result of an resolution.
  const taskQueue = useContext(TaskQueueContext);
  if (!taskQueue) {
    throw new Error("Need task queue context to render");
  }

  const res = renderWorker(root);
  await taskQueue.wait();

  return res;
}
function renderWorker(root: SourceNode): RenderedTreeNode {
  const taskQueue = useContext(TaskQueueContext);
  if (!taskQueue) {
    throw new Error("Need task queue context to render");
  }

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
    const task = children.then((children) => {
      handleChildren(node, children);
    });
    taskQueue.enqueue(task);
  } else {
    handleChildren(node, children);
  }

  renderContext = oldContext;

  return node;
}

function handleChildren(node: RenderedTreeNode, children: ComponentChildren) {
  const taskQueue = useContext(TaskQueueContext);

  if (!taskQueue) {
    throw new Error("Need task queue context to render");
  }

  if (!Array.isArray(children)) {
    children = [children];
  }

  children = children.flat(Infinity);

  for (const child of children) {
    if (isSourceNode(child)) {
      const childRender = renderWorker(child);
      node.push(childRender);
    } else if (child instanceof Promise) {
      const index = node.push("{ pending }");
      const task = child.then((v) => {
        node[index - 1] = v;
      });
      taskQueue.enqueue(task);
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
