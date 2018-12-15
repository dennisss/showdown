export function makeMarkdown_pre (node: Node, globals: any) {
  'use strict';

  var num  = node.getAttribute('prenum');
  return '<pre>' + globals.preList[num] + '</pre>';
}
