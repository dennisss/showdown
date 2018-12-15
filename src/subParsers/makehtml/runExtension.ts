import { ConverterOptions, ConverterGlobals, ShowdownExtension } from '../../types';

/**
 * Run extension
 */
export function makehtml_runExtension (ext: ShowdownExtension, text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';

  if (ext.filter) {
    text = ext.filter(text, globals.converter, options);

  } else if (ext.regex) {
    // TODO remove this when old extension loading mechanism is deprecated
    var re = ext.regex;
    if (!(re instanceof RegExp)) {
      re = new RegExp(re, 'g');
    }
    text = text.replace(re, ext.replace);
  }

  return text;
}
