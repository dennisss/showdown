
import { showdown } from './showdown';
import { Converter } from './converter';
import * as helpers from './helpers';

let win: Window;
let doc: Document;
if (typeof document === 'undefined' && typeof window === 'undefined') {
	var jsdom = require('jsdom');
	win = new jsdom.JSDOM('', {}).window; // jshint ignore:line
	doc = win.document;
	global.document = doc;
}
else {
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
}
