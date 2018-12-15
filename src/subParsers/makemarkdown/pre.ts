export function makeMarkdown_pre (node: Element, globals: any) {
  'use strict';

  var num  = parseInt(node.getAttribute('prenum') || '');
  return '<pre>' + globals.preList[num] + '</pre>';
}
