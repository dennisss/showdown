import { makeMarkdown_node } from './node';

export function makeMarkdown_paragraph (node, globals) {
  'use strict';

  var txt = '';
  if (node.hasChildNodes()) {
    var children = node.childNodes,
        childrenLength = children.length;
    for (var i = 0; i < childrenLength; ++i) {
      txt += makeMarkdown_node(children[i], globals);
    }
  }

  // some text normalization
  txt = txt.trim();

  return txt;
}
