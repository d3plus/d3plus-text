require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
if (typeof Map === "undefined") {
  Map = function() {};
  Map.prototype = {
    set: function(k, v) { this["$" + k] = v; return this; },
    get: function(k) { return this["$" + k]; },
    has: function(k) { return "$" + k in this; }
  };
}

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.d3 = factory();
}(this, function () { 'use strict';

    var bug44083 = typeof navigator !== "undefined" && /WebKit/.test(navigator.userAgent) ? -1 : 0; // https://bugs.webkit.org/show_bug.cgi?id=44083// When depth = 1, root = [Node, …].
    // When depth = 2, root = [[Node, …], …].
    // When depth = 3, root = [[[Node, …], …], …]. etc.
    // Note that [Node, …] and NodeList are used interchangeably; see arrayify.

    function Selection(root, depth) {
      this._root = root;
      this._depth = depth;
      this._enter = this._update = this._exit = null;
    }
    var defaultView = function(node) {
      return node
          && ((node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
              || (node.document && node) // node is a Window
              || node.defaultView); // node is a Document
    }

    function dispatchEvent(node, type, params) {
      var window = defaultView(node),
          event = window.CustomEvent;

      if (event) {
        event = new event(type, params);
      } else {
        event = window.document.createEvent("Event");
        if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
        else event.initEvent(type, false, false);
      }

      node.dispatchEvent(event);
    }

    var selection_dispatch = function(type, params) {

      function dispatchConstant() {
        return dispatchEvent(this, type, params);
      }

      function dispatchFunction() {
        return dispatchEvent(this, type, params.apply(this, arguments));
      }

      return this.each(typeof params === "function" ? dispatchFunction : dispatchConstant);
    }

    function noop() {}
    var requoteRe = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;

    var requote = function(string) {
      return string.replace(requoteRe, "\\$&");
    }

    function filterListenerOf(listener) {
      return function(event) {
        var related = event.relatedTarget;
        if (!related || (related !== this && !(related.compareDocumentPosition(this) & 8))) {
          listener(event);
        }
      };
    }

    var event = null;

    function listenerOf(listener, ancestors, args) {
      return function(event1) {
        var i = ancestors.length, event0 = event; // Events can be reentrant (e.g., focus).
        while (--i >= 0) args[i << 1] = ancestors[i].__data__;
        event = event1;
        try {
          listener.apply(ancestors[0], args);
        } finally {
          event = event0;
        }
      };
    }

    var filterEvents = new Map;

    var selection_event = function(type, listener, capture) {
      var n = arguments.length,
          key = "__on" + type,
          filter,
          root = this._root;

      if (n < 2) return (n = this.node()[key]) && n._listener;

      if (n < 3) capture = false;
      if ((n = type.indexOf(".")) > 0) type = type.slice(0, n);
      if (filter = filterEvents.has(type)) type = filterEvents.get(type);

      function add() {
        var ancestor = root, i = arguments.length >> 1, ancestors = new Array(i);
        while (--i >= 0) ancestor = ancestor[arguments[(i << 1) + 1]], ancestors[i] = i ? ancestor._parent : ancestor;
        var l = listenerOf(listener, ancestors, arguments);
        if (filter) l = filterListenerOf(l);
        remove.call(this);
        this.addEventListener(type, this[key] = l, l._capture = capture);
        l._listener = listener;
      }

      function remove() {
        var l = this[key];
        if (l) {
          this.removeEventListener(type, l, l._capture);
          delete this[key];
        }
      }

      function removeAll() {
        var re = new RegExp("^__on([^.]+)" + requote(type) + "$"), match;
        for (var name in this) {
          if (match = name.match(re)) {
            var l = this[name];
            this.removeEventListener(match[1], l, l._capture);
            delete this[name];
          }
        }
      }

      return this.each(listener
          ? (n ? add : noop) // Attempt to add untyped listener is ignored.
          : (n ? remove : removeAll));
    }
    var selection_datum = function(value) {
      return arguments.length ? this.property("__data__", value) : this.node().__data__;
    }
    var selection_remove = function() {
      return this.each(function() {
        var parent = this.parentNode;
        if (parent) parent.removeChild(this);
      });
    }
    var selectorOf = function(selector) {
      return function() {
        return this.querySelector(selector);
      };
    }
    var namespaces = (new Map)
        .set("svg", "http://www.w3.org/2000/svg")
        .set("xhtml", "http://www.w3.org/1999/xhtml")
        .set("xlink", "http://www.w3.org/1999/xlink")
        .set("xml", "http://www.w3.org/XML/1998/namespace")
        .set("xmlns", "http://www.w3.org/2000/xmlns/");

    var namespace = function(name) {
      var i = name.indexOf(":"), prefix = name;
      if (i >= 0) prefix = name.slice(0, i), name = name.slice(i + 1);
      return namespaces.has(prefix) ? {space: namespaces.get(prefix), local: name} : name;
    }

    function creatorOf(name) {
      name = namespace(name);

      function creator() {
        var document = this.ownerDocument,
            uri = this.namespaceURI;
        return uri
            ? document.createElementNS(uri, name)
            : document.createElement(name);
      }

      function creatorNS() {
        return this.ownerDocument.createElementNS(name.space, name.local);
      }

      return name.local ? creatorNS : creator;
    }

    var selection_append = function(creator, selector) {
      if (typeof creator !== "function") creator = creatorOf(creator);

      function append() {
        return this.appendChild(creator.apply(this, arguments));
      }

      function insert() {
        return this.insertBefore(creator.apply(this, arguments), selector.apply(this, arguments) || null);
      }

      return this.select(arguments.length < 2
          ? append
          : (typeof selector !== "function" && (selector = selectorOf(selector)), insert));
    }
    var selection_html = function(value) {
      if (!arguments.length) return this.node().innerHTML;

      function setConstant() {
        this.innerHTML = value;
      }

      function setFunction() {
        var v = value.apply(this, arguments);
        this.innerHTML = v == null ? "" : v;
      }

      if (value == null) value = "";

      return this.each(typeof value === "function" ? setFunction : setConstant);
    }
    var selection_text = function(value) {
      if (!arguments.length) return this.node().textContent;

      function setConstant() {
        this.textContent = value;
      }

      function setFunction() {
        var v = value.apply(this, arguments);
        this.textContent = v == null ? "" : v;
      }

      if (value == null) value = "";

      return this.each(typeof value === "function" ? setFunction : setConstant);
    }

    function collapse(string) {
      return string.trim().replace(/\s+/g, " ");
    }

    function classerOf(name) {
      var re;
      return function(node, value) {
        if (c = node.classList) return value ? c.add(name) : c.remove(name);
        if (!re) re = new RegExp("(?:^|\\s+)" + requote(name) + "(?:\\s+|$)", "g");
        var c = node.getAttribute("class") || "";
        if (value) {
          re.lastIndex = 0;
          if (!re.test(c)) node.setAttribute("class", collapse(c + " " + name));
        } else {
          node.setAttribute("class", collapse(c.replace(re, " ")));
        }
      };
    }

    var selection_class = function(name, value) {
      name = (name + "").trim().split(/^|\s+/);
      var n = name.length;

      if (arguments.length < 2) {
        var node = this.node(), i = -1;
        if (value = node.classList) { // SVG elements may not support DOMTokenList!
          while (++i < n) if (!value.contains(name[i])) return false;
        } else {
          value = node.getAttribute("class");
          while (++i < n) if (!classedRe(name[i]).test(value)) return false;
        }
        return true;
      }

      name = name.map(classerOf);

      function setConstant() {
        var i = -1;
        while (++i < n) name[i](this, value);
      }

      function setFunction() {
        var i = -1, x = value.apply(this, arguments);
        while (++i < n) name[i](this, x);
      }

      return this.each(typeof value === "function" ? setFunction : setConstant);
    }
    var selection_property = function(name, value) {
      if (arguments.length < 2) return this.node()[name];

      function remove() {
        delete this[name];
      }

      function setConstant() {
        this[name] = value;
      }

      function setFunction() {
        var x = value.apply(this, arguments);
        if (x == null) delete this[name];
        else this[name] = x;
      }

      return this.each(value == null ? remove : typeof value === "function" ? setFunction : setConstant);
    }

    var selection_style = function(name, value, priority) {
      var n = arguments.length;

      if (n < 2) return defaultView(n = this.node()).getComputedStyle(n, null).getPropertyValue(name);

      if (n < 3) priority = "";

      function remove() {
        this.style.removeProperty(name);
      }

      function setConstant() {
        this.style.setProperty(name, value, priority);
      }

      function setFunction() {
        var x = value.apply(this, arguments);
        if (x == null) this.style.removeProperty(name);
        else this.style.setProperty(name, x, priority);
      }

      return this.each(value == null ? remove : typeof value === "function" ? setFunction : setConstant);
    }

    var selection_attr = function(name, value) {
      name = namespace(name);

      if (arguments.length < 2) {
        var node = this.node();
        return name.local
            ? node.getAttributeNS(name.space, name.local)
            : node.getAttribute(name);
      }

      function remove() {
        this.removeAttribute(name);
      }

      function removeNS() {
        this.removeAttributeNS(name.space, name.local);
      }

      function setConstant() {
        this.setAttribute(name, value);
      }

      function setConstantNS() {
        this.setAttributeNS(name.space, name.local, value);
      }

      function setFunction() {
        var x = value.apply(this, arguments);
        if (x == null) this.removeAttribute(name);
        else this.setAttribute(name, x);
      }

      function setFunctionNS() {
        var x = value.apply(this, arguments);
        if (x == null) this.removeAttributeNS(name.space, name.local);
        else this.setAttributeNS(name.space, name.local, x);
      }

      return this.each(value == null
          ? (name.local ? removeNS : remove)
          : (typeof value === "function"
              ? (name.local ? setFunctionNS : setFunction)
              : (name.local ? setConstantNS : setConstant)));
    }
    var selection_each = function(callback) {
      var depth = this._depth,
          stack = new Array(depth);

      function visit(nodes, depth) {
        var i = -1,
            n = nodes.length,
            node;

        if (--depth) {
          var stack0 = depth * 2,
              stack1 = stack0 + 1;
          while (++i < n) {
            if (node = nodes[i]) {
              stack[stack0] = node._parent.__data__, stack[stack1] = i;
              visit(node, depth);
            }
          }
        }

        else {
          while (++i < n) {
            if (node = nodes[i]) {
              stack[0] = node.__data__, stack[1] = i;
              callback.apply(node, stack);
            }
          }
        }
      }

      visit(this._root, depth);
      return this;
    }
    var selection_empty = function() {
      return !this.node();
    }
    var selection_size = function() {
      var size = 0;
      this.each(function() { ++size; });
      return size;
    }

    function firstNode(nodes, depth) {
      var i = -1,
          n = nodes.length,
          node;

      if (--depth) {
        while (++i < n) {
          if (node = nodes[i]) {
            if (node = firstNode(node, depth)) {
              return node;
            }
          }
        }
      }

      else {
        while (++i < n) {
          if (node = nodes[i]) {
            return node;
          }
        }
      }
    }
    var selection_node = function() {
      return firstNode(this._root, this._depth);
    }
    var selection_nodes = function() {
      var nodes = new Array(this.size()), i = -1;
      this.each(function() { nodes[++i] = this; });
      return nodes;
    }
    var selection_call = function() {
      var callback = arguments[0];
      callback.apply(arguments[0] = this, arguments);
      return this;
    }

    function arrayifyNode(nodes, depth) {
      var i = -1,
          n = nodes.length,
          node;

      if (--depth) {
        while (++i < n) {
          if (node = nodes[i]) {
            nodes[i] = arrayifyNode(node, depth);
          }
        }
      }

      else if (!Array.isArray(nodes)) {
        var array = new Array(n);
        while (++i < n) array[i] = nodes[i];
        array._parent = nodes._parent;
        nodes = array;
      }

      return nodes;
    }// The leaf groups of the selection hierarchy are initially NodeList,
    // and then lazily converted to arrays when mutation is required.
    var arrayify = function(selection) {
      return selection._root = arrayifyNode(selection._root, selection._depth);
    }

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    var selection_sort = function(comparator) {
      if (!comparator) comparator = ascending;

      function compare(a, b) {
        return a && b ? comparator(a.__data__, b.__data__) : !a - !b;
      }

      function visit(nodes, depth) {
        if (--depth) {
          var i = -1,
              n = nodes.length,
              node;
          while (++i < n) {
            if (node = nodes[i]) {
              visit(node, depth);
            }
          }
        }

        else {
          nodes.sort(compare);
        }
      }

      visit(arrayify(this), this._depth);
      return this.order();
    }

    function orderNode(nodes, depth) {
      var i = nodes.length,
          node,
          next;

      if (--depth) {
        while (--i >= 0) {
          if (node = nodes[i]) {
            orderNode(node, depth);
          }
        }
      }

      else {
        next = nodes[--i];
        while (--i >= 0) {
          if (node = nodes[i]) {
            if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
            next = node;
          }
        }
      }
    }
    var selection_order = function() {
      orderNode(this._root, this._depth);
      return this;
    }

    function emptyNode(nodes, depth) {
      var i = -1,
          n = nodes.length,
          node,
          empty = new Array(n);

      if (--depth) {
        while (++i < n) {
          if (node = nodes[i]) {
            empty[i] = emptyNode(node, depth);
          }
        }
      }

      empty._parent = nodes._parent;
      return empty;
    }

    var emptyOf = function(selection) {
      return new Selection(emptyNode(arrayify(selection), selection._depth), selection._depth);
    }// Lazily constructs the exit selection for this (update) selection.
    // Until this selection is joined to data, the exit selection will be empty.

    var selection_exit = function() {
      return this._exit || (this._exit = emptyOf(this));
    }// Lazily constructs the enter selection for this (update) selection.
    // Until this selection is joined to data, the enter selection will be empty.

    var selection_enter = function() {
      if (!this._enter) {
        this._enter = emptyOf(this);
        this._enter._update = this;
      }
      return this._enter;
    }

    function EnterNode(parent, datum) {
      this.ownerDocument = parent.ownerDocument;
      this.namespaceURI = parent.namespaceURI;
      this._next = null;
      this._parent = parent;
      this.__data__ = datum;
    }

    EnterNode.prototype = {
      appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
      insertBefore: function(child, next) { return this._parent.insertBefore(child, next || this._next); }
    };

    function valueOf_(value) { // XXX https://github.com/rollup/rollup/issues/12
      return function() {
        return value;
      };
    }// The value may either be an array or a function that returns an array.
    // An optional key function may be specified to control how data is bound;
    // if no key function is specified, data is bound to nodes by index.
    // Or, if no arguments are specified, this method returns all bound data.
    var selection_data = function(value, key) {
      if (!value) {
        var data = new Array(this.size()), i = -1;
        this.each(function(d) { data[++i] = d; });
        return data;
      }

      var depth = this._depth - 1,
          stack = new Array(depth * 2),
          bind = key ? bindKey : bindIndex;

      if (typeof value !== "function") value = valueOf_(value);
      visit(this._root, this.enter()._root, this.exit()._root, depth);

      function visit(update, enter, exit, depth) {
        var i = -1,
            n,
            node;

        if (depth--) {
          var stack0 = depth * 2,
              stack1 = stack0 + 1;

          n = update.length;

          while (++i < n) {
            if (node = update[i]) {
              stack[stack0] = node._parent.__data__, stack[stack1] = i;
              visit(node, enter[i], exit[i], depth);
            }
          }
        }

        else {
          var j = 0,
              before;

          bind(update, enter, exit, value.apply(update._parent, stack));
          n = update.length;

          // Now connect the enter nodes to their following update node, such that
          // appendChild can insert the materialized enter node before this node,
          // rather than at the end of the parent node.
          while (++i < n) {
            if (before = enter[i]) {
              if (i >= j) j = i + 1;
              while (!(node = update[j]) && ++j < n);
              before._next = node || null;
            }
          }
        }
      }

      function bindIndex(update, enter, exit, data) {
        var i = 0,
            node,
            nodeLength = update.length,
            dataLength = data.length,
            minLength = Math.min(nodeLength, dataLength);

        // Clear the enter and exit arrays, and then initialize to the new length.
        enter.length = 0, enter.length = dataLength;
        exit.length = 0, exit.length = nodeLength;

        for (; i < minLength; ++i) {
          if (node = update[i]) {
            node.__data__ = data[i];
          } else {
            enter[i] = new EnterNode(update._parent, data[i]);
          }
        }

        // Note: we don’t need to delete update[i] here because this loop only
        // runs when the data length is greater than the node length.
        for (; i < dataLength; ++i) {
          enter[i] = new EnterNode(update._parent, data[i]);
        }

        // Note: and, we don’t need to delete update[i] here because immediately
        // following this loop we set the update length to data length.
        for (; i < nodeLength; ++i) {
          if (node = update[i]) {
            exit[i] = update[i];
          }
        }

        update.length = dataLength;
      }

      function bindKey(update, enter, exit, data) {
        var i,
            node,
            dataLength = data.length,
            nodeLength = update.length,
            nodeByKeyValue = new Map,
            keyStack = new Array(2).concat(stack),
            keyValues = new Array(nodeLength),
            keyValue;

        // Clear the enter and exit arrays, and then initialize to the new length.
        enter.length = 0, enter.length = dataLength;
        exit.length = 0, exit.length = nodeLength;

        // Compute the keys for each node.
        for (i = 0; i < nodeLength; ++i) {
          if (node = update[i]) {
            keyStack[0] = node.__data__, keyStack[1] = i;
            keyValues[i] = keyValue = key.apply(node, keyStack);

            // Is this a duplicate of a key we’ve previously seen?
            // If so, this node is moved to the exit selection.
            if (nodeByKeyValue.has(keyValue)) {
              exit[i] = node;
            }

            // Otherwise, record the mapping from key to node.
            else {
              nodeByKeyValue.set(keyValue, node);
            }
          }
        }

        // Now clear the update array and initialize to the new length.
        update.length = 0, update.length = dataLength;

        // Compute the keys for each datum.
        for (i = 0; i < dataLength; ++i) {
          keyStack[0] = data[i], keyStack[1] = i;
          keyValue = key.apply(update._parent, keyStack);

          // Is there a node associated with this key?
          // If not, this datum is added to the enter selection.
          if (!(node = nodeByKeyValue.get(keyValue))) {
            enter[i] = new EnterNode(update._parent, data[i]);
          }

          // Did we already bind a node using this key? (Or is a duplicate?)
          // If unique, the node and datum are joined in the update selection.
          // Otherwise, the datum is ignored, neither entering nor exiting.
          else if (node !== true) {
            update[i] = node;
            node.__data__ = data[i];
          }

          // Record that we consumed this key, either to enter or update.
          nodeByKeyValue.set(keyValue, true);
        }

        // Take any remaining nodes that were not bound to data,
        // and place them in the exit selection.
        for (i = 0; i < nodeLength; ++i) {
          if ((node = nodeByKeyValue.get(keyValues[i])) !== true) {
            exit[i] = node;
          }
        }
      }

      return this;
    }

    var filterOf = function(selector) {
      return function() {
        return this.matches(selector);
      };
    };

    if (typeof document !== "undefined") {
      var element = document.documentElement;
      if (!element.matches) {
        var vendorMatches = element.webkitMatchesSelector || element.msMatchesSelector || element.mozMatchesSelector || element.oMatchesSelector;
        filterOf = function(selector) { return function() { return vendorMatches.call(this, selector); }; };
      }
    }// The filter may either be a selector string (e.g., ".foo")
    // or a function that returns a boolean.

    var selection_filter = function(filter) {
      var depth = this._depth,
          stack = new Array(depth * 2);

      if (typeof filter !== "function") filter = filterOf(filter);

      function visit(nodes, depth) {
        var i = -1,
            n = nodes.length,
            node,
            subnodes;

        if (--depth) {
          var stack0 = depth * 2,
              stack1 = stack0 + 1;
          subnodes = new Array(n);
          while (++i < n) {
            if (node = nodes[i]) {
              stack[stack0] = node._parent.__data__, stack[stack1] = i;
              subnodes[i] = visit(node, depth);
            }
          }
        }

        // The filter operation does not preserve the original index,
        // so the resulting leaf groups are dense (not sparse).
        else {
          subnodes = [];
          while (++i < n) {
            if (node = nodes[i]) {
              stack[0] = node.__data__, stack[1] = i;
              if (filter.apply(node, stack)) {
                subnodes.push(node);
              }
            }
          }
        }

        subnodes._parent = nodes._parent;
        return subnodes;
      }

      return new Selection(visit(this._root, depth), depth);
    }

    function selectorAllOf(selector) {
      return function() {
        return this.querySelectorAll(selector);
      };
    }// The selector may either be a selector string (e.g., ".foo")
    // or a function that optionally returns an array of nodes to select.
    // This is the only operation that increases the depth of a selection.

    var selection_selectAll = function(selector) {
      var depth = this._depth,
          stack = new Array(depth * 2);

      if (typeof selector !== "function") selector = selectorAllOf(selector);

      function visit(nodes, depth) {
        var i = -1,
            n = nodes.length,
            node,
            subnode,
            subnodes = new Array(n);

        if (--depth) {
          var stack0 = depth * 2,
              stack1 = stack0 + 1;
          while (++i < n) {
            if (node = nodes[i]) {
              stack[stack0] = node._parent.__data__, stack[stack1] = i;
              subnodes[i] = visit(node, depth);
            }
          }
        }

        // Data is not propagated since there is a one-to-many mapping.
        // The parent of the new leaf group is the old node.
        else {
          while (++i < n) {
            if (node = nodes[i]) {
              stack[0] = node.__data__, stack[1] = i;
              subnodes[i] = subnode = selector.apply(node, stack);
              subnode._parent = node;
            }
          }
        }

        subnodes._parent = nodes._parent;
        return subnodes;
      }

      return new Selection(visit(this._root, depth), depth + 1);
    }// The selector may either be a selector string (e.g., ".foo")
    // or a function that optionally returns the node to select.

    var selection_select = function(selector) {
      var depth = this._depth,
          stack = new Array(depth * 2);

      if (typeof selector !== "function") selector = selectorOf(selector);

      function visit(nodes, update, depth) {
        var i = -1,
            n = nodes.length,
            node,
            subnode,
            subnodes = new Array(n);

        if (--depth) {
          var stack0 = depth * 2,
              stack1 = stack0 + 1;
          while (++i < n) {
            if (node = nodes[i]) {
              stack[stack0] = node._parent.__data__, stack[stack1] = i;
              subnodes[i] = visit(node, update && update[i], depth);
            }
          }
        }

        // The leaf group may be sparse if the selector returns a falsey value;
        // this preserves the index of nodes (unlike selection.filter).
        // Propagate data to the new node only if it is defined on the old.
        // If this is an enter selection, materialized nodes are moved to update.
        else {
          while (++i < n) {
            if (node = nodes[i]) {
              stack[0] = node.__data__, stack[1] = i;
              if (subnode = selector.apply(node, stack)) {
                if ("__data__" in node) subnode.__data__ = node.__data__;
                if (update) update[i] = subnode, delete nodes[i];
                subnodes[i] = subnode;
              }
            }
          }
        }

        subnodes._parent = nodes._parent;
        return subnodes;
      }

      return new Selection(visit(this._root, this._update && this._update._root, depth), depth);
    }

    function selection() {
      return new Selection([document.documentElement], 1);
    }

    Selection.prototype = selection.prototype = {
      select: selection_select,
      selectAll: selection_selectAll,
      filter: selection_filter,
      data: selection_data,
      enter: selection_enter,
      exit: selection_exit,
      order: selection_order,
      sort: selection_sort,
      call: selection_call,
      nodes: selection_nodes,
      node: selection_node,
      size: selection_size,
      empty: selection_empty,
      each: selection_each,
      attr: selection_attr,
      style: selection_style,
      property: selection_property,
      class: selection_class,
      classed: selection_class, // deprecated alias
      text: selection_text,
      html: selection_html,
      append: selection_append,
      insert: selection_append, // deprecated alias
      remove: selection_remove,
      datum: selection_datum,
      event: selection_event,
      on: selection_event, // deprecated alias
      dispatch: selection_dispatch
    };

    var select = function(selector) {
      return new Selection([typeof selector === "string" ? document.querySelector(selector) : selector], 1);
    }

    var point = function(node, event) {
      var svg = node.ownerSVGElement || node;
      if (svg.createSVGPoint) {
        var point = svg.createSVGPoint();
        if (bug44083 < 0) {
          var window = defaultView(node);
          if (window.scrollX || window.scrollY) {
            svg = select(window.document.body).append("svg").style({position: "absolute", top: 0, left: 0, margin: 0, padding: 0, border: "none"}, "important");
            var ctm = svg.node().getScreenCTM();
            bug44083 = !(ctm.f || ctm.e);
            svg.remove();
          }
        }
        if (bug44083) point.x = event.pageX, point.y = event.pageY;
        else point.x = event.clientX, point.y = event.clientY;
        point = point.matrixTransform(node.getScreenCTM().inverse());
        return [point.x, point.y];
      }
      var rect = node.getBoundingClientRect();
      return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
    }

    var sourceEvent = function() {
      var current = event, source;
      while (source = current.sourceEvent) current = source;
      return current;
    }

    var touches = function(node, touches) {
      if (arguments.length < 2) touches = sourceEvent().touches;
      for (var i = 0, n = touches ? touches.length : 0, points = new Array(n); i < n; ++i) {
        points[i] = point(node, touches[i]);
      }
      return points;
    }

    var touch = function(node, touches, identifier) {
      if (arguments.length < 3) identifier = touches, touches = sourceEvent().changedTouches;
      for (var i = 0, n = touches ? touches.length : 0, touch; i < n; ++i) {
        if ((touch = touches[i]).identifier === identifier) {
          return point(node, touch);
        }
      }
      return null;
    }

    var selectAll = function(selector) {
      return new Selection(typeof selector === "string" ? document.querySelectorAll(selector) : selector, 1);
    }

    var mouse = function(node, event) {
      if (arguments.length < 2) event = sourceEvent();
      if (event.changedTouches) event = event.changedTouches[0];
      return point(node, event);
    }

    var d3 = {
      get event() { return event; },
      mouse: mouse,
      namespace: namespace,
      namespaces: namespaces,
      requote: requote,
      select: select,
      selectAll: selectAll,
      selection: selection,
      touch: touch,
      touches: touches
    };

    return d3;

}));
},{}],2:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var d3 = require("d3-selection"),
    Shell = require("../../d3plus-shell/src/Shell.js");

module.exports = (function (_Shell) {
  _inherits(_class, _Shell);

  function _class(data) {
    var settings = arguments.length <= 1 || arguments[1] === undefined ? new Map() : arguments[1];

    _classCallCheck(this, _class);

    _get(Object.getPrototypeOf(_class.prototype), "constructor", this).call(this, settings);
    this.data = data;
    this.cache = new Map();
  }

  _createClass(_class, [{
    key: "clear",
    value: function clear() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.cache.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;

          var attr = this.settings.get(key);
          if (attr.changed || attr.type === Function) {
            this.cache["delete"](key);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"]) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "fetch",
    value: function fetch(name) {

      if (this.cache.has(name)) {
        return this.cache.get(name);
      }

      var attr = this.settings.get(name),
          value;
      if (attr) {
        value = attr.value;
        if (attr.type === Function) {
          value = value(this.data);
        } else if (value.constructor === String) {
          if (this.data instanceof d3.selection) {
            value = this.data.attr(value) || this.data.style(value);
          } else if (this.data.constructor === Object) {
            value = this.data[value];
          }
        }
      }

      this.cache.set(name, value);
      return value;
    }
  }]);

  return _class;
})(Shell);

},{"../../d3plus-shell/src/Shell.js":5,"d3-selection":1}],3:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Setting = (function () {
  function Setting(value) {
    var allowed = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

    _classCallCheck(this, Setting);

    this.allowed = allowed;
    this.update(value);
  }

  _createClass(Setting, [{
    key: "update",
    value: function update(value) {

      this.changed = true;
      this.type = value.constructor;
      this.value = value;
    }
  }]);

  return Setting;
})();

module.exports = Setting;

},{}],4:[function(require,module,exports){
"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Setting = require("./Setting.js");

var Settings = (function () {
  function Settings() {
    var data = arguments.length <= 0 || arguments[0] === undefined ? new Map() : arguments[0];

    _classCallCheck(this, Settings);

    if (data.constructor === Map) {
      this.data = new Map();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _step$value = _slicedToArray(_step.value, 2);

          var key = _step$value[0];
          var value = _step$value[1];

          this.data.set(key, new Setting(value));
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"]) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    } else {
      this.data = data;
    }
  }

  _createClass(Settings, [{
    key: "get",
    value: function get(name) {
      return this.data.get(name);
    }
  }, {
    key: "keys",
    value: function keys() {
      return this.data.keys();
    }
  }, {
    key: "set",
    value: function set(name, value) {

      if (this.data.has(name)) {
        this.data.get(name).update(value);
      } else {
        this.data.set(name, new Setting(value));
      }

      return this;
    }
  }]);

  return Settings;
})();

module.exports = Settings;

},{"./Setting.js":3}],5:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Settings = require("./Settings.js");

var Shell = (function () {
  function Shell() {
    var settings = arguments.length <= 0 || arguments[0] === undefined ? new Map() : arguments[0];

    _classCallCheck(this, Shell);

    this.settings = new Settings(settings);
  }

  _createClass(Shell, [{
    key: "attr",
    value: function attr(name, value) {

      if (arguments.length < 2) {
        return this.settings.get(name).value;
      }
      this.settings.set(name, value);

      return this;
    }
  }, {
    key: "attrs",
    value: function attrs(obj) {

      for (var key in obj) {
        this.attr(key, obj[key]);
      }

      return this;
    }
  }, {
    key: "reset",
    value: function reset() {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {

        for (var _iterator = this.settings.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _name = _step.value;

          this.settings.get(_name).changed = false;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"]) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return this;
    }
  }]);

  return Shell;
})();

module.exports = Shell;

},{"./Settings.js":4}],6:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"dup":1}],"d3plus-textbox":[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var d3 = require("d3-selection"),
    DataPoint = require("../../d3plus-datapoint/src/datapoint.js"),
    Shell = require("../../d3plus-shell/src/Shell.js");

/** @class */

var TextBox = (function (_Shell) {
  _inherits(TextBox, _Shell);

  function TextBox() {
    var data = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

    _classCallCheck(this, TextBox);

    _get(Object.getPrototypeOf(TextBox.prototype), "constructor", this).call(this);
    this.settings.set("resize", false);
    this.settings.set("x", 0);
    this.settings.set("y", 0);
    this.data(data);
  }

  _createClass(TextBox, [{
    key: "data",
    value: function data(arr) {

      if (!arguments.length) {
        return this.dataArray;
      }

      if (arr.constructor === String) {
        arr = d3.selectAll(arr);
      }

      if (arr instanceof d3.selection) {
        this.dataArray = [];
        var self = this;
        arr.each(function () {
          self.dataArray.push(new DataPoint(this, self.settings));
        });
      } else {
        this.dataArray = arr.map(function (d) {
          return new DataPoint(d, this.settings);
        });
      }

      return this;
    }
  }, {
    key: "draw",
    value: function draw(timing) {

      if (arguments.length) {
        this.timing = timing;
      }

      return this;
    }
  }]);

  return TextBox;
})(Shell);

module.exports = TextBox;

},{"../../d3plus-datapoint/src/datapoint.js":2,"../../d3plus-shell/src/Shell.js":5,"d3-selection":6}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9kM3BsdXMtZGF0YXBvaW50L25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vYnVpbGQvZDMuanMiLCIvVXNlcnMvRGF2ZS9TaXRlcy9kM3BsdXMtZGF0YXBvaW50L3NyYy9kYXRhcG9pbnQuanMiLCIvVXNlcnMvRGF2ZS9TaXRlcy9kM3BsdXMtc2hlbGwvc3JjL1NldHRpbmcuanMiLCIvVXNlcnMvRGF2ZS9TaXRlcy9kM3BsdXMtc2hlbGwvc3JjL1NldHRpbmdzLmpzIiwiL1VzZXJzL0RhdmUvU2l0ZXMvZDNwbHVzLXNoZWxsL3NyYy9TaGVsbC5qcyIsIi9Vc2Vycy9EYXZlL1NpdGVzL2QzcGx1cy10ZXh0Ym94L3NyYy90ZXh0Ym94LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFTLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1NBQ3pELENBQUMsQ0FBQztPQUNKLE1BQ0k7QUFDSCxZQUFJLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBUyxDQUFDLEVBQUU7QUFDbkMsaUJBQU8sSUFBSSxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUN4QyxDQUFDLENBQUM7T0FDSjs7QUFFRCxhQUFPLElBQUksQ0FBQztLQUViOzs7V0FFSSxjQUFDLE1BQU0sRUFBRTs7QUFFWixVQUFJLFNBQVMsQ0FBQyxNQUFNLEVBQUU7QUFDcEIsWUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7T0FDdEI7O0FBRUQsYUFBTyxJQUFJLENBQUM7S0FFYjs7O1NBL0NHLE9BQU87R0FBUyxLQUFLOztBQW1EM0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaWYgKHR5cGVvZiBNYXAgPT09IFwidW5kZWZpbmVkXCIpIHtcbiAgTWFwID0gZnVuY3Rpb24oKSB7fTtcbiAgTWFwLnByb3RvdHlwZSA9IHtcbiAgICBzZXQ6IGZ1bmN0aW9uKGssIHYpIHsgdGhpc1tcIiRcIiArIGtdID0gdjsgcmV0dXJuIHRoaXM7IH0sXG4gICAgZ2V0OiBmdW5jdGlvbihrKSB7IHJldHVybiB0aGlzW1wiJFwiICsga107IH0sXG4gICAgaGFzOiBmdW5jdGlvbihrKSB7IHJldHVybiBcIiRcIiArIGsgaW4gdGhpczsgfVxuICB9O1xufVxuXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICAgIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuICAgIGdsb2JhbC5kMyA9IGZhY3RvcnkoKTtcbn0odGhpcywgZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgYnVnNDQwODMgPSB0eXBlb2YgbmF2aWdhdG9yICE9PSBcInVuZGVmaW5lZFwiICYmIC9XZWJLaXQvLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkgPyAtMSA6IDA7IC8vIGh0dHBzOi8vYnVncy53ZWJraXQub3JnL3Nob3dfYnVnLmNnaT9pZD00NDA4My8vIFdoZW4gZGVwdGggPSAxLCByb290ID0gW05vZGUsIOKApl0uXG4gICAgLy8gV2hlbiBkZXB0aCA9IDIsIHJvb3QgPSBbW05vZGUsIOKApl0sIOKApl0uXG4gICAgLy8gV2hlbiBkZXB0aCA9IDMsIHJvb3QgPSBbW1tOb2RlLCDigKZdLCDigKZdLCDigKZdLiBldGMuXG4gICAgLy8gTm90ZSB0aGF0IFtOb2RlLCDigKZdIGFuZCBOb2RlTGlzdCBhcmUgdXNlZCBpbnRlcmNoYW5nZWFibHk7IHNlZSBhcnJheWlmeS5cblxuICAgIGZ1bmN0aW9uIFNlbGVjdGlvbihyb290LCBkZXB0aCkge1xuICAgICAgdGhpcy5fcm9vdCA9IHJvb3Q7XG4gICAgICB0aGlzLl9kZXB0aCA9IGRlcHRoO1xuICAgICAgdGhpcy5fZW50ZXIgPSB0aGlzLl91cGRhdGUgPSB0aGlzLl9leGl0ID0gbnVsbDtcbiAgICB9XG4gICAgdmFyIGRlZmF1bHRWaWV3ID0gZnVuY3Rpb24obm9kZSkge1xuICAgICAgcmV0dXJuIG5vZGVcbiAgICAgICAgICAmJiAoKG5vZGUub3duZXJEb2N1bWVudCAmJiBub2RlLm93bmVyRG9jdW1lbnQuZGVmYXVsdFZpZXcpIC8vIG5vZGUgaXMgYSBOb2RlXG4gICAgICAgICAgICAgIHx8IChub2RlLmRvY3VtZW50ICYmIG5vZGUpIC8vIG5vZGUgaXMgYSBXaW5kb3dcbiAgICAgICAgICAgICAgfHwgbm9kZS5kZWZhdWx0Vmlldyk7IC8vIG5vZGUgaXMgYSBEb2N1bWVudFxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQobm9kZSwgdHlwZSwgcGFyYW1zKSB7XG4gICAgICB2YXIgd2luZG93ID0gZGVmYXVsdFZpZXcobm9kZSksXG4gICAgICAgICAgZXZlbnQgPSB3aW5kb3cuQ3VzdG9tRXZlbnQ7XG5cbiAgICAgIGlmIChldmVudCkge1xuICAgICAgICBldmVudCA9IG5ldyBldmVudCh0eXBlLCBwYXJhbXMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXZlbnQgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJFdmVudFwiKTtcbiAgICAgICAgaWYgKHBhcmFtcykgZXZlbnQuaW5pdEV2ZW50KHR5cGUsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSksIGV2ZW50LmRldGFpbCA9IHBhcmFtcy5kZXRhaWw7XG4gICAgICAgIGVsc2UgZXZlbnQuaW5pdEV2ZW50KHR5cGUsIGZhbHNlLCBmYWxzZSk7XG4gICAgICB9XG5cbiAgICAgIG5vZGUuZGlzcGF0Y2hFdmVudChldmVudCk7XG4gICAgfVxuXG4gICAgdmFyIHNlbGVjdGlvbl9kaXNwYXRjaCA9IGZ1bmN0aW9uKHR5cGUsIHBhcmFtcykge1xuXG4gICAgICBmdW5jdGlvbiBkaXNwYXRjaENvbnN0YW50KCkge1xuICAgICAgICByZXR1cm4gZGlzcGF0Y2hFdmVudCh0aGlzLCB0eXBlLCBwYXJhbXMpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBkaXNwYXRjaEZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gZGlzcGF0Y2hFdmVudCh0aGlzLCB0eXBlLCBwYXJhbXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmVhY2godHlwZW9mIHBhcmFtcyA9PT0gXCJmdW5jdGlvblwiID8gZGlzcGF0Y2hGdW5jdGlvbiA6IGRpc3BhdGNoQ29uc3RhbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5vb3AoKSB7fVxuICAgIHZhciByZXF1b3RlUmUgPSAvW1xcXFxcXF5cXCRcXCpcXCtcXD9cXHxcXFtcXF1cXChcXClcXC5cXHtcXH1dL2c7XG5cbiAgICB2YXIgcmVxdW90ZSA9IGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKHJlcXVvdGVSZSwgXCJcXFxcJCZcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZmlsdGVyTGlzdGVuZXJPZihsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIHZhciByZWxhdGVkID0gZXZlbnQucmVsYXRlZFRhcmdldDtcbiAgICAgICAgaWYgKCFyZWxhdGVkIHx8IChyZWxhdGVkICE9PSB0aGlzICYmICEocmVsYXRlZC5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbih0aGlzKSAmIDgpKSkge1xuICAgICAgICAgIGxpc3RlbmVyKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgZXZlbnQgPSBudWxsO1xuXG4gICAgZnVuY3Rpb24gbGlzdGVuZXJPZihsaXN0ZW5lciwgYW5jZXN0b3JzLCBhcmdzKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oZXZlbnQxKSB7XG4gICAgICAgIHZhciBpID0gYW5jZXN0b3JzLmxlbmd0aCwgZXZlbnQwID0gZXZlbnQ7IC8vIEV2ZW50cyBjYW4gYmUgcmVlbnRyYW50IChlLmcuLCBmb2N1cykuXG4gICAgICAgIHdoaWxlICgtLWkgPj0gMCkgYXJnc1tpIDw8IDFdID0gYW5jZXN0b3JzW2ldLl9fZGF0YV9fO1xuICAgICAgICBldmVudCA9IGV2ZW50MTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBsaXN0ZW5lci5hcHBseShhbmNlc3RvcnNbMF0sIGFyZ3MpO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGV2ZW50ID0gZXZlbnQwO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciBmaWx0ZXJFdmVudHMgPSBuZXcgTWFwO1xuXG4gICAgdmFyIHNlbGVjdGlvbl9ldmVudCA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyLCBjYXB0dXJlKSB7XG4gICAgICB2YXIgbiA9IGFyZ3VtZW50cy5sZW5ndGgsXG4gICAgICAgICAga2V5ID0gXCJfX29uXCIgKyB0eXBlLFxuICAgICAgICAgIGZpbHRlcixcbiAgICAgICAgICByb290ID0gdGhpcy5fcm9vdDtcblxuICAgICAgaWYgKG4gPCAyKSByZXR1cm4gKG4gPSB0aGlzLm5vZGUoKVtrZXldKSAmJiBuLl9saXN0ZW5lcjtcblxuICAgICAgaWYgKG4gPCAzKSBjYXB0dXJlID0gZmFsc2U7XG4gICAgICBpZiAoKG4gPSB0eXBlLmluZGV4T2YoXCIuXCIpKSA+IDApIHR5cGUgPSB0eXBlLnNsaWNlKDAsIG4pO1xuICAgICAgaWYgKGZpbHRlciA9IGZpbHRlckV2ZW50cy5oYXModHlwZSkpIHR5cGUgPSBmaWx0ZXJFdmVudHMuZ2V0KHR5cGUpO1xuXG4gICAgICBmdW5jdGlvbiBhZGQoKSB7XG4gICAgICAgIHZhciBhbmNlc3RvciA9IHJvb3QsIGkgPSBhcmd1bWVudHMubGVuZ3RoID4+IDEsIGFuY2VzdG9ycyA9IG5ldyBBcnJheShpKTtcbiAgICAgICAgd2hpbGUgKC0taSA+PSAwKSBhbmNlc3RvciA9IGFuY2VzdG9yW2FyZ3VtZW50c1soaSA8PCAxKSArIDFdXSwgYW5jZXN0b3JzW2ldID0gaSA/IGFuY2VzdG9yLl9wYXJlbnQgOiBhbmNlc3RvcjtcbiAgICAgICAgdmFyIGwgPSBsaXN0ZW5lck9mKGxpc3RlbmVyLCBhbmNlc3RvcnMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGlmIChmaWx0ZXIpIGwgPSBmaWx0ZXJMaXN0ZW5lck9mKGwpO1xuICAgICAgICByZW1vdmUuY2FsbCh0aGlzKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKHR5cGUsIHRoaXNba2V5XSA9IGwsIGwuX2NhcHR1cmUgPSBjYXB0dXJlKTtcbiAgICAgICAgbC5fbGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgICB2YXIgbCA9IHRoaXNba2V5XTtcbiAgICAgICAgaWYgKGwpIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgbCwgbC5fY2FwdHVyZSk7XG4gICAgICAgICAgZGVsZXRlIHRoaXNba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiByZW1vdmVBbGwoKSB7XG4gICAgICAgIHZhciByZSA9IG5ldyBSZWdFeHAoXCJeX19vbihbXi5dKylcIiArIHJlcXVvdGUodHlwZSkgKyBcIiRcIiksIG1hdGNoO1xuICAgICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgICBpZiAobWF0Y2ggPSBuYW1lLm1hdGNoKHJlKSkge1xuICAgICAgICAgICAgdmFyIGwgPSB0aGlzW25hbWVdO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG1hdGNoWzFdLCBsLCBsLl9jYXB0dXJlKTtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzW25hbWVdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGxpc3RlbmVyXG4gICAgICAgICAgPyAobiA/IGFkZCA6IG5vb3ApIC8vIEF0dGVtcHQgdG8gYWRkIHVudHlwZWQgbGlzdGVuZXIgaXMgaWdub3JlZC5cbiAgICAgICAgICA6IChuID8gcmVtb3ZlIDogcmVtb3ZlQWxsKSk7XG4gICAgfVxuICAgIHZhciBzZWxlY3Rpb25fZGF0dW0gPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyB0aGlzLnByb3BlcnR5KFwiX19kYXRhX19cIiwgdmFsdWUpIDogdGhpcy5ub2RlKCkuX19kYXRhX187XG4gICAgfVxuICAgIHZhciBzZWxlY3Rpb25fcmVtb3ZlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICAgICAgICBpZiAocGFyZW50KSBwYXJlbnQucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdmFyIHNlbGVjdG9yT2YgPSBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgICAgIH07XG4gICAgfVxuICAgIHZhciBuYW1lc3BhY2VzID0gKG5ldyBNYXApXG4gICAgICAgIC5zZXQoXCJzdmdcIiwgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiKVxuICAgICAgICAuc2V0KFwieGh0bWxcIiwgXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIpXG4gICAgICAgIC5zZXQoXCJ4bGlua1wiLCBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIilcbiAgICAgICAgLnNldChcInhtbFwiLCBcImh0dHA6Ly93d3cudzMub3JnL1hNTC8xOTk4L25hbWVzcGFjZVwiKVxuICAgICAgICAuc2V0KFwieG1sbnNcIiwgXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3htbG5zL1wiKTtcblxuICAgIHZhciBuYW1lc3BhY2UgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgaSA9IG5hbWUuaW5kZXhPZihcIjpcIiksIHByZWZpeCA9IG5hbWU7XG4gICAgICBpZiAoaSA+PSAwKSBwcmVmaXggPSBuYW1lLnNsaWNlKDAsIGkpLCBuYW1lID0gbmFtZS5zbGljZShpICsgMSk7XG4gICAgICByZXR1cm4gbmFtZXNwYWNlcy5oYXMocHJlZml4KSA/IHtzcGFjZTogbmFtZXNwYWNlcy5nZXQocHJlZml4KSwgbG9jYWw6IG5hbWV9IDogbmFtZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjcmVhdG9yT2YobmFtZSkge1xuICAgICAgbmFtZSA9IG5hbWVzcGFjZShuYW1lKTtcblxuICAgICAgZnVuY3Rpb24gY3JlYXRvcigpIHtcbiAgICAgICAgdmFyIGRvY3VtZW50ID0gdGhpcy5vd25lckRvY3VtZW50LFxuICAgICAgICAgICAgdXJpID0gdGhpcy5uYW1lc3BhY2VVUkk7XG4gICAgICAgIHJldHVybiB1cmlcbiAgICAgICAgICAgID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHVyaSwgbmFtZSlcbiAgICAgICAgICAgIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY3JlYXRvck5TKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lLnNwYWNlLCBuYW1lLmxvY2FsKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5hbWUubG9jYWwgPyBjcmVhdG9yTlMgOiBjcmVhdG9yO1xuICAgIH1cblxuICAgIHZhciBzZWxlY3Rpb25fYXBwZW5kID0gZnVuY3Rpb24oY3JlYXRvciwgc2VsZWN0b3IpIHtcbiAgICAgIGlmICh0eXBlb2YgY3JlYXRvciAhPT0gXCJmdW5jdGlvblwiKSBjcmVhdG9yID0gY3JlYXRvck9mKGNyZWF0b3IpO1xuXG4gICAgICBmdW5jdGlvbiBhcHBlbmQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFwcGVuZENoaWxkKGNyZWF0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGluc2VydCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5zZXJ0QmVmb3JlKGNyZWF0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKSwgc2VsZWN0b3IuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCBudWxsKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0KGFyZ3VtZW50cy5sZW5ndGggPCAyXG4gICAgICAgICAgPyBhcHBlbmRcbiAgICAgICAgICA6ICh0eXBlb2Ygc2VsZWN0b3IgIT09IFwiZnVuY3Rpb25cIiAmJiAoc2VsZWN0b3IgPSBzZWxlY3Rvck9mKHNlbGVjdG9yKSksIGluc2VydCkpO1xuICAgIH1cbiAgICB2YXIgc2VsZWN0aW9uX2h0bWwgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy5ub2RlKCkuaW5uZXJIVE1MO1xuXG4gICAgICBmdW5jdGlvbiBzZXRDb25zdGFudCgpIHtcbiAgICAgICAgdGhpcy5pbm5lckhUTUwgPSB2YWx1ZTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2V0RnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5pbm5lckhUTUwgPSB2ID09IG51bGwgPyBcIlwiIDogdjtcbiAgICAgIH1cblxuICAgICAgaWYgKHZhbHVlID09IG51bGwpIHZhbHVlID0gXCJcIjtcblxuICAgICAgcmV0dXJuIHRoaXMuZWFjaCh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IHNldEZ1bmN0aW9uIDogc2V0Q29uc3RhbnQpO1xuICAgIH1cbiAgICB2YXIgc2VsZWN0aW9uX3RleHQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGhpcy5ub2RlKCkudGV4dENvbnRlbnQ7XG5cbiAgICAgIGZ1bmN0aW9uIHNldENvbnN0YW50KCkge1xuICAgICAgICB0aGlzLnRleHRDb250ZW50ID0gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNldEZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMudGV4dENvbnRlbnQgPSB2ID09IG51bGwgPyBcIlwiIDogdjtcbiAgICAgIH1cblxuICAgICAgaWYgKHZhbHVlID09IG51bGwpIHZhbHVlID0gXCJcIjtcblxuICAgICAgcmV0dXJuIHRoaXMuZWFjaCh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IHNldEZ1bmN0aW9uIDogc2V0Q29uc3RhbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbGxhcHNlKHN0cmluZykge1xuICAgICAgcmV0dXJuIHN0cmluZy50cmltKCkucmVwbGFjZSgvXFxzKy9nLCBcIiBcIik7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2xhc3Nlck9mKG5hbWUpIHtcbiAgICAgIHZhciByZTtcbiAgICAgIHJldHVybiBmdW5jdGlvbihub2RlLCB2YWx1ZSkge1xuICAgICAgICBpZiAoYyA9IG5vZGUuY2xhc3NMaXN0KSByZXR1cm4gdmFsdWUgPyBjLmFkZChuYW1lKSA6IGMucmVtb3ZlKG5hbWUpO1xuICAgICAgICBpZiAoIXJlKSByZSA9IG5ldyBSZWdFeHAoXCIoPzpefFxcXFxzKylcIiArIHJlcXVvdGUobmFtZSkgKyBcIig/OlxcXFxzK3wkKVwiLCBcImdcIik7XG4gICAgICAgIHZhciBjID0gbm9kZS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKSB8fCBcIlwiO1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICByZS5sYXN0SW5kZXggPSAwO1xuICAgICAgICAgIGlmICghcmUudGVzdChjKSkgbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBjb2xsYXBzZShjICsgXCIgXCIgKyBuYW1lKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBjb2xsYXBzZShjLnJlcGxhY2UocmUsIFwiIFwiKSkpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cblxuICAgIHZhciBzZWxlY3Rpb25fY2xhc3MgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgICAgbmFtZSA9IChuYW1lICsgXCJcIikudHJpbSgpLnNwbGl0KC9efFxccysvKTtcbiAgICAgIHZhciBuID0gbmFtZS5sZW5ndGg7XG5cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgICB2YXIgbm9kZSA9IHRoaXMubm9kZSgpLCBpID0gLTE7XG4gICAgICAgIGlmICh2YWx1ZSA9IG5vZGUuY2xhc3NMaXN0KSB7IC8vIFNWRyBlbGVtZW50cyBtYXkgbm90IHN1cHBvcnQgRE9NVG9rZW5MaXN0IVxuICAgICAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoIXZhbHVlLmNvbnRhaW5zKG5hbWVbaV0pKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgPSBub2RlLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpO1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoIWNsYXNzZWRSZShuYW1lW2ldKS50ZXN0KHZhbHVlKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuXG4gICAgICBuYW1lID0gbmFtZS5tYXAoY2xhc3Nlck9mKTtcblxuICAgICAgZnVuY3Rpb24gc2V0Q29uc3RhbnQoKSB7XG4gICAgICAgIHZhciBpID0gLTE7XG4gICAgICAgIHdoaWxlICgrK2kgPCBuKSBuYW1lW2ldKHRoaXMsIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2V0RnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpID0gLTEsIHggPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB3aGlsZSAoKytpIDwgbikgbmFtZVtpXSh0aGlzLCB4KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuZWFjaCh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IHNldEZ1bmN0aW9uIDogc2V0Q29uc3RhbnQpO1xuICAgIH1cbiAgICB2YXIgc2VsZWN0aW9uX3Byb3BlcnR5ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcmV0dXJuIHRoaXMubm9kZSgpW25hbWVdO1xuXG4gICAgICBmdW5jdGlvbiByZW1vdmUoKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzW25hbWVdO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzZXRDb25zdGFudCgpIHtcbiAgICAgICAgdGhpc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzZXRGdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHggPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICBpZiAoeCA9PSBudWxsKSBkZWxldGUgdGhpc1tuYW1lXTtcbiAgICAgICAgZWxzZSB0aGlzW25hbWVdID0geDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuZWFjaCh2YWx1ZSA9PSBudWxsID8gcmVtb3ZlIDogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyBzZXRGdW5jdGlvbiA6IHNldENvbnN0YW50KTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZWN0aW9uX3N0eWxlID0gZnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gICAgICB2YXIgbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG5cbiAgICAgIGlmIChuIDwgMikgcmV0dXJuIGRlZmF1bHRWaWV3KG4gPSB0aGlzLm5vZGUoKSkuZ2V0Q29tcHV0ZWRTdHlsZShuLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKG5hbWUpO1xuXG4gICAgICBpZiAobiA8IDMpIHByaW9yaXR5ID0gXCJcIjtcblxuICAgICAgZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgICB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzZXRDb25zdGFudCgpIHtcbiAgICAgICAgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzZXRGdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHggPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICBpZiAoeCA9PSBudWxsKSB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpO1xuICAgICAgICBlbHNlIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkobmFtZSwgeCwgcHJpb3JpdHkpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5lYWNoKHZhbHVlID09IG51bGwgPyByZW1vdmUgOiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IHNldEZ1bmN0aW9uIDogc2V0Q29uc3RhbnQpO1xuICAgIH1cblxuICAgIHZhciBzZWxlY3Rpb25fYXR0ciA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgICBuYW1lID0gbmFtZXNwYWNlKG5hbWUpO1xuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLm5vZGUoKTtcbiAgICAgICAgcmV0dXJuIG5hbWUubG9jYWxcbiAgICAgICAgICAgID8gbm9kZS5nZXRBdHRyaWJ1dGVOUyhuYW1lLnNwYWNlLCBuYW1lLmxvY2FsKVxuICAgICAgICAgICAgOiBub2RlLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmVtb3ZlTlMoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMobmFtZS5zcGFjZSwgbmFtZS5sb2NhbCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNldENvbnN0YW50KCkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNldENvbnN0YW50TlMoKSB7XG4gICAgICAgIHRoaXMuc2V0QXR0cmlidXRlTlMobmFtZS5zcGFjZSwgbmFtZS5sb2NhbCwgdmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzZXRGdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHggPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICBpZiAoeCA9PSBudWxsKSB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgZWxzZSB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCB4KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2V0RnVuY3Rpb25OUygpIHtcbiAgICAgICAgdmFyIHggPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICBpZiAoeCA9PSBudWxsKSB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKG5hbWUuc3BhY2UsIG5hbWUubG9jYWwpO1xuICAgICAgICBlbHNlIHRoaXMuc2V0QXR0cmlidXRlTlMobmFtZS5zcGFjZSwgbmFtZS5sb2NhbCwgeCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmVhY2godmFsdWUgPT0gbnVsbFxuICAgICAgICAgID8gKG5hbWUubG9jYWwgPyByZW1vdmVOUyA6IHJlbW92ZSlcbiAgICAgICAgICA6ICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgICA/IChuYW1lLmxvY2FsID8gc2V0RnVuY3Rpb25OUyA6IHNldEZ1bmN0aW9uKVxuICAgICAgICAgICAgICA6IChuYW1lLmxvY2FsID8gc2V0Q29uc3RhbnROUyA6IHNldENvbnN0YW50KSkpO1xuICAgIH1cbiAgICB2YXIgc2VsZWN0aW9uX2VhY2ggPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgdmFyIGRlcHRoID0gdGhpcy5fZGVwdGgsXG4gICAgICAgICAgc3RhY2sgPSBuZXcgQXJyYXkoZGVwdGgpO1xuXG4gICAgICBmdW5jdGlvbiB2aXNpdChub2RlcywgZGVwdGgpIHtcbiAgICAgICAgdmFyIGkgPSAtMSxcbiAgICAgICAgICAgIG4gPSBub2Rlcy5sZW5ndGgsXG4gICAgICAgICAgICBub2RlO1xuXG4gICAgICAgIGlmICgtLWRlcHRoKSB7XG4gICAgICAgICAgdmFyIHN0YWNrMCA9IGRlcHRoICogMixcbiAgICAgICAgICAgICAgc3RhY2sxID0gc3RhY2swICsgMTtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgICAgaWYgKG5vZGUgPSBub2Rlc1tpXSkge1xuICAgICAgICAgICAgICBzdGFja1tzdGFjazBdID0gbm9kZS5fcGFyZW50Ll9fZGF0YV9fLCBzdGFja1tzdGFjazFdID0gaTtcbiAgICAgICAgICAgICAgdmlzaXQobm9kZSwgZGVwdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgICAgICBpZiAobm9kZSA9IG5vZGVzW2ldKSB7XG4gICAgICAgICAgICAgIHN0YWNrWzBdID0gbm9kZS5fX2RhdGFfXywgc3RhY2tbMV0gPSBpO1xuICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShub2RlLCBzdGFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZpc2l0KHRoaXMuX3Jvb3QsIGRlcHRoKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB2YXIgc2VsZWN0aW9uX2VtcHR5ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gIXRoaXMubm9kZSgpO1xuICAgIH1cbiAgICB2YXIgc2VsZWN0aW9uX3NpemUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzaXplID0gMDtcbiAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHsgKytzaXplOyB9KTtcbiAgICAgIHJldHVybiBzaXplO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpcnN0Tm9kZShub2RlcywgZGVwdGgpIHtcbiAgICAgIHZhciBpID0gLTEsXG4gICAgICAgICAgbiA9IG5vZGVzLmxlbmd0aCxcbiAgICAgICAgICBub2RlO1xuXG4gICAgICBpZiAoLS1kZXB0aCkge1xuICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgIGlmIChub2RlID0gbm9kZXNbaV0pIHtcbiAgICAgICAgICAgIGlmIChub2RlID0gZmlyc3ROb2RlKG5vZGUsIGRlcHRoKSkge1xuICAgICAgICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZWxzZSB7XG4gICAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgICAgaWYgKG5vZGUgPSBub2Rlc1tpXSkge1xuICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBzZWxlY3Rpb25fbm9kZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZpcnN0Tm9kZSh0aGlzLl9yb290LCB0aGlzLl9kZXB0aCk7XG4gICAgfVxuICAgIHZhciBzZWxlY3Rpb25fbm9kZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBub2RlcyA9IG5ldyBBcnJheSh0aGlzLnNpemUoKSksIGkgPSAtMTtcbiAgICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHsgbm9kZXNbKytpXSA9IHRoaXM7IH0pO1xuICAgICAgcmV0dXJuIG5vZGVzO1xuICAgIH1cbiAgICB2YXIgc2VsZWN0aW9uX2NhbGwgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3VtZW50c1swXTtcbiAgICAgIGNhbGxiYWNrLmFwcGx5KGFyZ3VtZW50c1swXSA9IHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhcnJheWlmeU5vZGUobm9kZXMsIGRlcHRoKSB7XG4gICAgICB2YXIgaSA9IC0xLFxuICAgICAgICAgIG4gPSBub2Rlcy5sZW5ndGgsXG4gICAgICAgICAgbm9kZTtcblxuICAgICAgaWYgKC0tZGVwdGgpIHtcbiAgICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgICBpZiAobm9kZSA9IG5vZGVzW2ldKSB7XG4gICAgICAgICAgICBub2Rlc1tpXSA9IGFycmF5aWZ5Tm9kZShub2RlLCBkZXB0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGVsc2UgaWYgKCFBcnJheS5pc0FycmF5KG5vZGVzKSkge1xuICAgICAgICB2YXIgYXJyYXkgPSBuZXcgQXJyYXkobik7XG4gICAgICAgIHdoaWxlICgrK2kgPCBuKSBhcnJheVtpXSA9IG5vZGVzW2ldO1xuICAgICAgICBhcnJheS5fcGFyZW50ID0gbm9kZXMuX3BhcmVudDtcbiAgICAgICAgbm9kZXMgPSBhcnJheTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5vZGVzO1xuICAgIH0vLyBUaGUgbGVhZiBncm91cHMgb2YgdGhlIHNlbGVjdGlvbiBoaWVyYXJjaHkgYXJlIGluaXRpYWxseSBOb2RlTGlzdCxcbiAgICAvLyBhbmQgdGhlbiBsYXppbHkgY29udmVydGVkIHRvIGFycmF5cyB3aGVuIG11dGF0aW9uIGlzIHJlcXVpcmVkLlxuICAgIHZhciBhcnJheWlmeSA9IGZ1bmN0aW9uKHNlbGVjdGlvbikge1xuICAgICAgcmV0dXJuIHNlbGVjdGlvbi5fcm9vdCA9IGFycmF5aWZ5Tm9kZShzZWxlY3Rpb24uX3Jvb3QsIHNlbGVjdGlvbi5fZGVwdGgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFzY2VuZGluZyhhLCBiKSB7XG4gICAgICByZXR1cm4gYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IGEgPj0gYiA/IDAgOiBOYU47XG4gICAgfVxuXG4gICAgdmFyIHNlbGVjdGlvbl9zb3J0ID0gZnVuY3Rpb24oY29tcGFyYXRvcikge1xuICAgICAgaWYgKCFjb21wYXJhdG9yKSBjb21wYXJhdG9yID0gYXNjZW5kaW5nO1xuXG4gICAgICBmdW5jdGlvbiBjb21wYXJlKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEgJiYgYiA/IGNvbXBhcmF0b3IoYS5fX2RhdGFfXywgYi5fX2RhdGFfXykgOiAhYSAtICFiO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiB2aXNpdChub2RlcywgZGVwdGgpIHtcbiAgICAgICAgaWYgKC0tZGVwdGgpIHtcbiAgICAgICAgICB2YXIgaSA9IC0xLFxuICAgICAgICAgICAgICBuID0gbm9kZXMubGVuZ3RoLFxuICAgICAgICAgICAgICBub2RlO1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgICAgICBpZiAobm9kZSA9IG5vZGVzW2ldKSB7XG4gICAgICAgICAgICAgIHZpc2l0KG5vZGUsIGRlcHRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBub2Rlcy5zb3J0KGNvbXBhcmUpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZpc2l0KGFycmF5aWZ5KHRoaXMpLCB0aGlzLl9kZXB0aCk7XG4gICAgICByZXR1cm4gdGhpcy5vcmRlcigpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9yZGVyTm9kZShub2RlcywgZGVwdGgpIHtcbiAgICAgIHZhciBpID0gbm9kZXMubGVuZ3RoLFxuICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgbmV4dDtcblxuICAgICAgaWYgKC0tZGVwdGgpIHtcbiAgICAgICAgd2hpbGUgKC0taSA+PSAwKSB7XG4gICAgICAgICAgaWYgKG5vZGUgPSBub2Rlc1tpXSkge1xuICAgICAgICAgICAgb3JkZXJOb2RlKG5vZGUsIGRlcHRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZWxzZSB7XG4gICAgICAgIG5leHQgPSBub2Rlc1stLWldO1xuICAgICAgICB3aGlsZSAoLS1pID49IDApIHtcbiAgICAgICAgICBpZiAobm9kZSA9IG5vZGVzW2ldKSB7XG4gICAgICAgICAgICBpZiAobmV4dCAmJiBuZXh0ICE9PSBub2RlLm5leHRTaWJsaW5nKSBuZXh0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIG5leHQpO1xuICAgICAgICAgICAgbmV4dCA9IG5vZGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBzZWxlY3Rpb25fb3JkZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIG9yZGVyTm9kZSh0aGlzLl9yb290LCB0aGlzLl9kZXB0aCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBlbXB0eU5vZGUobm9kZXMsIGRlcHRoKSB7XG4gICAgICB2YXIgaSA9IC0xLFxuICAgICAgICAgIG4gPSBub2Rlcy5sZW5ndGgsXG4gICAgICAgICAgbm9kZSxcbiAgICAgICAgICBlbXB0eSA9IG5ldyBBcnJheShuKTtcblxuICAgICAgaWYgKC0tZGVwdGgpIHtcbiAgICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgICBpZiAobm9kZSA9IG5vZGVzW2ldKSB7XG4gICAgICAgICAgICBlbXB0eVtpXSA9IGVtcHR5Tm9kZShub2RlLCBkZXB0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGVtcHR5Ll9wYXJlbnQgPSBub2Rlcy5fcGFyZW50O1xuICAgICAgcmV0dXJuIGVtcHR5O1xuICAgIH1cblxuICAgIHZhciBlbXB0eU9mID0gZnVuY3Rpb24oc2VsZWN0aW9uKSB7XG4gICAgICByZXR1cm4gbmV3IFNlbGVjdGlvbihlbXB0eU5vZGUoYXJyYXlpZnkoc2VsZWN0aW9uKSwgc2VsZWN0aW9uLl9kZXB0aCksIHNlbGVjdGlvbi5fZGVwdGgpO1xuICAgIH0vLyBMYXppbHkgY29uc3RydWN0cyB0aGUgZXhpdCBzZWxlY3Rpb24gZm9yIHRoaXMgKHVwZGF0ZSkgc2VsZWN0aW9uLlxuICAgIC8vIFVudGlsIHRoaXMgc2VsZWN0aW9uIGlzIGpvaW5lZCB0byBkYXRhLCB0aGUgZXhpdCBzZWxlY3Rpb24gd2lsbCBiZSBlbXB0eS5cblxuICAgIHZhciBzZWxlY3Rpb25fZXhpdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2V4aXQgfHwgKHRoaXMuX2V4aXQgPSBlbXB0eU9mKHRoaXMpKTtcbiAgICB9Ly8gTGF6aWx5IGNvbnN0cnVjdHMgdGhlIGVudGVyIHNlbGVjdGlvbiBmb3IgdGhpcyAodXBkYXRlKSBzZWxlY3Rpb24uXG4gICAgLy8gVW50aWwgdGhpcyBzZWxlY3Rpb24gaXMgam9pbmVkIHRvIGRhdGEsIHRoZSBlbnRlciBzZWxlY3Rpb24gd2lsbCBiZSBlbXB0eS5cblxuICAgIHZhciBzZWxlY3Rpb25fZW50ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghdGhpcy5fZW50ZXIpIHtcbiAgICAgICAgdGhpcy5fZW50ZXIgPSBlbXB0eU9mKHRoaXMpO1xuICAgICAgICB0aGlzLl9lbnRlci5fdXBkYXRlID0gdGhpcztcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLl9lbnRlcjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBFbnRlck5vZGUocGFyZW50LCBkYXR1bSkge1xuICAgICAgdGhpcy5vd25lckRvY3VtZW50ID0gcGFyZW50Lm93bmVyRG9jdW1lbnQ7XG4gICAgICB0aGlzLm5hbWVzcGFjZVVSSSA9IHBhcmVudC5uYW1lc3BhY2VVUkk7XG4gICAgICB0aGlzLl9uZXh0ID0gbnVsbDtcbiAgICAgIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcbiAgICAgIHRoaXMuX19kYXRhX18gPSBkYXR1bTtcbiAgICB9XG5cbiAgICBFbnRlck5vZGUucHJvdG90eXBlID0ge1xuICAgICAgYXBwZW5kQ2hpbGQ6IGZ1bmN0aW9uKGNoaWxkKSB7IHJldHVybiB0aGlzLl9wYXJlbnQuaW5zZXJ0QmVmb3JlKGNoaWxkLCB0aGlzLl9uZXh0KTsgfSxcbiAgICAgIGluc2VydEJlZm9yZTogZnVuY3Rpb24oY2hpbGQsIG5leHQpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5pbnNlcnRCZWZvcmUoY2hpbGQsIG5leHQgfHwgdGhpcy5fbmV4dCk7IH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gdmFsdWVPZl8odmFsdWUpIHsgLy8gWFhYIGh0dHBzOi8vZ2l0aHViLmNvbS9yb2xsdXAvcm9sbHVwL2lzc3Vlcy8xMlxuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICB9O1xuICAgIH0vLyBUaGUgdmFsdWUgbWF5IGVpdGhlciBiZSBhbiBhcnJheSBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBhcnJheS5cbiAgICAvLyBBbiBvcHRpb25hbCBrZXkgZnVuY3Rpb24gbWF5IGJlIHNwZWNpZmllZCB0byBjb250cm9sIGhvdyBkYXRhIGlzIGJvdW5kO1xuICAgIC8vIGlmIG5vIGtleSBmdW5jdGlvbiBpcyBzcGVjaWZpZWQsIGRhdGEgaXMgYm91bmQgdG8gbm9kZXMgYnkgaW5kZXguXG4gICAgLy8gT3IsIGlmIG5vIGFyZ3VtZW50cyBhcmUgc3BlY2lmaWVkLCB0aGlzIG1ldGhvZCByZXR1cm5zIGFsbCBib3VuZCBkYXRhLlxuICAgIHZhciBzZWxlY3Rpb25fZGF0YSA9IGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgIGlmICghdmFsdWUpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBuZXcgQXJyYXkodGhpcy5zaXplKCkpLCBpID0gLTE7XG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbihkKSB7IGRhdGFbKytpXSA9IGQ7IH0pO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgIH1cblxuICAgICAgdmFyIGRlcHRoID0gdGhpcy5fZGVwdGggLSAxLFxuICAgICAgICAgIHN0YWNrID0gbmV3IEFycmF5KGRlcHRoICogMiksXG4gICAgICAgICAgYmluZCA9IGtleSA/IGJpbmRLZXkgOiBiaW5kSW5kZXg7XG5cbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdmFsdWUgPSB2YWx1ZU9mXyh2YWx1ZSk7XG4gICAgICB2aXNpdCh0aGlzLl9yb290LCB0aGlzLmVudGVyKCkuX3Jvb3QsIHRoaXMuZXhpdCgpLl9yb290LCBkZXB0aCk7XG5cbiAgICAgIGZ1bmN0aW9uIHZpc2l0KHVwZGF0ZSwgZW50ZXIsIGV4aXQsIGRlcHRoKSB7XG4gICAgICAgIHZhciBpID0gLTEsXG4gICAgICAgICAgICBuLFxuICAgICAgICAgICAgbm9kZTtcblxuICAgICAgICBpZiAoZGVwdGgtLSkge1xuICAgICAgICAgIHZhciBzdGFjazAgPSBkZXB0aCAqIDIsXG4gICAgICAgICAgICAgIHN0YWNrMSA9IHN0YWNrMCArIDE7XG5cbiAgICAgICAgICBuID0gdXBkYXRlLmxlbmd0aDtcblxuICAgICAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgICAgICBpZiAobm9kZSA9IHVwZGF0ZVtpXSkge1xuICAgICAgICAgICAgICBzdGFja1tzdGFjazBdID0gbm9kZS5fcGFyZW50Ll9fZGF0YV9fLCBzdGFja1tzdGFjazFdID0gaTtcbiAgICAgICAgICAgICAgdmlzaXQobm9kZSwgZW50ZXJbaV0sIGV4aXRbaV0sIGRlcHRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB2YXIgaiA9IDAsXG4gICAgICAgICAgICAgIGJlZm9yZTtcblxuICAgICAgICAgIGJpbmQodXBkYXRlLCBlbnRlciwgZXhpdCwgdmFsdWUuYXBwbHkodXBkYXRlLl9wYXJlbnQsIHN0YWNrKSk7XG4gICAgICAgICAgbiA9IHVwZGF0ZS5sZW5ndGg7XG5cbiAgICAgICAgICAvLyBOb3cgY29ubmVjdCB0aGUgZW50ZXIgbm9kZXMgdG8gdGhlaXIgZm9sbG93aW5nIHVwZGF0ZSBub2RlLCBzdWNoIHRoYXRcbiAgICAgICAgICAvLyBhcHBlbmRDaGlsZCBjYW4gaW5zZXJ0IHRoZSBtYXRlcmlhbGl6ZWQgZW50ZXIgbm9kZSBiZWZvcmUgdGhpcyBub2RlLFxuICAgICAgICAgIC8vIHJhdGhlciB0aGFuIGF0IHRoZSBlbmQgb2YgdGhlIHBhcmVudCBub2RlLlxuICAgICAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgICAgICBpZiAoYmVmb3JlID0gZW50ZXJbaV0pIHtcbiAgICAgICAgICAgICAgaWYgKGkgPj0gaikgaiA9IGkgKyAxO1xuICAgICAgICAgICAgICB3aGlsZSAoIShub2RlID0gdXBkYXRlW2pdKSAmJiArK2ogPCBuKTtcbiAgICAgICAgICAgICAgYmVmb3JlLl9uZXh0ID0gbm9kZSB8fCBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBiaW5kSW5kZXgodXBkYXRlLCBlbnRlciwgZXhpdCwgZGF0YSkge1xuICAgICAgICB2YXIgaSA9IDAsXG4gICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgbm9kZUxlbmd0aCA9IHVwZGF0ZS5sZW5ndGgsXG4gICAgICAgICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGgsXG4gICAgICAgICAgICBtaW5MZW5ndGggPSBNYXRoLm1pbihub2RlTGVuZ3RoLCBkYXRhTGVuZ3RoKTtcblxuICAgICAgICAvLyBDbGVhciB0aGUgZW50ZXIgYW5kIGV4aXQgYXJyYXlzLCBhbmQgdGhlbiBpbml0aWFsaXplIHRvIHRoZSBuZXcgbGVuZ3RoLlxuICAgICAgICBlbnRlci5sZW5ndGggPSAwLCBlbnRlci5sZW5ndGggPSBkYXRhTGVuZ3RoO1xuICAgICAgICBleGl0Lmxlbmd0aCA9IDAsIGV4aXQubGVuZ3RoID0gbm9kZUxlbmd0aDtcblxuICAgICAgICBmb3IgKDsgaSA8IG1pbkxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgaWYgKG5vZGUgPSB1cGRhdGVbaV0pIHtcbiAgICAgICAgICAgIG5vZGUuX19kYXRhX18gPSBkYXRhW2ldO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbnRlcltpXSA9IG5ldyBFbnRlck5vZGUodXBkYXRlLl9wYXJlbnQsIGRhdGFbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdGU6IHdlIGRvbuKAmXQgbmVlZCB0byBkZWxldGUgdXBkYXRlW2ldIGhlcmUgYmVjYXVzZSB0aGlzIGxvb3Agb25seVxuICAgICAgICAvLyBydW5zIHdoZW4gdGhlIGRhdGEgbGVuZ3RoIGlzIGdyZWF0ZXIgdGhhbiB0aGUgbm9kZSBsZW5ndGguXG4gICAgICAgIGZvciAoOyBpIDwgZGF0YUxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgZW50ZXJbaV0gPSBuZXcgRW50ZXJOb2RlKHVwZGF0ZS5fcGFyZW50LCBkYXRhW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdGU6IGFuZCwgd2UgZG9u4oCZdCBuZWVkIHRvIGRlbGV0ZSB1cGRhdGVbaV0gaGVyZSBiZWNhdXNlIGltbWVkaWF0ZWx5XG4gICAgICAgIC8vIGZvbGxvd2luZyB0aGlzIGxvb3Agd2Ugc2V0IHRoZSB1cGRhdGUgbGVuZ3RoIHRvIGRhdGEgbGVuZ3RoLlxuICAgICAgICBmb3IgKDsgaSA8IG5vZGVMZW5ndGg7ICsraSkge1xuICAgICAgICAgIGlmIChub2RlID0gdXBkYXRlW2ldKSB7XG4gICAgICAgICAgICBleGl0W2ldID0gdXBkYXRlW2ldO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHVwZGF0ZS5sZW5ndGggPSBkYXRhTGVuZ3RoO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBiaW5kS2V5KHVwZGF0ZSwgZW50ZXIsIGV4aXQsIGRhdGEpIHtcbiAgICAgICAgdmFyIGksXG4gICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgZGF0YUxlbmd0aCA9IGRhdGEubGVuZ3RoLFxuICAgICAgICAgICAgbm9kZUxlbmd0aCA9IHVwZGF0ZS5sZW5ndGgsXG4gICAgICAgICAgICBub2RlQnlLZXlWYWx1ZSA9IG5ldyBNYXAsXG4gICAgICAgICAgICBrZXlTdGFjayA9IG5ldyBBcnJheSgyKS5jb25jYXQoc3RhY2spLFxuICAgICAgICAgICAga2V5VmFsdWVzID0gbmV3IEFycmF5KG5vZGVMZW5ndGgpLFxuICAgICAgICAgICAga2V5VmFsdWU7XG5cbiAgICAgICAgLy8gQ2xlYXIgdGhlIGVudGVyIGFuZCBleGl0IGFycmF5cywgYW5kIHRoZW4gaW5pdGlhbGl6ZSB0byB0aGUgbmV3IGxlbmd0aC5cbiAgICAgICAgZW50ZXIubGVuZ3RoID0gMCwgZW50ZXIubGVuZ3RoID0gZGF0YUxlbmd0aDtcbiAgICAgICAgZXhpdC5sZW5ndGggPSAwLCBleGl0Lmxlbmd0aCA9IG5vZGVMZW5ndGg7XG5cbiAgICAgICAgLy8gQ29tcHV0ZSB0aGUga2V5cyBmb3IgZWFjaCBub2RlLlxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbm9kZUxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgaWYgKG5vZGUgPSB1cGRhdGVbaV0pIHtcbiAgICAgICAgICAgIGtleVN0YWNrWzBdID0gbm9kZS5fX2RhdGFfXywga2V5U3RhY2tbMV0gPSBpO1xuICAgICAgICAgICAga2V5VmFsdWVzW2ldID0ga2V5VmFsdWUgPSBrZXkuYXBwbHkobm9kZSwga2V5U3RhY2spO1xuXG4gICAgICAgICAgICAvLyBJcyB0aGlzIGEgZHVwbGljYXRlIG9mIGEga2V5IHdl4oCZdmUgcHJldmlvdXNseSBzZWVuP1xuICAgICAgICAgICAgLy8gSWYgc28sIHRoaXMgbm9kZSBpcyBtb3ZlZCB0byB0aGUgZXhpdCBzZWxlY3Rpb24uXG4gICAgICAgICAgICBpZiAobm9kZUJ5S2V5VmFsdWUuaGFzKGtleVZhbHVlKSkge1xuICAgICAgICAgICAgICBleGl0W2ldID0gbm9kZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gT3RoZXJ3aXNlLCByZWNvcmQgdGhlIG1hcHBpbmcgZnJvbSBrZXkgdG8gbm9kZS5cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBub2RlQnlLZXlWYWx1ZS5zZXQoa2V5VmFsdWUsIG5vZGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE5vdyBjbGVhciB0aGUgdXBkYXRlIGFycmF5IGFuZCBpbml0aWFsaXplIHRvIHRoZSBuZXcgbGVuZ3RoLlxuICAgICAgICB1cGRhdGUubGVuZ3RoID0gMCwgdXBkYXRlLmxlbmd0aCA9IGRhdGFMZW5ndGg7XG5cbiAgICAgICAgLy8gQ29tcHV0ZSB0aGUga2V5cyBmb3IgZWFjaCBkYXR1bS5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGRhdGFMZW5ndGg7ICsraSkge1xuICAgICAgICAgIGtleVN0YWNrWzBdID0gZGF0YVtpXSwga2V5U3RhY2tbMV0gPSBpO1xuICAgICAgICAgIGtleVZhbHVlID0ga2V5LmFwcGx5KHVwZGF0ZS5fcGFyZW50LCBrZXlTdGFjayk7XG5cbiAgICAgICAgICAvLyBJcyB0aGVyZSBhIG5vZGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMga2V5P1xuICAgICAgICAgIC8vIElmIG5vdCwgdGhpcyBkYXR1bSBpcyBhZGRlZCB0byB0aGUgZW50ZXIgc2VsZWN0aW9uLlxuICAgICAgICAgIGlmICghKG5vZGUgPSBub2RlQnlLZXlWYWx1ZS5nZXQoa2V5VmFsdWUpKSkge1xuICAgICAgICAgICAgZW50ZXJbaV0gPSBuZXcgRW50ZXJOb2RlKHVwZGF0ZS5fcGFyZW50LCBkYXRhW2ldKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBEaWQgd2UgYWxyZWFkeSBiaW5kIGEgbm9kZSB1c2luZyB0aGlzIGtleT8gKE9yIGlzIGEgZHVwbGljYXRlPylcbiAgICAgICAgICAvLyBJZiB1bmlxdWUsIHRoZSBub2RlIGFuZCBkYXR1bSBhcmUgam9pbmVkIGluIHRoZSB1cGRhdGUgc2VsZWN0aW9uLlxuICAgICAgICAgIC8vIE90aGVyd2lzZSwgdGhlIGRhdHVtIGlzIGlnbm9yZWQsIG5laXRoZXIgZW50ZXJpbmcgbm9yIGV4aXRpbmcuXG4gICAgICAgICAgZWxzZSBpZiAobm9kZSAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgdXBkYXRlW2ldID0gbm9kZTtcbiAgICAgICAgICAgIG5vZGUuX19kYXRhX18gPSBkYXRhW2ldO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFJlY29yZCB0aGF0IHdlIGNvbnN1bWVkIHRoaXMga2V5LCBlaXRoZXIgdG8gZW50ZXIgb3IgdXBkYXRlLlxuICAgICAgICAgIG5vZGVCeUtleVZhbHVlLnNldChrZXlWYWx1ZSwgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUYWtlIGFueSByZW1haW5pbmcgbm9kZXMgdGhhdCB3ZXJlIG5vdCBib3VuZCB0byBkYXRhLFxuICAgICAgICAvLyBhbmQgcGxhY2UgdGhlbSBpbiB0aGUgZXhpdCBzZWxlY3Rpb24uXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBub2RlTGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICBpZiAoKG5vZGUgPSBub2RlQnlLZXlWYWx1ZS5nZXQoa2V5VmFsdWVzW2ldKSkgIT09IHRydWUpIHtcbiAgICAgICAgICAgIGV4aXRbaV0gPSBub2RlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB2YXIgZmlsdGVyT2YgPSBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXRjaGVzKHNlbGVjdG9yKTtcbiAgICAgIH07XG4gICAgfTtcblxuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAgIHZhciBlbGVtZW50ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICAgICAgaWYgKCFlbGVtZW50Lm1hdGNoZXMpIHtcbiAgICAgICAgdmFyIHZlbmRvck1hdGNoZXMgPSBlbGVtZW50LndlYmtpdE1hdGNoZXNTZWxlY3RvciB8fCBlbGVtZW50Lm1zTWF0Y2hlc1NlbGVjdG9yIHx8IGVsZW1lbnQubW96TWF0Y2hlc1NlbGVjdG9yIHx8IGVsZW1lbnQub01hdGNoZXNTZWxlY3RvcjtcbiAgICAgICAgZmlsdGVyT2YgPSBmdW5jdGlvbihzZWxlY3RvcikgeyByZXR1cm4gZnVuY3Rpb24oKSB7IHJldHVybiB2ZW5kb3JNYXRjaGVzLmNhbGwodGhpcywgc2VsZWN0b3IpOyB9OyB9O1xuICAgICAgfVxuICAgIH0vLyBUaGUgZmlsdGVyIG1heSBlaXRoZXIgYmUgYSBzZWxlY3RvciBzdHJpbmcgKGUuZy4sIFwiLmZvb1wiKVxuICAgIC8vIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgYm9vbGVhbi5cblxuICAgIHZhciBzZWxlY3Rpb25fZmlsdGVyID0gZnVuY3Rpb24oZmlsdGVyKSB7XG4gICAgICB2YXIgZGVwdGggPSB0aGlzLl9kZXB0aCxcbiAgICAgICAgICBzdGFjayA9IG5ldyBBcnJheShkZXB0aCAqIDIpO1xuXG4gICAgICBpZiAodHlwZW9mIGZpbHRlciAhPT0gXCJmdW5jdGlvblwiKSBmaWx0ZXIgPSBmaWx0ZXJPZihmaWx0ZXIpO1xuXG4gICAgICBmdW5jdGlvbiB2aXNpdChub2RlcywgZGVwdGgpIHtcbiAgICAgICAgdmFyIGkgPSAtMSxcbiAgICAgICAgICAgIG4gPSBub2Rlcy5sZW5ndGgsXG4gICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgc3Vibm9kZXM7XG5cbiAgICAgICAgaWYgKC0tZGVwdGgpIHtcbiAgICAgICAgICB2YXIgc3RhY2swID0gZGVwdGggKiAyLFxuICAgICAgICAgICAgICBzdGFjazEgPSBzdGFjazAgKyAxO1xuICAgICAgICAgIHN1Ym5vZGVzID0gbmV3IEFycmF5KG4pO1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgICAgICBpZiAobm9kZSA9IG5vZGVzW2ldKSB7XG4gICAgICAgICAgICAgIHN0YWNrW3N0YWNrMF0gPSBub2RlLl9wYXJlbnQuX19kYXRhX18sIHN0YWNrW3N0YWNrMV0gPSBpO1xuICAgICAgICAgICAgICBzdWJub2Rlc1tpXSA9IHZpc2l0KG5vZGUsIGRlcHRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgZmlsdGVyIG9wZXJhdGlvbiBkb2VzIG5vdCBwcmVzZXJ2ZSB0aGUgb3JpZ2luYWwgaW5kZXgsXG4gICAgICAgIC8vIHNvIHRoZSByZXN1bHRpbmcgbGVhZiBncm91cHMgYXJlIGRlbnNlIChub3Qgc3BhcnNlKS5cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgc3Vibm9kZXMgPSBbXTtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgICAgaWYgKG5vZGUgPSBub2Rlc1tpXSkge1xuICAgICAgICAgICAgICBzdGFja1swXSA9IG5vZGUuX19kYXRhX18sIHN0YWNrWzFdID0gaTtcbiAgICAgICAgICAgICAgaWYgKGZpbHRlci5hcHBseShub2RlLCBzdGFjaykpIHtcbiAgICAgICAgICAgICAgICBzdWJub2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3Vibm9kZXMuX3BhcmVudCA9IG5vZGVzLl9wYXJlbnQ7XG4gICAgICAgIHJldHVybiBzdWJub2RlcztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5ldyBTZWxlY3Rpb24odmlzaXQodGhpcy5fcm9vdCwgZGVwdGgpLCBkZXB0aCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2VsZWN0b3JBbGxPZihzZWxlY3Rvcikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICAgIH07XG4gICAgfS8vIFRoZSBzZWxlY3RvciBtYXkgZWl0aGVyIGJlIGEgc2VsZWN0b3Igc3RyaW5nIChlLmcuLCBcIi5mb29cIilcbiAgICAvLyBvciBhIGZ1bmN0aW9uIHRoYXQgb3B0aW9uYWxseSByZXR1cm5zIGFuIGFycmF5IG9mIG5vZGVzIHRvIHNlbGVjdC5cbiAgICAvLyBUaGlzIGlzIHRoZSBvbmx5IG9wZXJhdGlvbiB0aGF0IGluY3JlYXNlcyB0aGUgZGVwdGggb2YgYSBzZWxlY3Rpb24uXG5cbiAgICB2YXIgc2VsZWN0aW9uX3NlbGVjdEFsbCA9IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gICAgICB2YXIgZGVwdGggPSB0aGlzLl9kZXB0aCxcbiAgICAgICAgICBzdGFjayA9IG5ldyBBcnJheShkZXB0aCAqIDIpO1xuXG4gICAgICBpZiAodHlwZW9mIHNlbGVjdG9yICE9PSBcImZ1bmN0aW9uXCIpIHNlbGVjdG9yID0gc2VsZWN0b3JBbGxPZihzZWxlY3Rvcik7XG5cbiAgICAgIGZ1bmN0aW9uIHZpc2l0KG5vZGVzLCBkZXB0aCkge1xuICAgICAgICB2YXIgaSA9IC0xLFxuICAgICAgICAgICAgbiA9IG5vZGVzLmxlbmd0aCxcbiAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICBzdWJub2RlLFxuICAgICAgICAgICAgc3Vibm9kZXMgPSBuZXcgQXJyYXkobik7XG5cbiAgICAgICAgaWYgKC0tZGVwdGgpIHtcbiAgICAgICAgICB2YXIgc3RhY2swID0gZGVwdGggKiAyLFxuICAgICAgICAgICAgICBzdGFjazEgPSBzdGFjazAgKyAxO1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgICAgICBpZiAobm9kZSA9IG5vZGVzW2ldKSB7XG4gICAgICAgICAgICAgIHN0YWNrW3N0YWNrMF0gPSBub2RlLl9wYXJlbnQuX19kYXRhX18sIHN0YWNrW3N0YWNrMV0gPSBpO1xuICAgICAgICAgICAgICBzdWJub2Rlc1tpXSA9IHZpc2l0KG5vZGUsIGRlcHRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBEYXRhIGlzIG5vdCBwcm9wYWdhdGVkIHNpbmNlIHRoZXJlIGlzIGEgb25lLXRvLW1hbnkgbWFwcGluZy5cbiAgICAgICAgLy8gVGhlIHBhcmVudCBvZiB0aGUgbmV3IGxlYWYgZ3JvdXAgaXMgdGhlIG9sZCBub2RlLlxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgICAgaWYgKG5vZGUgPSBub2Rlc1tpXSkge1xuICAgICAgICAgICAgICBzdGFja1swXSA9IG5vZGUuX19kYXRhX18sIHN0YWNrWzFdID0gaTtcbiAgICAgICAgICAgICAgc3Vibm9kZXNbaV0gPSBzdWJub2RlID0gc2VsZWN0b3IuYXBwbHkobm9kZSwgc3RhY2spO1xuICAgICAgICAgICAgICBzdWJub2RlLl9wYXJlbnQgPSBub2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHN1Ym5vZGVzLl9wYXJlbnQgPSBub2Rlcy5fcGFyZW50O1xuICAgICAgICByZXR1cm4gc3Vibm9kZXM7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgU2VsZWN0aW9uKHZpc2l0KHRoaXMuX3Jvb3QsIGRlcHRoKSwgZGVwdGggKyAxKTtcbiAgICB9Ly8gVGhlIHNlbGVjdG9yIG1heSBlaXRoZXIgYmUgYSBzZWxlY3RvciBzdHJpbmcgKGUuZy4sIFwiLmZvb1wiKVxuICAgIC8vIG9yIGEgZnVuY3Rpb24gdGhhdCBvcHRpb25hbGx5IHJldHVybnMgdGhlIG5vZGUgdG8gc2VsZWN0LlxuXG4gICAgdmFyIHNlbGVjdGlvbl9zZWxlY3QgPSBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgICAgdmFyIGRlcHRoID0gdGhpcy5fZGVwdGgsXG4gICAgICAgICAgc3RhY2sgPSBuZXcgQXJyYXkoZGVwdGggKiAyKTtcblxuICAgICAgaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gXCJmdW5jdGlvblwiKSBzZWxlY3RvciA9IHNlbGVjdG9yT2Yoc2VsZWN0b3IpO1xuXG4gICAgICBmdW5jdGlvbiB2aXNpdChub2RlcywgdXBkYXRlLCBkZXB0aCkge1xuICAgICAgICB2YXIgaSA9IC0xLFxuICAgICAgICAgICAgbiA9IG5vZGVzLmxlbmd0aCxcbiAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICBzdWJub2RlLFxuICAgICAgICAgICAgc3Vibm9kZXMgPSBuZXcgQXJyYXkobik7XG5cbiAgICAgICAgaWYgKC0tZGVwdGgpIHtcbiAgICAgICAgICB2YXIgc3RhY2swID0gZGVwdGggKiAyLFxuICAgICAgICAgICAgICBzdGFjazEgPSBzdGFjazAgKyAxO1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgICAgICBpZiAobm9kZSA9IG5vZGVzW2ldKSB7XG4gICAgICAgICAgICAgIHN0YWNrW3N0YWNrMF0gPSBub2RlLl9wYXJlbnQuX19kYXRhX18sIHN0YWNrW3N0YWNrMV0gPSBpO1xuICAgICAgICAgICAgICBzdWJub2Rlc1tpXSA9IHZpc2l0KG5vZGUsIHVwZGF0ZSAmJiB1cGRhdGVbaV0sIGRlcHRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgbGVhZiBncm91cCBtYXkgYmUgc3BhcnNlIGlmIHRoZSBzZWxlY3RvciByZXR1cm5zIGEgZmFsc2V5IHZhbHVlO1xuICAgICAgICAvLyB0aGlzIHByZXNlcnZlcyB0aGUgaW5kZXggb2Ygbm9kZXMgKHVubGlrZSBzZWxlY3Rpb24uZmlsdGVyKS5cbiAgICAgICAgLy8gUHJvcGFnYXRlIGRhdGEgdG8gdGhlIG5ldyBub2RlIG9ubHkgaWYgaXQgaXMgZGVmaW5lZCBvbiB0aGUgb2xkLlxuICAgICAgICAvLyBJZiB0aGlzIGlzIGFuIGVudGVyIHNlbGVjdGlvbiwgbWF0ZXJpYWxpemVkIG5vZGVzIGFyZSBtb3ZlZCB0byB1cGRhdGUuXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgICAgICBpZiAobm9kZSA9IG5vZGVzW2ldKSB7XG4gICAgICAgICAgICAgIHN0YWNrWzBdID0gbm9kZS5fX2RhdGFfXywgc3RhY2tbMV0gPSBpO1xuICAgICAgICAgICAgICBpZiAoc3Vibm9kZSA9IHNlbGVjdG9yLmFwcGx5KG5vZGUsIHN0YWNrKSkge1xuICAgICAgICAgICAgICAgIGlmIChcIl9fZGF0YV9fXCIgaW4gbm9kZSkgc3Vibm9kZS5fX2RhdGFfXyA9IG5vZGUuX19kYXRhX187XG4gICAgICAgICAgICAgICAgaWYgKHVwZGF0ZSkgdXBkYXRlW2ldID0gc3Vibm9kZSwgZGVsZXRlIG5vZGVzW2ldO1xuICAgICAgICAgICAgICAgIHN1Ym5vZGVzW2ldID0gc3Vibm9kZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHN1Ym5vZGVzLl9wYXJlbnQgPSBub2Rlcy5fcGFyZW50O1xuICAgICAgICByZXR1cm4gc3Vibm9kZXM7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgU2VsZWN0aW9uKHZpc2l0KHRoaXMuX3Jvb3QsIHRoaXMuX3VwZGF0ZSAmJiB0aGlzLl91cGRhdGUuX3Jvb3QsIGRlcHRoKSwgZGVwdGgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlbGVjdGlvbigpIHtcbiAgICAgIHJldHVybiBuZXcgU2VsZWN0aW9uKFtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRdLCAxKTtcbiAgICB9XG5cbiAgICBTZWxlY3Rpb24ucHJvdG90eXBlID0gc2VsZWN0aW9uLnByb3RvdHlwZSA9IHtcbiAgICAgIHNlbGVjdDogc2VsZWN0aW9uX3NlbGVjdCxcbiAgICAgIHNlbGVjdEFsbDogc2VsZWN0aW9uX3NlbGVjdEFsbCxcbiAgICAgIGZpbHRlcjogc2VsZWN0aW9uX2ZpbHRlcixcbiAgICAgIGRhdGE6IHNlbGVjdGlvbl9kYXRhLFxuICAgICAgZW50ZXI6IHNlbGVjdGlvbl9lbnRlcixcbiAgICAgIGV4aXQ6IHNlbGVjdGlvbl9leGl0LFxuICAgICAgb3JkZXI6IHNlbGVjdGlvbl9vcmRlcixcbiAgICAgIHNvcnQ6IHNlbGVjdGlvbl9zb3J0LFxuICAgICAgY2FsbDogc2VsZWN0aW9uX2NhbGwsXG4gICAgICBub2Rlczogc2VsZWN0aW9uX25vZGVzLFxuICAgICAgbm9kZTogc2VsZWN0aW9uX25vZGUsXG4gICAgICBzaXplOiBzZWxlY3Rpb25fc2l6ZSxcbiAgICAgIGVtcHR5OiBzZWxlY3Rpb25fZW1wdHksXG4gICAgICBlYWNoOiBzZWxlY3Rpb25fZWFjaCxcbiAgICAgIGF0dHI6IHNlbGVjdGlvbl9hdHRyLFxuICAgICAgc3R5bGU6IHNlbGVjdGlvbl9zdHlsZSxcbiAgICAgIHByb3BlcnR5OiBzZWxlY3Rpb25fcHJvcGVydHksXG4gICAgICBjbGFzczogc2VsZWN0aW9uX2NsYXNzLFxuICAgICAgY2xhc3NlZDogc2VsZWN0aW9uX2NsYXNzLCAvLyBkZXByZWNhdGVkIGFsaWFzXG4gICAgICB0ZXh0OiBzZWxlY3Rpb25fdGV4dCxcbiAgICAgIGh0bWw6IHNlbGVjdGlvbl9odG1sLFxuICAgICAgYXBwZW5kOiBzZWxlY3Rpb25fYXBwZW5kLFxuICAgICAgaW5zZXJ0OiBzZWxlY3Rpb25fYXBwZW5kLCAvLyBkZXByZWNhdGVkIGFsaWFzXG4gICAgICByZW1vdmU6IHNlbGVjdGlvbl9yZW1vdmUsXG4gICAgICBkYXR1bTogc2VsZWN0aW9uX2RhdHVtLFxuICAgICAgZXZlbnQ6IHNlbGVjdGlvbl9ldmVudCxcbiAgICAgIG9uOiBzZWxlY3Rpb25fZXZlbnQsIC8vIGRlcHJlY2F0ZWQgYWxpYXNcbiAgICAgIGRpc3BhdGNoOiBzZWxlY3Rpb25fZGlzcGF0Y2hcbiAgICB9O1xuXG4gICAgdmFyIHNlbGVjdCA9IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gICAgICByZXR1cm4gbmV3IFNlbGVjdGlvbihbdHlwZW9mIHNlbGVjdG9yID09PSBcInN0cmluZ1wiID8gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikgOiBzZWxlY3Rvcl0sIDEpO1xuICAgIH1cblxuICAgIHZhciBwb2ludCA9IGZ1bmN0aW9uKG5vZGUsIGV2ZW50KSB7XG4gICAgICB2YXIgc3ZnID0gbm9kZS5vd25lclNWR0VsZW1lbnQgfHwgbm9kZTtcbiAgICAgIGlmIChzdmcuY3JlYXRlU1ZHUG9pbnQpIHtcbiAgICAgICAgdmFyIHBvaW50ID0gc3ZnLmNyZWF0ZVNWR1BvaW50KCk7XG4gICAgICAgIGlmIChidWc0NDA4MyA8IDApIHtcbiAgICAgICAgICB2YXIgd2luZG93ID0gZGVmYXVsdFZpZXcobm9kZSk7XG4gICAgICAgICAgaWYgKHdpbmRvdy5zY3JvbGxYIHx8IHdpbmRvdy5zY3JvbGxZKSB7XG4gICAgICAgICAgICBzdmcgPSBzZWxlY3Qod2luZG93LmRvY3VtZW50LmJvZHkpLmFwcGVuZChcInN2Z1wiKS5zdHlsZSh7cG9zaXRpb246IFwiYWJzb2x1dGVcIiwgdG9wOiAwLCBsZWZ0OiAwLCBtYXJnaW46IDAsIHBhZGRpbmc6IDAsIGJvcmRlcjogXCJub25lXCJ9LCBcImltcG9ydGFudFwiKTtcbiAgICAgICAgICAgIHZhciBjdG0gPSBzdmcubm9kZSgpLmdldFNjcmVlbkNUTSgpO1xuICAgICAgICAgICAgYnVnNDQwODMgPSAhKGN0bS5mIHx8IGN0bS5lKTtcbiAgICAgICAgICAgIHN2Zy5yZW1vdmUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJ1ZzQ0MDgzKSBwb2ludC54ID0gZXZlbnQucGFnZVgsIHBvaW50LnkgPSBldmVudC5wYWdlWTtcbiAgICAgICAgZWxzZSBwb2ludC54ID0gZXZlbnQuY2xpZW50WCwgcG9pbnQueSA9IGV2ZW50LmNsaWVudFk7XG4gICAgICAgIHBvaW50ID0gcG9pbnQubWF0cml4VHJhbnNmb3JtKG5vZGUuZ2V0U2NyZWVuQ1RNKCkuaW52ZXJzZSgpKTtcbiAgICAgICAgcmV0dXJuIFtwb2ludC54LCBwb2ludC55XTtcbiAgICAgIH1cbiAgICAgIHZhciByZWN0ID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHJldHVybiBbZXZlbnQuY2xpZW50WCAtIHJlY3QubGVmdCAtIG5vZGUuY2xpZW50TGVmdCwgZXZlbnQuY2xpZW50WSAtIHJlY3QudG9wIC0gbm9kZS5jbGllbnRUb3BdO1xuICAgIH1cblxuICAgIHZhciBzb3VyY2VFdmVudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGN1cnJlbnQgPSBldmVudCwgc291cmNlO1xuICAgICAgd2hpbGUgKHNvdXJjZSA9IGN1cnJlbnQuc291cmNlRXZlbnQpIGN1cnJlbnQgPSBzb3VyY2U7XG4gICAgICByZXR1cm4gY3VycmVudDtcbiAgICB9XG5cbiAgICB2YXIgdG91Y2hlcyA9IGZ1bmN0aW9uKG5vZGUsIHRvdWNoZXMpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgdG91Y2hlcyA9IHNvdXJjZUV2ZW50KCkudG91Y2hlcztcbiAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gdG91Y2hlcyA/IHRvdWNoZXMubGVuZ3RoIDogMCwgcG9pbnRzID0gbmV3IEFycmF5KG4pOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIHBvaW50c1tpXSA9IHBvaW50KG5vZGUsIHRvdWNoZXNbaV0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHBvaW50cztcbiAgICB9XG5cbiAgICB2YXIgdG91Y2ggPSBmdW5jdGlvbihub2RlLCB0b3VjaGVzLCBpZGVudGlmaWVyKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIGlkZW50aWZpZXIgPSB0b3VjaGVzLCB0b3VjaGVzID0gc291cmNlRXZlbnQoKS5jaGFuZ2VkVG91Y2hlcztcbiAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gdG91Y2hlcyA/IHRvdWNoZXMubGVuZ3RoIDogMCwgdG91Y2g7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgaWYgKCh0b3VjaCA9IHRvdWNoZXNbaV0pLmlkZW50aWZpZXIgPT09IGlkZW50aWZpZXIpIHtcbiAgICAgICAgICByZXR1cm4gcG9pbnQobm9kZSwgdG91Y2gpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgc2VsZWN0QWxsID0gZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICAgIHJldHVybiBuZXcgU2VsZWN0aW9uKHR5cGVvZiBzZWxlY3RvciA9PT0gXCJzdHJpbmdcIiA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpIDogc2VsZWN0b3IsIDEpO1xuICAgIH1cblxuICAgIHZhciBtb3VzZSA9IGZ1bmN0aW9uKG5vZGUsIGV2ZW50KSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIGV2ZW50ID0gc291cmNlRXZlbnQoKTtcbiAgICAgIGlmIChldmVudC5jaGFuZ2VkVG91Y2hlcykgZXZlbnQgPSBldmVudC5jaGFuZ2VkVG91Y2hlc1swXTtcbiAgICAgIHJldHVybiBwb2ludChub2RlLCBldmVudCk7XG4gICAgfVxuXG4gICAgdmFyIGQzID0ge1xuICAgICAgZ2V0IGV2ZW50KCkgeyByZXR1cm4gZXZlbnQ7IH0sXG4gICAgICBtb3VzZTogbW91c2UsXG4gICAgICBuYW1lc3BhY2U6IG5hbWVzcGFjZSxcbiAgICAgIG5hbWVzcGFjZXM6IG5hbWVzcGFjZXMsXG4gICAgICByZXF1b3RlOiByZXF1b3RlLFxuICAgICAgc2VsZWN0OiBzZWxlY3QsXG4gICAgICBzZWxlY3RBbGw6IHNlbGVjdEFsbCxcbiAgICAgIHNlbGVjdGlvbjogc2VsZWN0aW9uLFxuICAgICAgdG91Y2g6IHRvdWNoLFxuICAgICAgdG91Y2hlczogdG91Y2hlc1xuICAgIH07XG5cbiAgICByZXR1cm4gZDM7XG5cbn0pKTsiLCJ2YXIgZDMgPSByZXF1aXJlKFwiZDMtc2VsZWN0aW9uXCIpLFxuICAgIFNoZWxsID0gcmVxdWlyZShcIi4uLy4uL2QzcGx1cy1zaGVsbC9zcmMvU2hlbGwuanNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgZXh0ZW5kcyBTaGVsbCB7XG5cbiAgY29uc3RydWN0b3IgKGRhdGEsIHNldHRpbmdzID0gbmV3IE1hcCgpKSB7XG5cbiAgICBzdXBlcihzZXR0aW5ncyk7XG4gICAgdGhpcy5kYXRhID0gZGF0YTtcbiAgICB0aGlzLmNhY2hlID0gbmV3IE1hcCgpO1xuXG4gIH1cblxuICBjbGVhciAoKSB7XG4gICAgZm9yIChsZXQga2V5IG9mIHRoaXMuY2FjaGUua2V5cygpKSB7XG4gICAgICB2YXIgYXR0ciA9IHRoaXMuc2V0dGluZ3MuZ2V0KGtleSk7XG4gICAgICBpZiAoYXR0ci5jaGFuZ2VkIHx8IGF0dHIudHlwZSA9PT0gRnVuY3Rpb24pIHtcbiAgICAgICAgdGhpcy5jYWNoZS5kZWxldGUoa2V5KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmZXRjaCAobmFtZSkge1xuXG4gICAgaWYgKHRoaXMuY2FjaGUuaGFzKG5hbWUpKSB7XG4gICAgICByZXR1cm4gdGhpcy5jYWNoZS5nZXQobmFtZSk7XG4gICAgfVxuXG4gICAgdmFyIGF0dHIgPSB0aGlzLnNldHRpbmdzLmdldChuYW1lKSwgdmFsdWU7XG4gICAgaWYgKGF0dHIpIHtcbiAgICAgIHZhbHVlID0gYXR0ci52YWx1ZTtcbiAgICAgIGlmIChhdHRyLnR5cGUgPT09IEZ1bmN0aW9uKSB7XG4gICAgICAgIHZhbHVlID0gdmFsdWUodGhpcy5kYXRhKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHZhbHVlLmNvbnN0cnVjdG9yID09PSBTdHJpbmcpe1xuICAgICAgICBpZiAodGhpcy5kYXRhIGluc3RhbmNlb2YgZDMuc2VsZWN0aW9uKSB7XG4gICAgICAgICAgdmFsdWUgPSB0aGlzLmRhdGEuYXR0cih2YWx1ZSkgfHwgdGhpcy5kYXRhLnN0eWxlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmRhdGEuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgIHZhbHVlID0gdGhpcy5kYXRhW3ZhbHVlXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuY2FjaGUuc2V0KG5hbWUsIHZhbHVlKTtcbiAgICByZXR1cm4gdmFsdWU7XG5cbiAgfVxuXG59O1xuIiwiY2xhc3MgU2V0dGluZyB7XG5cbiAgY29uc3RydWN0b3IgKHZhbHVlLCBhbGxvd2VkID0gdW5kZWZpbmVkKSB7XG5cbiAgICB0aGlzLmFsbG93ZWQgPSBhbGxvd2VkO1xuICAgIHRoaXMudXBkYXRlKHZhbHVlKTtcblxuICB9XG5cbiAgdXBkYXRlICh2YWx1ZSkge1xuXG4gICAgdGhpcy5jaGFuZ2VkID0gdHJ1ZTtcbiAgICB0aGlzLnR5cGUgPSB2YWx1ZS5jb25zdHJ1Y3RvcjtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG5cbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZztcbiIsInZhciBTZXR0aW5nID0gcmVxdWlyZShcIi4vU2V0dGluZy5qc1wiKTtcblxuY2xhc3MgU2V0dGluZ3Mge1xuXG4gIGNvbnN0cnVjdG9yIChkYXRhID0gbmV3IE1hcCgpKSB7XG5cbiAgICBpZiAoZGF0YS5jb25zdHJ1Y3RvciA9PT0gTWFwKSB7XG4gICAgICB0aGlzLmRhdGEgPSBuZXcgTWFwKCk7XG4gICAgICBmb3IgKGxldCBba2V5LCB2YWx1ZV0gb2YgZGF0YSkge1xuICAgICAgICB0aGlzLmRhdGEuc2V0KGtleSwgbmV3IFNldHRpbmcodmFsdWUpKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmRhdGEgPSBkYXRhO1xuICAgIH1cblxuICB9XG5cbiAgZ2V0IChuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZGF0YS5nZXQobmFtZSk7XG4gIH1cblxuICBrZXlzICgpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmtleXMoKTtcbiAgfVxuXG4gIHNldCAobmFtZSwgdmFsdWUpIHtcblxuICAgIGlmICh0aGlzLmRhdGEuaGFzKG5hbWUpKSB7XG4gICAgICB0aGlzLmRhdGEuZ2V0KG5hbWUpLnVwZGF0ZSh2YWx1ZSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5kYXRhLnNldChuYW1lLCBuZXcgU2V0dGluZyh2YWx1ZSkpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuXG4gIH1cblxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNldHRpbmdzO1xuIiwidmFyIFNldHRpbmdzID0gcmVxdWlyZShcIi4vU2V0dGluZ3MuanNcIik7XG5cbmNsYXNzIFNoZWxsIHtcblxuICBjb25zdHJ1Y3RvciAoc2V0dGluZ3MgPSBuZXcgTWFwKCkpIHtcblxuICAgIHRoaXMuc2V0dGluZ3MgPSBuZXcgU2V0dGluZ3Moc2V0dGluZ3MpO1xuXG4gIH1cblxuICBhdHRyIChuYW1lLCB2YWx1ZSkge1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICByZXR1cm4gdGhpcy5zZXR0aW5ncy5nZXQobmFtZSkudmFsdWU7XG4gICAgfVxuICAgIHRoaXMuc2V0dGluZ3Muc2V0KG5hbWUsIHZhbHVlKTtcblxuICAgIHJldHVybiB0aGlzO1xuXG4gIH1cblxuICBhdHRycyAob2JqKSB7XG5cbiAgICBmb3IgKGxldCBrZXkgaW4gb2JqKSB7XG4gICAgICB0aGlzLmF0dHIoa2V5LCBvYmpba2V5XSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgfVxuXG4gIHJlc2V0ICgpIHtcblxuICAgIGZvciAobGV0IG5hbWUgb2YgdGhpcy5zZXR0aW5ncy5rZXlzKCkpIHtcbiAgICAgIHRoaXMuc2V0dGluZ3MuZ2V0KG5hbWUpLmNoYW5nZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcblxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaGVsbDtcbiIsInZhciBkMyA9IHJlcXVpcmUoXCJkMy1zZWxlY3Rpb25cIiksXG4gICAgRGF0YVBvaW50ID0gcmVxdWlyZShcIi4uLy4uL2QzcGx1cy1kYXRhcG9pbnQvc3JjL2RhdGFwb2ludC5qc1wiKSxcbiAgICBTaGVsbCA9IHJlcXVpcmUoXCIuLi8uLi9kM3BsdXMtc2hlbGwvc3JjL1NoZWxsLmpzXCIpO1xuXG4vKiogQGNsYXNzICovXG5jbGFzcyBUZXh0Qm94IGV4dGVuZHMgU2hlbGwge1xuXG4gIGNvbnN0cnVjdG9yIChkYXRhID0gW10pIHtcblxuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zZXR0aW5ncy5zZXQoXCJyZXNpemVcIiwgZmFsc2UpO1xuICAgIHRoaXMuc2V0dGluZ3Muc2V0KFwieFwiLCAwKTtcbiAgICB0aGlzLnNldHRpbmdzLnNldChcInlcIiwgMCk7XG4gICAgdGhpcy5kYXRhKGRhdGEpO1xuXG4gIH1cblxuICBkYXRhIChhcnIpIHtcblxuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YUFycmF5O1xuICAgIH1cblxuICAgIGlmIChhcnIuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuICAgICAgYXJyID0gZDMuc2VsZWN0QWxsKGFycik7XG4gICAgfVxuXG4gICAgaWYgKGFyciBpbnN0YW5jZW9mIGQzLnNlbGVjdGlvbikge1xuICAgICAgdGhpcy5kYXRhQXJyYXkgPSBbXTtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIGFyci5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLmRhdGFBcnJheS5wdXNoKG5ldyBEYXRhUG9pbnQodGhpcywgc2VsZi5zZXR0aW5ncykpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5kYXRhQXJyYXkgPSBhcnIubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRhUG9pbnQoZCwgdGhpcy5zZXR0aW5ncyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcblxuICB9XG5cbiAgZHJhdyAodGltaW5nKSB7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgdGhpcy50aW1pbmcgPSB0aW1pbmc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGV4dEJveDtcbiJdfQ==
