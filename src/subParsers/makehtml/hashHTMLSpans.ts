import { _hashHTMLSpan } from '../../helpers';
import { ConverterOptions, ConverterGlobals } from '../../types';

/**
 * Hash span elements that should not be parsed as markdown
 */
export function makehtml_hashHTMLSpans (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';
  text = globals.converter._dispatch('makehtml.hashHTMLSpans.before', text, options, globals).getText();

  // Hash Self Closing tags
  text = text.replace(/<[^>]+?\/>/gi, function (wm) {
    return _hashHTMLSpan(wm, globals);
  });

  // Hash tags without properties
  text = text.replace(/<([^>]+?)>[\s\S]*?<\/\1>/g, function (wm) {
    return _hashHTMLSpan(wm, globals);
  });

  // Hash tags with properties
  text = text.replace(/<([^>]+?)\s[^>]+?>[\s\S]*?<\/\1>/g, function (wm) {
    return _hashHTMLSpan(wm, globals);
  });

  // Hash self closing tags without />
  text = text.replace(/<[^>]+?>/gi, function (wm) {
    return _hashHTMLSpan(wm, globals);
  });

  text = globals.converter._dispatch('makehtml.hashHTMLSpans.after', text, options, globals).getText();
  return text;
}

/**
 * Unhash HTML spans
 */
export function makehtml_unhashHTMLSpans (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';
  text = globals.converter._dispatch('makehtml.unhashHTMLSpans.before', text, options, globals).getText();

  for (var i = 0; i < globals.gHtmlSpans.length; ++i) {
    var repText = globals.gHtmlSpans[i],
        // limiter to prevent infinite loop (assume 10 as limit for recurse)
        limit = 0;

    while (/¨C(\d+)C/.test(repText)) {
      var num = RegExp.$1;
      repText = repText.replace('¨C' + num + 'C', globals.gHtmlSpans[num]);
      if (limit === 10) {
        console.error('maximum nesting of 10 spans reached!!!');
        break;
      }
      ++limit;
    }
    text = text.replace('¨C' + i + 'C', repText);
  }

  text = globals.converter._dispatch('makehtml.unhashHTMLSpans.after', text, options, globals).getText();
  return text;
}
