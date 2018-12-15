import { makehtml_outdent } from './outdent';
import { makehtml_encodeCode } from './encodeCode';
import { makehtml_detab } from './detab';
import { makehtml_hashBlock } from './hashBlock';
import { ConverterOptions, ConverterGlobals } from '../../types';

/**
 * Process Markdown `<pre><code>` blocks.
 */
export function makehtml_codeBlocks (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';

  text = globals.converter._dispatch('makehtml.codeBlocks.before', text, options, globals).getText();

  // sentinel workarounds for lack of \A and \Z, safari\khtml bug
  text += '¨0';

  var pattern = /(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=¨0))/g;
  text = text.replace(pattern, function (wholeMatch, m1, m2) {
    var codeblock = m1,
        nextChar = m2,
        end = '\n';

    codeblock = makehtml_outdent(codeblock, options, globals);
    codeblock = makehtml_encodeCode(codeblock, options, globals);
    codeblock = makehtml_detab(codeblock, options, globals);
    codeblock = codeblock.replace(/^\n+/g, ''); // trim leading newlines
    codeblock = codeblock.replace(/\n+$/g, ''); // trim trailing newlines

    if (options.omitExtraWLInCodeBlocks) {
      end = '';
    }

    codeblock = '<pre><code>' + codeblock + end + '</code></pre>';

    return makehtml_hashBlock(codeblock, options, globals) + nextChar;
  });

  // strip sentinel
  text = text.replace(/¨0/, '');

  text = globals.converter._dispatch('makehtml.codeBlocks.after', text, options, globals).getText();
  return text;
}
