import { ConverterGlobals, ConverterOptions } from '../../types';

export function makehtml_ellipsis (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';

  text = globals.converter._dispatch('makehtml.ellipsis.before', text, options, globals).getText();

  text = text.replace(/\.\.\./g, '…');

  text = globals.converter._dispatch('makehtml.ellipsis.after', text, options, globals).getText();

  return text;
}
