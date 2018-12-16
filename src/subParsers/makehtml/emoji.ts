import { emojis, isUndefined } from '../../helpers';
import { ConverterGlobals, ConverterOptions } from '../../types';

/**
 * Turn emoji codes into emojis
 *
 * List of supported emojis: https://github.com/showdownjs/showdown/wiki/Emojis
 */
export function makehtml_emoji (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';

  if (!options.emoji) {
    return text;
  }

  text = globals.converter._dispatch('makehtml.emoji.before', text, options, globals).getText();

  var emojiRgx = /:([\S]+?):/g;

  text = text.replace(emojiRgx, function (wm, emojiCode) {
    let em = emojis[emojiCode];
    if (!isUndefined(em)) {
      return em;
    }
    return wm;
  });

  text = globals.converter._dispatch('makehtml.emoji.after', text, options, globals).getText();

  return text;
}
