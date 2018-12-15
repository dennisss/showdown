import { ConverterOptions, ConverterGlobals } from '../../types';

export function makehtml_hashBlock (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';
  text = globals.converter._dispatch('makehtml.hashBlock.before', text, options, globals).getText();
  text = text.replace(/(^\n+|\n+$)/g, '');
  text = '\n\n¨K' + (globals.gHtmlBlocks.push(text) - 1) + 'K\n\n';
  text = globals.converter._dispatch('makehtml.hashBlock.after', text, options, globals).getText();
  return text;
}
