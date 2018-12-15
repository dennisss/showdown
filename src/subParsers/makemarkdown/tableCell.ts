import { makeMarkdown_node } from './node';

export function makeMarkdown_tableCell (node: Node, globals: any) {
  'use strict';

  var txt = '';
  if (!node.hasChildNodes()) {
    return '';
  }
  var children = node.childNodes,
      childrenLength = children.length;

  for (var i = 0; i < childrenLength; ++i) {
    txt += makeMarkdown_node(children[i], globals, true);
  }
  return txt.trim();
}
