import { replaceRecursiveRegExp } from '../../helpers';
import { ConverterGlobals, ConverterOptions } from '../../types';
import { makehtml_encodeCode } from './encodeCode';

/**
 * Hash and escape <code> elements that should not be parsed as markdown
 */
export function makehtml_hashCodeTags (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';
  text = globals.converter._dispatch('makehtml.hashCodeTags.before', text, options, globals).getText();

  var repFunc = function (wholeMatch: string, match: string, left: string, right: string) {
    var codeblock = left + makehtml_encodeCode(match, options, globals) + right;
    return '¨C' + (globals.gHtmlSpans.push(codeblock) - 1) + 'C';
  };

  // Hash naked <code>
  text = replaceRecursiveRegExp(text, repFunc, '<code\\b[^>]*>', '</code>', 'gim');

  text = globals.converter._dispatch('makehtml.hashCodeTags.after', text, options, globals).getText();
  return text;
}
