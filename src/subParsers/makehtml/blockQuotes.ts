import { makehtml_githubCodeBlocks } from './githubCodeBlocks';
import { makehtml_blockGamut } from './blockGamut';
import { makehtml_hashBlock } from './hashBlock';
import { ConverterOptions, ConverterGlobals } from '../../types';

export function makehtml_blockQuotes (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';

  text = globals.converter._dispatch('makehtml.blockQuotes.before', text, options, globals).getText();

  // add a couple extra lines after the text and endtext mark
  text = text + '\n\n';

  var rgx = /(^ {0,3}>[ \t]?.+\n(.+\n)*\n*)+/gm;

  if (options.splitAdjacentBlockquotes) {
    rgx = /^ {0,3}>[\s\S]*?(?:\n\n)/gm;
  }

  text = text.replace(rgx, function (bq) {
    // attacklab: hack around Konqueror 3.5.4 bug:
    // "----------bug".replace(/^-/g,"") == "bug"
    bq = bq.replace(/^[ \t]*>[ \t]?/gm, ''); // trim one level of quoting

    // attacklab: clean up hack
    bq = bq.replace(/¨0/g, '');

    bq = bq.replace(/^[ \t]+$/gm, ''); // trim whitespace-only lines
    bq = makehtml_githubCodeBlocks(bq, options, globals);
    bq = makehtml_blockGamut(bq, options, globals); // recurse

    bq = bq.replace(/(^|\n)/g, '$1  ');
    // These leading spaces screw with <pre> content, so we need to fix that:
    bq = bq.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm, function (wholeMatch, m1) {
      var pre = m1;
      // attacklab: hack around Konqueror 3.5.4 bug:
      pre = pre.replace(/^  /mg, '¨0');
      pre = pre.replace(/¨0/g, '');
      return pre;
    });

    return makehtml_hashBlock('<blockquote>\n' + bq + '\n</blockquote>', options, globals);
  });

  text = globals.converter._dispatch('makehtml.blockQuotes.after', text, options, globals).getText();
  return text;
}
