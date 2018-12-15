import { ConverterGlobals } from '../../types';
import { makeMarkdown_listItem } from './listItem';
import { isElement } from '../../node_helpers';

export function makeMarkdown_list (node: Element, globals: ConverterGlobals, type: 'ol'|'ul') {
  'use strict';

  var txt = '';
  if (!node.hasChildNodes()) {
    return '';
  }
  var listItems       = node.childNodes,
      listItemsLenght = listItems.length,
      listNum = parseInt(node.getAttribute('start') || '') || 1;

  for (var i = 0; i < listItemsLenght; ++i) {
    let li = listItems[i];
    if (!isElement(li)) {
      continue;
    }

    if (typeof li.tagName === 'undefined' || li.tagName.toLowerCase() !== 'li') {
      continue;
    }

    // define the bullet to use in list
    var bullet = '';
    if (type === 'ol') {
      bullet = listNum.toString() + '. ';
    } else {
      bullet = '- ';
    }

    // parse list item
    txt += bullet + makeMarkdown_listItem(li, globals);
    ++listNum;
  }

  return txt.trim();
}
