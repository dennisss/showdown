import { ConverterGlobals, ConverterOptions } from '../../types';

/**
 * Smart processing for ampersands and angle brackets that need to be encoded.
 */
export function makehtml_encodeAmpsAndAngles (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';
  text = globals.converter._dispatch('makehtml.encodeAmpsAndAngles.before', text, options, globals).getText();

  // Ampersand-encoding based entirely on Nat Irons's Amputator MT plugin:
  // http://bumppo.net/projects/amputator/
  text = text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g, '&amp;');

  // Encode naked <'s
  text = text.replace(/<(?![a-z\/?$!])/gi, '&lt;');

  // Encode <
  text = text.replace(/</g, '&lt;');

  // Encode >
  text = text.replace(/>/g, '&gt;');

  text = globals.converter._dispatch('makehtml.encodeAmpsAndAngles.after', text, options, globals).getText();
  return text;
}
