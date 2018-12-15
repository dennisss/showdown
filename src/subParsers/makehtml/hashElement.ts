import { ConverterOptions, ConverterGlobals } from '../../types';

export function makehtml_hashElement (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';

  return function (wholeMatch: string, m1: string) {
    var blockText = m1;

    // Undo double lines
    blockText = blockText.replace(/\n\n/g, '\n');
    blockText = blockText.replace(/^\n/, '');

    // strip trailing blank lines
    blockText = blockText.replace(/\n+$/g, '');

    // Replace the element text with a marker ("¨KxK" where x is its key)
    blockText = '\n\n¨K' + (globals.gHtmlBlocks.push(blockText) - 1) + 'K\n\n';

    return blockText;
  };
}
