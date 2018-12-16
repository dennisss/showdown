import { ConverterGlobals, ConverterOptions } from '../../types';
import { makehtml_encodeCode } from './encodeCode';
import { makehtml_hashHTMLSpans } from './hashHTMLSpans';

/**
 *
 *   *  Backtick quotes are used for <code></code> spans.
 *
 *   *  You can use multiple backticks as the delimiters if you want to
 *     include literal backticks in the code span. So, this input:
 *
 *         Just type ``foo `bar` baz`` at the prompt.
 *
 *       Will translate to:
 *
 *         <p>Just type <code>foo `bar` baz</code> at the prompt.</p>
 *
 *    There's no arbitrary limit to the number of backticks you
 *    can use as delimters. If you need three consecutive backticks
 *    in your code, use four for delimiters, etc.
 *
 *  *  You can use spaces to get literal backticks at the edges:
 *
 *         ... type `` `bar` `` ...
 *
 *       Turns to:
 *
 *         ... type <code>`bar`</code> ...
 */
export function makehtml_codeSpans (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';

  text = globals.converter._dispatch('makehtml.codeSpans.before', text, options, globals).getText();

  if (typeof(text) === 'undefined') {
    text = '';
  }
  text = text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,
    function (wholeMatch: string, m1: string, m2: string, m3: string) {
      var c = m3;
      c = c.replace(/^([ \t]*)/g, '');	// leading whitespace
      c = c.replace(/[ \t]*$/g, '');	// trailing whitespace
      c = makehtml_encodeCode(c, options, globals);
      c = m1 + '<code>' + c + '</code>';
      c = makehtml_hashHTMLSpans(c, options, globals);
      return c;
    }
  );

  text = globals.converter._dispatch('makehtml.codeSpans.after', text, options, globals).getText();
  return text;
}
