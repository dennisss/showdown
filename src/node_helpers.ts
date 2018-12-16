
export function isText (node: Node): node is Text {
  return node.nodeType === 3;
}

export function isComment (node: Node): node is Comment {
  return node.nodeType === 8;
}

export function isElement (node: Node): node is Element {
  return node.nodeType === 1;
}

