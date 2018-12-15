import { makeMarkdown_node } from './node';
import { ConverterGlobals } from '../../types';

export function makeMarkdown_emphasis (node: Element, globals: ConverterGlobals) {
  'use strict';

  var txt = '';
  if (node.hasChildNodes()) {
    txt += '*';
    var children = node.childNodes,
        childrenLength = children.length;
    for (var i = 0; i < childrenLength; ++i) {
      txt += makeMarkdown_node(children[i], globals);
    }
    txt += '*';
  }
  return txt;
}
