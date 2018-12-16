import { ConverterGlobals, ConverterOptions } from '../../types';

/**
 * Remove one level of line-leading tabs or spaces
 */
export function makehtml_outdent (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';
  text = globals.converter._dispatch('makehtml.outdent.before', text, options, globals).getText();

  // attacklab: hack around Konqueror 3.5.4 bug:
  // "----------bug".replace(/^-/g,"") == "bug"
  text = text.replace(/^(\t|[ ]{1,4})/gm, '¨0'); // attacklab: g_tab_width

  // attacklab: clean up hack
  text = text.replace(/¨0/g, '');

  text = globals.converter._dispatch('makehtml.outdent.after', text, options, globals).getText();
  return text;
}
