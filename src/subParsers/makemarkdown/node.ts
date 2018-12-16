import { isComment, isElement, isText } from '../../node_helpers';
import { makeMarkdown_blockquote } from './blockquote';
import { makeMarkdown_codeBlock } from './codeBlock';
import { makeMarkdown_codeSpan } from './codeSpan';
import { makeMarkdown_emphasis } from './emphasis';
import { makeMarkdown_header } from './header';
import { makeMarkdown_hr } from './hr';
import { makeMarkdown_image } from './image';
import { makeMarkdown_links } from './links';
import { makeMarkdown_list } from './list';
import { makeMarkdown_paragraph } from './paragraph';
import { makeMarkdown_pre } from './pre';
import { makeMarkdown_strikethrough } from './strikethrough';
import { makeMarkdown_strong } from './strong';
import { makeMarkdown_table } from './table';
import { makeMarkdown_txt } from './txt';

export function makeMarkdown_node (node: Node, globals: any, spansOnly?: boolean) {
  'use strict';

  spansOnly = spansOnly || false;

  var txt = '';

  // edge case of text without wrapper paragraph
  if (isText(node)) {
    return makeMarkdown_txt(node, globals);
  }

  // HTML comment
  if (isComment(node)) {
    return '<!--' + node.data + '-->\n\n';
  }

  // process only node elements
  if (!isElement(node)) {
    return '';
  }

  var tagName = node.tagName.toLowerCase();

  switch (tagName) {

    //
    // BLOCKS
    //
    case 'h1':
      if (!spansOnly) { txt = makeMarkdown_header(node, globals, 1) + '\n\n'; }
      break;
    case 'h2':
      if (!spansOnly) { txt = makeMarkdown_header(node, globals, 2) + '\n\n'; }
      break;
    case 'h3':
      if (!spansOnly) { txt = makeMarkdown_header(node, globals, 3) + '\n\n'; }
      break;
    case 'h4':
      if (!spansOnly) { txt = makeMarkdown_header(node, globals, 4) + '\n\n'; }
      break;
    case 'h5':
      if (!spansOnly) { txt = makeMarkdown_header(node, globals, 5) + '\n\n'; }
      break;
    case 'h6':
      if (!spansOnly) { txt = makeMarkdown_header(node, globals, 6) + '\n\n'; }
      break;

    case 'p':
      if (!spansOnly) { txt = makeMarkdown_paragraph(node, globals) + '\n\n'; }
      break;

    case 'blockquote':
      if (!spansOnly) { txt = makeMarkdown_blockquote(node, globals) + '\n\n'; }
      break;

    case 'hr':
      if (!spansOnly) { txt = makeMarkdown_hr(node, globals) + '\n\n'; }
      break;

    case 'ol':
      if (!spansOnly) { txt = makeMarkdown_list(node, globals, 'ol') + '\n\n'; }
      break;

    case 'ul':
      if (!spansOnly) { txt = makeMarkdown_list(node, globals, 'ul') + '\n\n'; }
      break;

    case 'precode':
      if (!spansOnly) { txt = makeMarkdown_codeBlock(node, globals) + '\n\n'; }
      break;

    case 'pre':
      if (!spansOnly) { txt = makeMarkdown_pre(node, globals) + '\n\n'; }
      break;

    case 'table':
      if (!spansOnly) { txt = makeMarkdown_table(node, globals) + '\n\n'; }
      break;

    //
    // SPANS
    //
    case 'code':
      txt = makeMarkdown_codeSpan(node, globals);
      break;

    case 'em':
    case 'i':
      txt = makeMarkdown_emphasis(node, globals);
      break;

    case 'strong':
    case 'b':
      txt = makeMarkdown_strong(node, globals);
      break;

    case 'del':
      txt = makeMarkdown_strikethrough(node, globals);
      break;

    case 'a':
      txt = makeMarkdown_links(node, globals);
      break;

    case 'img':
      txt = makeMarkdown_image(node, globals);
      break;

    default:
      txt = node.outerHTML + '\n\n';
  }

  // common normalization
  // TODO eventually

  return txt;
}
