import { ConverterGlobals, ConverterOptions } from '../../types';

/**
 * Swap back in all the special characters we've hidden.
 */
export function makehtml_unescapeSpecialChars (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';
  text = globals.converter._dispatch('makehtml.unescapeSpecialChars.before', text, options, globals).getText();

  text = text.replace(/¨E(\d+)E/g, function (wholeMatch, m1) {
    var charCodeToReplace = parseInt(m1);
    return String.fromCharCode(charCodeToReplace);
  });

  text = globals.converter._dispatch('makehtml.unescapeSpecialChars.after', text, options, globals).getText();
  return text;
}
