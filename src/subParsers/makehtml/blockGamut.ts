import { makehtml_blockQuotes } from './blockQuotes';
import { makehtml_headers } from './headers';
import { makehtml_horizontalRule } from './horizontalRule';
import { makehtml_lists } from './lists';
import { makehtml_codeBlocks } from './codeBlocks';
import { makehtml_tables } from './tables';
import { makehtml_hashHTMLBlocks } from './hashHTMLBlocks';
import { makehtml_paragraphs } from './paragraphs';
import { ConverterOptions, ConverterGlobals } from '../../types';

/**
 * These are all the transformations that form block-level
 * tags like paragraphs, headers, and list items.
 */
export function makehtml_blockGamut (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';

  text = globals.converter._dispatch('makehtml.blockGamut.before', text, options, globals).getText();

  // we parse blockquotes first so that we can have headings and hrs
  // inside blockquotes
  text = makehtml_blockQuotes(text, options, globals);
  text = makehtml_headers(text, options, globals);

  // Do Horizontal Rules:
  text = makehtml_horizontalRule(text, options, globals);

  text = makehtml_lists(text, options, globals);
  text = makehtml_codeBlocks(text, options, globals);
  text = makehtml_tables(text, options, globals);

  // We already ran _HashHTMLBlocks() before, in Markdown(), but that
  // was to escape raw HTML in the original Markdown source. This time,
  // we're escaping the markup we've just created, so that we don't wrap
  // <p> tags around block-level tags.
  text = makehtml_hashHTMLBlocks(text, options, globals);
  text = makehtml_paragraphs(text, options, globals);

  text = globals.converter._dispatch('makehtml.blockGamut.after', text, options, globals).getText();

  return text;
}
