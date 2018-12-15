import { ConverterOptions, ConverterGlobals } from '../../types';

/**
 * Convert all tabs to spaces
 */
export function makehtml_detab (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';
  text = globals.converter._dispatch('makehtml.detab.before', text, options, globals).getText();

  // expand first n-1 tabs
  text = text.replace(/\t(?=\t)/g, '    '); // g_tab_width

  // replace the nth with two sentinels
  text = text.replace(/\t/g, '¨A¨B');

  // use the sentinel to anchor our regex so it doesn't explode
  text = text.replace(/¨B(.+?)¨A/g, function (wholeMatch, m1) {
    var leadingText = m1,
        numSpaces = 4 - leadingText.length % 4;  // g_tab_width

    // there *must* be a better way to do this:
    for (var i = 0; i < numSpaces; i++) {
      leadingText += ' ';
    }

    return leadingText;
  });

  // clean up sentinels
  text = text.replace(/¨A/g, '    ');  // g_tab_width
  text = text.replace(/¨B/g, '');

  text = globals.converter._dispatch('makehtml.detab.after', text, options, globals).getText();
  return text;
}
