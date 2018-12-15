import { ConverterGlobals } from '../../types';

export function makeMarkdown_codeSpan (node: Element, globals: ConverterGlobals) {
  'use strict';

  return '`' + node.innerHTML + '`';
}
