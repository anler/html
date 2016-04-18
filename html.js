var Html;
(function(Html) {
  'use strict';
  function is(constructor, value) {
    return value != null && value.constructor === constructor || value instanceof constructor;
  }

  var Attributes = {},
      Dom = {},
      regexEscape = /["&'<>`]/g,
      escapeMap = { '"': '&quot;', '&': '&amp;', '\'': '&#x27;',
                    '<': '&lt;', '>': '&gt;', '`': '&#x60;' };
  var tags = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',

    'div', 'p', 'hr', 'pre', 'blockquote',

    'span', 'a', 'code', 'em', 'strong', 'i', 'b', 'u',
    'sub', 'sup', 'br',

    'ol', 'ul', 'li', 'dl', 'dt', 'dd',

    'img', 'iframe', 'canvas', 'svg', 'math',

    'form', 'input', 'textarea', 'button', 'select',
    'option',

    'section', 'nav', 'article', 'aside', 'header',
    'footer', 'address', 'main', 'body',

    'figure', 'figcaption',

    'table', 'caption', 'colgroup', 'col', 'tbody',
    'thead', 'tfoot', 'tr', 'td', 'th',

    'fieldset', 'legend', 'label', 'datalist', 'optgroup',
    'keygen', 'output', 'progress', 'meter',

    'audio', 'video', 'source', 'track',

    'embed', 'object', 'param',

    'ins', 'del',

    'small', 'cite', 'dfn', 'abbr', 'time',
    'samp', 'kbd', 's', 'q',

    'mark', 'ruby', 'rt', 'rp', 'bdi', 'bdo', 'wbr',

    'details', 'summary', 'menuitem', 'menu'
  ];

  var attributes = [
    'id', 'title', 'style',

    'type', 'value', 'placeholder',

    'accept', 'acceptCharset', 'action', 'autosave',
    'enctype', 'formaction', 'list', 'maxlength', 'minlength',
    'method', 'name', 'pattern', 'size', 'for', 'form',

    'max', 'min', 'step',

    'cols', 'rows', 'wrap',

    'href', 'target', 'downloadAs', 'hreflang', 'media', 'ping', 'rel',

    'usemap', 'shape', 'coords',

    'src', 'height', 'width', 'alt',

    'preload', 'poster', 'kind', 'srclang',

    'sandbox', 'srcdoc', 'start',

    'align', 'colspan', 'rowspan', 'headers', 'scope',

    'charset', 'content', 'httpEquiv', 'language',

    'accessKey', 'contextmenu', 'dir', 'draggable', 'dropzone',
    'itemprop', 'lang', 'tabindex',

    'challenge', 'keytype',

    'cite', 'datetime', 'pubdate', 'manifest'
  ];

  var boolAttributes = [
    'hidden',

    'checked', 'selected', 'autocomplete', 'autofocus',
    'disabled', 'multiple', 'novalidate', 'readonly', 'required',

    'download',

    'ismap',

    'autoplay', 'controls', 'loop', 'default',

    'seamless', 'reversed',

    'async', 'defer', 'scoped',

    'contenteditable', 'spellcheck'
  ];

  attributes.forEach(function(tag) {
    Attributes[tag] = StringAttribute(tag);
  });
  boolAttributes.forEach(function(tag) {
    Attributes[tag] = BoolAttribute(tag);
  });
  Attributes.class_ = StringAttribute('class');
  Attributes.classList = ListAttribute('class');

  tags.forEach(function(tag) {
    Html[tag] = Node(tag);
  });

  Dom.render = function(root, html) {
    if (!html.isHtml) {
      throw new Error('Render only accepts Html type');
    }
    root.innerHTML = html.toString();
  }

  Html.text = Text;
  Html.rawHtml = RawHtml;
  Html.node = Node;
  Html.var_ = Node('var');
  Html.Attributes = Attributes;
  Html.Dom = Dom;


  function escape(string) {
    return string.replace(regexEscape, function($0) { return escapeMap[$0]; });
  }

  function HtmlType(tag, node) {
    return Object.create(node, {
      tag: {
        value: tag
      },
      isHtml: {
        value: true
      },
      toString: {
        value: function() {
          var attrs = [], children = [];
          switch (tag) {
            case Node:
              node.attributes.forEach(function(attr) {
                attrs.push(attr.toString());
              });
              node.children.forEach(function(child) {
                children.push(child.toString());
              });
              return '<'+node.name+' '+attrs.join(' ')+'>'+children.join('')+'</'+node.name+'>';
            case Text:
              return escape(node.value);
            case RawHtml:
              return node.value;
            default:
              throw new Error('Unhandled Html type');
          }
        }
      }
    });
  }

  function Node(name) {
    return function(attributes, children) {
      if (!is(Array, attributes)) {
        throw new Error('Node attributes must be an array');
      }
      if (!is(Array, children)) {
        throw new Error('Node attributes must be an array');
      }
      return HtmlType(Node, {
        name: name,
        attributes: attributes,
        children: children
      });
    };
  }

  function Text(value) {
    if (!is(String, value)) {
      throw new Error('Text only accepts strings');
    }
    return HtmlType(Text, {
      value: value
    });
  }

  function RawHtml(value) {
    if (!is(String, value)) {
      throw new Error('RawHtml only accepts strings');
    }
    return HtmlType(RawHtml, {
      value: value
    });
  }

  function StringAttribute(name) {
    return function(value) {
      if (!is(String, value)) {
        throw new Error('Attribute must be a string');
      }

      return AttributeType(StringAttribute, {
        name: name,
        value: value
      });
    };
  }

  function BoolAttribute(name) {
    return function(value) {
      if (!is(Boolean, value)) {
        throw new Error('Attribute must be a boolean');
      }
      return AttributeType(BoolAttribute, {
        name: value,
        value: value
      });
    };
  }

  function ListAttribute(name) {
    return function(values) {
      if (!is(Array, values)) {
        throw new Error('Attribute must be an array');
      }
      return AttributeType(ListAttribute, {
        name: name,
        values: values
      });
    };
  }

  function AttributeType(tag, attr) {
    return Object.create(attr, {
      tag: {
        value: tag
      },
      isAttribute: {
        value: true
      },
      toString: {
        value: function() {
          switch (tag) {
            case StringAttribute:
              return attr.name+'="'+escape(attr.value)+'"';
            case BoolAttribute:
              return escape(attr.value) ? attr.name : '';
            case ListAttribute:
              return attr.name+'="'+attr.values.map(escape).join(' ')+'"';
            default:
              throw new Error('Unhandled Attribute type');
          }
        }
      }
    });
  }
})(Html || (Html = {}));
