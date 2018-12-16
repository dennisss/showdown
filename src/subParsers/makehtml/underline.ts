import { escapeCharactersCallback } from '../../helpers';
import { ConverterGlobals, ConverterOptions } from '../../types';

export function makehtml_underline (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';

  if (!options.underline) {
    return text;
  }

  text = globals.converter._dispatch('makehtml.underline.before', text, options, globals).getText();

  if (options.literalMidWordUnderscores) {
    text = text.replace(/\b___(\S[\s\S]*?)___\b/g, function (wm, txt) {
      return '<u>' + txt + '</u>';
    });
    text = text.replace(/\b__(\S[\s\S]*?)__\b/g, function (wm, txt) {
      return '<u>' + txt + '</u>';
    });
  } else {
    text = text.replace(/___(\S[\s\S]*?)___/g, function (wm, m) {
      return (/\S$/.test(m)) ? '<u>' + m + '</u>' : wm;
    });
    text = text.replace(/__(\S[\s\S]*?)__/g, function (wm, m) {
      return (/\S$/.test(m)) ? '<u>' + m + '</u>' : wm;
    });
  }

  // escape remaining underscores to prevent them being parsed by italic and bold
  text = text.replace(/(_)/g, escapeCharactersCallback);

  text = globals.converter._dispatch('makehtml.underline.after', text, options, globals).getText();

  return text;
}
