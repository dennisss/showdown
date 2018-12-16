import { ConverterGlobals, ConverterOptions } from '../../types';
import { makehtml_codeSpans } from './codeSpans';
import { makehtml_ellipsis } from './ellipsis';
import { makehtml_emoji } from './emoji';
import { makehtml_encodeAmpsAndAngles } from './encodeAmpsAndAngles';
import { makehtml_encodeBackslashEscapes } from './encodeBackslashEscapes';
import { makehtml_escapeSpecialCharsWithinTagAttributes } from './escapeSpecialCharsWithinTagAttributes';
import { makehtml_hashHTMLSpans } from './hashHTMLSpans';
import { makehtml_images } from './images';
import { makehtml_italicsAndBold } from './italicsAndBold';
import { makehtml_links } from './links';
import { makehtml_strikethrough } from './strikethrough';
import { makehtml_underline } from './underline';

/**
 * These are all the transformations that occur *within* block-level
 * tags like paragraphs, headers, and list items.
 */
export function makehtml_spanGamut (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';

  text = globals.converter._dispatch('makehtml.span.before', text, options, globals).getText();

  text = makehtml_codeSpans(text, options, globals);
  text = makehtml_escapeSpecialCharsWithinTagAttributes(text, options, globals);
  text = makehtml_encodeBackslashEscapes(text, options, globals);

  // Process link and image tags. Images must come first,
  // because ![foo][f] looks like a link.
  text = makehtml_images(text, options, globals);

  text = globals.converter._dispatch('smakehtml.links.before', text, options, globals).getText();
  text = makehtml_links(text, options, globals);
  text = globals.converter._dispatch('smakehtml.links.after', text, options, globals).getText();

  //text = makehtml_autoLinks(text, options, globals);
  //text = makehtml_simplifiedAutoLinks(text, options, globals);
  text = makehtml_emoji(text, options, globals);
  text = makehtml_underline(text, options, globals);
  text = makehtml_italicsAndBold(text, options, globals);
  text = makehtml_strikethrough(text, options, globals);
  text = makehtml_ellipsis(text, options, globals);

  // we need to hash HTML tags inside spans
  text = makehtml_hashHTMLSpans(text, options, globals);

  // now we encode amps and angles
  text = makehtml_encodeAmpsAndAngles(text, options, globals);

  // Do hard breaks
  if (options.simpleLineBreaks) {
    // GFM style hard breaks
    // only add line breaks if the text does not contain a block (special case for lists)
    if (!/\n\n¨K/.test(text)) {
      text = text.replace(/\n+/g, '<br />\n');
    }
  } else {
    // Vanilla hard breaks
    text = text.replace(/  +\n/g, '<br />\n');
  }

  text = globals.converter._dispatch('makehtml.spanGamut.after', text, options, globals).getText();
  return text;
}
