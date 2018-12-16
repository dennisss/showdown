import { escapeCharacters, escapeCharactersCallback, isString, isUndefined, regexes } from '../../helpers';
import { ConverterGlobals, ConverterOptions } from '../../types';

/**
 * Turn Markdown image shortcuts into <img> tags.
 */
export function makehtml_images (text: string, options: ConverterOptions, globals: ConverterGlobals) {
  'use strict';

  text = globals.converter._dispatch('makehtml.images.before', text, options, globals).getText();

  var inlineRegExp      = /!\[([^\]]*?)][ \t]*()\([ \t]?<?([\S]+?(?:\([\S]*?\)[\S]*?)?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,
      crazyRegExp       = /!\[([^\]]*?)][ \t]*()\([ \t]?<([^>]*)>(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(?:(["'])([^"]*?)\6))?[ \t]?\)/g,
      base64RegExp      = /!\[([^\]]*?)][ \t]*()\([ \t]?<?(data:.+?\/.+?;base64,[A-Za-z0-9+/=\n]+?)>?(?: =([*\d]+[A-Za-z%]{0,4})x([*\d]+[A-Za-z%]{0,4}))?[ \t]*(?:(["'])([^"]*?)\6)?[ \t]?\)/g,
      referenceRegExp   = /!\[([^\]]*?)] ?(?:\n *)?\[([\s\S]*?)]()()()()()/g,
      refShortcutRegExp = /!\[([^\[\]]+)]()()()()()/g;

  function writeImageTagBase64 (wholeMatch: string, altText: string, linkId: string, url: string, width: string, height: string, m5: string, title: string) {
    url = url.replace(/\s/g, '');
    return writeImageTag (wholeMatch, altText, linkId, url, width, height, m5, title);
  }

  function writeImageTag (wholeMatch: string, altText: string, linkId: string, url: string, width: string, height: string, m5: string, title: string) {

    var gUrls   = globals.gUrls,
        gTitles = globals.gTitles,
        gDims   = globals.gDimensions;

    linkId = linkId.toLowerCase();

    if (!title) {
      title = '';
    }
    // Special case for explicit empty url
    if (wholeMatch.search(/\(<?\s*>? ?(['"].*['"])?\)$/m) > -1) {
      url = '';

    } else if (url === '' || url === null) {
      if (linkId === '' || linkId === null) {
        // lower-case and turn embedded newlines into spaces
        linkId = altText.toLowerCase().replace(/ ?\n/g, ' ');
      }
      url = '#' + linkId;

      let gurl = gUrls[linkId];
      if (!isUndefined(gurl)) {
        url = gurl;

        let gtitle = gTitles[linkId];
        if (!isUndefined(gtitle)) {
          title = gtitle;
        }

        let gdim = gDims[linkId];
        if (!isUndefined(gdim)) {
          width = gdim.width;
          height = gdim.height;
        }
      } else {
        return wholeMatch;
      }
    }

    altText = altText
      .replace(/"/g, '&quot;')
    //altText = escapeCharacters(altText, '*_', false);
      .replace(regexes.asteriskDashTildeAndColon, escapeCharactersCallback);
    //url = escapeCharacters(url, '*_', false);
    url = url.replace(regexes.asteriskDashTildeAndColon, escapeCharactersCallback);
    var result = '<img src="' + url + '" alt="' + altText + '"';

    if (title && isString(title)) {
      title = title
        .replace(/"/g, '&quot;')
      //title = escapeCharacters(title, '*_', false);
        .replace(regexes.asteriskDashTildeAndColon, escapeCharactersCallback);
      result += ' title="' + title + '"';
    }

    if (width && height) {
      width  = (width === '*') ? 'auto' : width;
      height = (height === '*') ? 'auto' : height;

      result += ' width="' + width + '"';
      result += ' height="' + height + '"';
    }

    result += ' />';

    return result;
  }

  // First, handle reference-style labeled images: ![alt text][id]
  text = text.replace(referenceRegExp, writeImageTag);

  // Next, handle inline images:  ![alt text](url =<width>x<height> "optional title")

  // base64 encoded images
  text = text.replace(base64RegExp, writeImageTagBase64);

  // cases with crazy urls like ./image/cat1).png
  text = text.replace(crazyRegExp, writeImageTag);

  // normal cases
  text = text.replace(inlineRegExp, writeImageTag);

  // handle reference-style shortcuts: ![img text]
  text = text.replace(refShortcutRegExp, writeImageTag);

  text = globals.converter._dispatch('makehtml.images.after', text, options, globals).getText();
  return text;
}
