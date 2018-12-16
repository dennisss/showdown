
import { Converter } from './converter';
import * as helpers from './helpers';
import { showdown } from './showdown';

let win: Window;
let doc: Document;
if (typeof document === 'undefined' && typeof window === 'undefined') {
  var jsdom = require('jsdom'); // tslint:disable-line
  win = new jsdom.JSDOM('', {}).window;
  doc = win.document;
  global.document = doc;
} else {
  win = window;
  doc = document;
}

export default {
  Converter,
  helper: {
    document: doc,
    ...helpers
  },
  ...showdown
};
