export function makeMarkdown_codeSpan (node: Node) {
  'use strict';

  return '`' + node.innerHTML + '`';
}
