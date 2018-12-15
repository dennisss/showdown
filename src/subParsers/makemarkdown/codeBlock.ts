export function makeMarkdown_codeBlock (node: Element, globals: any) {
  'use strict';

  var lang = node.getAttribute('language'),
      numStr  = node.getAttribute('precodenum');

  let num = parseInt(numStr || '');
    
  return '```' + lang + '\n' + globals.preList[num] + '\n```';
}
