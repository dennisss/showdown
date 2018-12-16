import { Event, EventParams, forEach, isArray, isString, isUndefined, stdExtName, unescapeHTMLEntities } from './helpers';
import { isText } from './node_helpers';
import { privateGlobals, showdown, validate } from './showdown';
import { makehtml_blockGamut } from './subParsers/makehtml/blockGamut';
import { makehtml_completeHTMLDocument } from './subParsers/makehtml/completeHTMLDocument';
import { makehtml_detab } from './subParsers/makehtml/detab';
import { makehtml_githubCodeBlocks } from './subParsers/makehtml/githubCodeBlocks';
import { makehtml_hashCodeTags } from './subParsers/makehtml/hashCodeTags';
import { makehtml_hashHTMLBlocks } from './subParsers/makehtml/hashHTMLBlocks';
import { makehtml_unhashHTMLSpans } from './subParsers/makehtml/hashHTMLSpans';
import { makehtml_hashPreCodeTags } from './subParsers/makehtml/hashPreCodeTags';
import { makehtml_metadata } from './subParsers/makehtml/metadata';
import { makehtml_runExtension } from './subParsers/makehtml/runExtension';
import { makehtml_stripLinkDefinitions } from './subParsers/makehtml/stripLinkDefinitions';
import { makehtml_unescapeSpecialChars } from './subParsers/makehtml/unescapeSpecialChars';
import { makeMarkdown_node } from './subParsers/makemarkdown/node';
import { ConverterGlobals, ConverterOptions, Optional, ShowdownExtension, ShowdownOptions } from './types';

/**
 * Created by Estevao on 31-05-2015.
 */


function rTrimInputText (text: string) {
  var rsp = text.match(/^\s*/)![0].length,
      rgx = new RegExp('^\\s{0,' + rsp + '}', 'gm');
  return text.replace(rgx, '');
}

export type EventListener = (e: Event) => string|void|undefined;


/**
 * Showdown Converter class
 * @class
 * @param {object} [converterOptions]
 * @returns {Converter}
 */
export class Converter {

  /**
   * Options used by this converter
   * @private
   * @type {{}}
   */
  private options: ConverterOptions;

  /**
   * Language extensions used by this converter
   * @private
   * @type {Array}
   */
  private langExtensions: ShowdownExtension[] = [];

  /**
   * Output modifiers extensions used by this converter
   * @private
   * @type {Array}
   */
  private outputModifiers: ShowdownExtension[] = [];

  /**
   * Event listeners
   * @private
   * @type {{}}
   */
  private listeners: { [name: string]: EventListener[]|undefined; } = {};

  /**
   * The flavor set in this converter
   */
  private setConvFlavor = privateGlobals.setFlavor;

  /**
   * Metadata of the document
   * @type {{parsed: {}, raw: string, format: string}}
   */
  public metadata: ConverterGlobals['metadata'] = {
    parsed: {},
    raw: '',
    format: ''
  };

  /**
   * Converter constructor
   * @private
   */
  constructor (converterOptions: Optional<ConverterOptions> = {}) {
    if (typeof converterOptions !== 'object') {
      throw Error('Converter expects the passed parameter to be an object, but ' + typeof converterOptions +
      ' was passed instead.');
    }

    // Initialize with copy of global options merged with
    this.options = {
      ...privateGlobals.globalOptions,
      ...converterOptions
    };

    if (this.options.extensions) {
      if (!isArray(this.options.extensions)) {
        this.options.extensions = [this.options.extensions];
      }

      forEach(this.options.extensions, (ext: string) => this._parseExtension(ext));
    }
  }

  /**
   * Parse extension
   * @param {*} ext
   * @param {string} [name='']
   * @private
   */
  private _parseExtension (ext: (() => ShowdownExtension)|ShowdownExtension[]|ShowdownExtension|string, name?: string|null) {

    name = name || null;

    // If it's a string, the extension was previously loaded
    if (isString(ext)) {
      ext = stdExtName(ext);
      name = ext;

      // LEGACY_SUPPORT CODE
      let legacyExt = showdown.extensions[ext];
      if (!isUndefined(legacyExt)) {
        // tslint:disable-next-line
        console.warn('DEPRECATION WARNING: ' + ext + ' is an old extension that uses a deprecated loading method.' +
          'Please inform the developer that the extension should be updated!');
        this.legacyExtensionLoading(legacyExt, ext);
        return;
      // END LEGACY SUPPORT CODE

      } else {
        let globalExt = privateGlobals.extensions[ext];
        if (!isUndefined(globalExt)) {
          ext = globalExt;
        } else {
          throw Error('Extension "' + ext + '" could not be loaded. It was either not found or is not a valid extension.');
        }
      }
    }

    if (typeof ext === 'function') {
      ext = ext();
    }

    if (!isArray(ext)) {
      ext = [ext];
    }

    var validExt = validate(ext, name);
    if (!validExt.valid) {
      throw Error(validExt.error);
    }

    for (var i = 0; i < ext.length; ++i) {
      switch (ext[i].type) {

        case 'lang':
          this.langExtensions.push(ext[i]);
          break;

        case 'output':
          this.outputModifiers.push(ext[i]);
          break;
      }

      let listeners = ext[i].listeners;
      if (!isUndefined(listeners)) {
        for (var ln in listeners) {
          if (!listeners.hasOwnProperty(ln)) {
            continue;
          }

          let list = listeners[ln];
          if (!isUndefined(list)) {
            this.listen(ln, list);
          }
        }
      }
    }

  }

  /**
   * LEGACY_SUPPORT
   * @param {*} ext
   * @param {string} name
   */
  public legacyExtensionLoading (ext: ((c: Converter) => ShowdownExtension)|ShowdownExtension|ShowdownExtension[], name: string) {
    if (typeof ext === 'function') {
      ext = ext(new Converter());
    }
    if (!isArray(ext)) {
      ext = [ext];
    }
    var valid = validate(ext, name);

    if (!valid.valid) {
      throw Error(valid.error);
    }

    for (var i = 0; i < ext.length; ++i) {
      switch (ext[i].type) {
        case 'lang':
          this.langExtensions.push(ext[i]);
          break;
        case 'output':
          this.outputModifiers.push(ext[i]);
          break;
        default: // should never reach here
          throw Error('Extension loader error: Type unrecognized!!!');
      }
    }
  }

  /**
   * Listen to an event
   * @param {string} name
   * @param {function} callback
   */
  private _listen (name: string, callback: EventListener) {
    if (!isString(name)) {
      throw Error('Invalid argument in converter.listen() method: name must be a string, but ' + typeof name + ' given');
    }

    if (typeof callback !== 'function') {
      throw Error('Invalid argument in converter.listen() method: callback must be a function, but ' + typeof callback + ' given');
    }
    name = name.toLowerCase();

    let list = this.listeners[name];
    if (isUndefined(list)) {
      list = [];
      this.listeners[name] = list;
    }
    list.push(callback);
  }

  // XXX: Not actually private as it is used internally by all of the subParsers
  /**
   *
   * @param {string} evtName Event name
   * @param {string} text Text
   * @param {{}} options Converter Options
   * @param {{}} globals Converter globals
   * @param {{}} pParams extra params for event
   * @returns Event
   * @private
   */
  public _dispatch (evtName: string, text: string, options: ConverterOptions, globals: ConverterGlobals, pParams?: EventParams) {
    evtName = evtName.toLowerCase();
    var params = pParams || {};
    params.converter = this;
    params.text = text;
    params.options = options;
    params.globals = globals;
    var event = new Event(evtName, text, params);

    let list = this.listeners[evtName];
    if (!isUndefined(list)) {
      for (var ei = 0; ei < list.length; ++ei) {
        var nText = list[ei](event);
        if (nText && typeof nText !== 'undefined') {
          event.setText(nText);
        }
      }
    }
    return event;
  }

  /**
   * Listen to an event
   * @param {string} name
   * @param {function} callback
   * @returns {showdown.Converter}
   */
  public listen (name: string, callback: (e: Event) => string|void|undefined) {
    this._listen(name, callback);
    return this;
  }

  /**
   * Converts a markdown string into HTML string
   * @param {string} text
   * @returns {*}
   */
  public makeHtml (text: string): string {
    //check if text is not falsy
    if (!text) {
      return text;
    }

    // check if options.ghMentionsLink is a string
    if (!isString(this.options.ghMentionsLink)) {
      throw new Error('ghMentionsLink option must be a string');
    }

    var globals = {
      gHtmlBlocks:     [],
      gHtmlMdBlocks:   [],
      gHtmlSpans:      [],
      gUrls:           {},
      gTitles:         {},
      gDimensions:     {},
      gListLevel:      0,
      hashLinkCounts:  {},
      langExtensions:  this.langExtensions,
      outputModifiers: this.outputModifiers,
      converter:       this,
      ghCodeBlocks:    [],
      metadata: {
        parsed: {},
        raw: '',
        format: ''
      }
    };

    // This lets us use ¨ trema as an escape char to avoid md5 hashes
    // The choice of character is arbitrary; anything that isn't
    // magic in Markdown will work.
    text = text.replace(/¨/g, '¨T');

    // Replace $ with ¨D
    // RegExp interprets $ as a special character
    // when it's in a replacement string
    text = text.replace(/\$/g, '¨D');

    // Standardize line endings
    text = text.replace(/\r\n/g, '\n'); // DOS to Unix
    text = text.replace(/\r/g, '\n'); // Mac to Unix

    // Stardardize line spaces
    text = text.replace(/\u00A0/g, '&nbsp;');

    if (this.options.smartIndentationFix) {
      text = rTrimInputText(text);
    }

    // Make sure text begins and ends with a couple of newlines:
    text = '\n\n' + text + '\n\n';

    // detab
    text = makehtml_detab(text, this.options, globals);

    /**
     * Strip any lines consisting only of spaces and tabs.
     * This makes subsequent regexs easier to write, because we can
     * match consecutive blank lines with /\n+/ instead of something
     * contorted like /[ \t]*\n+/
     */
    text = text.replace(/^[ \t]+$/mg, '');

    //run languageExtensions
    forEach(this.langExtensions, (ext: ShowdownExtension) => {
      text = makehtml_runExtension(ext, text, this.options, globals);
    });

    // run the sub parsers
    text = makehtml_metadata(text, this.options, globals);
    text = makehtml_hashPreCodeTags(text, this.options, globals);
    text = makehtml_githubCodeBlocks(text, this.options, globals);
    text = makehtml_hashHTMLBlocks(text, this.options, globals);
    text = makehtml_hashCodeTags(text, this.options, globals);
    text = makehtml_stripLinkDefinitions(text, this.options, globals);
    text = makehtml_blockGamut(text, this.options, globals);
    text = makehtml_unhashHTMLSpans(text, this.options, globals);
    text = makehtml_unescapeSpecialChars(text, this.options, globals);

    // attacklab: Restore dollar signs
    text = text.replace(/¨D/g, '$$');

    // attacklab: Restore tremas
    text = text.replace(/¨T/g, '¨');

    // render a complete html document instead of a partial if the option is enabled
    text = makehtml_completeHTMLDocument(text, this.options, globals);

    // Run output modifiers
    forEach(this.outputModifiers, (ext: ShowdownExtension) => {
      text = makehtml_runExtension(ext, text, this.options, globals);
    });

    // update metadata
    this.metadata = globals.metadata;
    return text;
  }

  /**
   * Converts an HTML string into a markdown string
   * @param src
   * @returns {string}
   */
  public makeMarkdown (src: string, rootDocument?: Document) {

    // replace \r\n with \n
    src = src.replace(/\r\n/g, '\n');
    src = src.replace(/\r/g, '\n'); // old macs

    // due to an edge case, we need to find this: > <
    // to prevent removing of non silent white spaces
    // ex: <em>this is</em> <strong>sparta</strong>
    src = src.replace(/>[ \t]+</, '>¨NBSP;<');

    var doc = (rootDocument || document).createElement('div');
    doc.innerHTML = src;

    var globals = {
      preList: substitutePreCodeTags(doc)
    };

    // remove all newlines and collapse spaces
    clean(doc);

    // some stuff, like accidental reference links must now be escaped
    // TODO
    // doc.innerHTML = doc.innerHTML.replace(/\[[\S\t ]]/);

    var nodes = doc.childNodes,
        mdDoc = '';

    for (let i = 0; i < nodes.length; i++) {
      mdDoc += makeMarkdown_node(nodes[i], globals);
    }

    function clean (node: Node) {
      for (var n = 0; n < node.childNodes.length; ++n) {
        var child = node.childNodes[n];
        if (isText(child)) {
          if (!/\S/.test(child.nodeValue || '')) {
            node.removeChild(child);
            --n;
          } else {
            child.nodeValue = (child.nodeValue || '').split('\n').join(' ');
            child.nodeValue = child.nodeValue.replace(/(\s)+/g, '$1');
          }
        } else if (child.nodeType === 1) {
          clean(child);
        }
      }
    }

    // find all pre tags and replace contents with placeholder
    // we need this so that we can remove all indentation from html
    // to ease up parsing
    function substitutePreCodeTags (d: Document|Element) {

      var pres = d.querySelectorAll('pre'),
          presPH: string[] = [];

      for (let i = 0; i < pres.length; ++i) {

        if (pres[i].childElementCount === 1 && (pres[i].firstChild! as Element).tagName.toLowerCase() === 'code') {

          let el = pres[i].firstChild! as Element;

          var content = el.innerHTML.trim(),
              language = el.getAttribute('data-language') || '';

          // if data-language attribute is not defined, then we look for class language-*
          if (language === '') {
            var classes = el.className.split(' ');
            for (var c = 0; c < classes.length; ++c) {
              var matches = classes[c].match(/^language-(.+)$/);
              if (matches !== null) {
                language = matches[1];
                break;
              }
            }
          }

          // unescape html entities in content
          content = unescapeHTMLEntities(content);

          presPH.push(content);
          pres[i].outerHTML = '<precode language="' + language + '" precodenum="' + i.toString() + '"></precode>';
        } else {
          presPH.push(pres[i].innerHTML);
          pres[i].innerHTML = '';
          pres[i].setAttribute('prenum', i.toString());
        }
      }
      return presPH;
    }

    return mdDoc;
  }

  /**
   * Set an option of this Converter instance
   * @param {string} key
   * @param {*} value
   */
  public setOption <K extends keyof ShowdownOptions> (key: K, value: ShowdownOptions[K]) {
    this.options[key] = value;
  }

  /**
   * Get the option of this Converter instance
   * @param {string} key
   * @returns {*}
   */
  public getOption <K extends keyof ShowdownOptions> (key: K) {
    return this.options[key];
  }

  /**
   * Get the options of this Converter instance
   * @returns {{}}
   */
  public getOptions () {
    return this.options;
  }

  /**
   * Add extension to THIS converter
   * @param {{}} extension
   * @param {string} [name=null]
   */
  public addExtension (extension: ShowdownExtension, name: string|null = null) {
    this._parseExtension(extension, name);
  }

  /**
   * Use a global registered extension with THIS converter
   * @param {string} extensionName Name of the previously registered extension
   */
  public useExtension (extensionName: string) {
    this._parseExtension(extensionName);
  }

  /**
   * Set the flavor THIS converter should use
   * @param {string} name
   */
  public setFlavor (name: string) {
    if (!privateGlobals.flavor.hasOwnProperty(name)) {
      throw Error(name + ' flavor was not found');
    }
    var preset = privateGlobals.flavor[name];
    this.setConvFlavor = name;
    this.options = {
      ...privateGlobals.globalOptions,
      ...preset
    };
  }

  /**
   * Get the currently set flavor of this converter
   * @returns {string}
   */
  public getFlavor () {
    return this.setConvFlavor;
  }

  /**
   * Remove an extension from THIS converter.
   * Note: This is a costly operation. It's better to initialize a new converter
   * and specify the extensions you wish to use
   * @param {Array} extension
   */
  public removeExtension (extension: ShowdownExtension|ShowdownExtension[]) {
    if (!isArray(extension)) {
      extension = [extension];
    }
    for (var a = 0; a < extension.length; ++a) {
      var ext = extension[a];
      for (var i = 0; i < this.langExtensions.length; ++i) {
        if (this.langExtensions[i] === ext) {
          this.langExtensions.splice(i, 1);
        }
      }
      for (var ii = 0; ii < this.outputModifiers.length; ++ii) {
        if (this.outputModifiers[ii] === ext) {
          this.outputModifiers.splice(ii, 1);
        }
      }
    }
  }

  /**
   * Get all extension of THIS converter
   * @returns {{language: Array, output: Array}}
   */
  public getAllExtensions () {
    return {
      language: this.langExtensions,
      output: this.outputModifiers
    };
  }

  /**
   * Get the metadata of the previously parsed document
   * @param raw
   * @returns {string|{}}
   */
  public getMetadata (raw?: boolean) {
    if (raw) {
      return this.metadata.raw;
    } else {
      return this.metadata.parsed;
    }
  }

  /**
   * Get the metadata format of the previously parsed document
   * @returns {string}
   */
  private getMetadataFormat () {
    return this.metadata.format;
  }

  /**
   * Private: set a single key, value metadata pair
   * @param {string} key
   * @param {string} value
   */
  private _setMetadataPair (key: string, value: string) {
    this.metadata.parsed[key] = value;
  }

  /**
   * Private: set metadata format
   * @param {string} format
   */
  private _setMetadataFormat (format: string) {
    this.metadata.format = format;
  }

  /**
   * Private: set metadata raw text
   * @param {string} raw
   */
  private _setMetadataRaw (raw: string) {
    this.metadata.raw = raw;
  }
}
