import { replaceRecursiveRegExp } from '../../helpers';
import { makehtml_encodeCode } from './encodeCode';
import { ConverterOptions, ConverterGlobals } from '../../types';

/**
 * Hash and escape <pre><code> elements that should not be parsed as markdown
 */
export function makehtml_hashPreCodeTags (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';
  text = globals.converter._dispatch('makehtml.hashPreCodeTags.before', text, options, globals).getText();

  var repFunc = function (wholeMatch: string, match: string, left: string, right: string) {
    // encode html entities
    var codeblock = left + makehtml_encodeCode(match, options, globals) + right;
    return '\n\n¨G' + (globals.ghCodeBlocks.push({text: wholeMatch, codeblock: codeblock}) - 1) + 'G\n\n';
  };

  // Hash <pre><code>
  text = replaceRecursiveRegExp(text, repFunc, '^ {0,3}<pre\\b[^>]*>\\s*<code\\b[^>]*>', '^ {0,3}</code>\\s*</pre>', 'gim');

  text = globals.converter._dispatch('makehtml.hashPreCodeTags.after', text, options, globals).getText();
  return text;
}
