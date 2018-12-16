import { ConverterGlobals } from '../../types';
import { makeMarkdown_node } from './node';

export function makeMarkdown_header (node: Element, globals: ConverterGlobals, headerLevel: number) {
  'use strict';

  var headerMark = new Array(headerLevel + 1).join('#'),
      txt = '';

  if (node.hasChildNodes()) {
    txt = headerMark + ' ';
    var children = node.childNodes,
        childrenLength = children.length;

    for (var i = 0; i < childrenLength; ++i) {
      txt += makeMarkdown_node(children[i], globals);
    }
  }
  return txt;
}
