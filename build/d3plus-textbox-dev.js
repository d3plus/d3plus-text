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
    var allowed = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

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
        for (var _iterator = data.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var key = _step.value;

          this.data.set(key, new Setting(data.get(key)));
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
          var key = _step.value;

          this.settings.get(key).changed = false;
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
    DataPoint = require("../../d3plus-datapoint/src/DataPoint.js"),
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

},{"../../d3plus-datapoint/src/DataPoint.js":2,"../../d3plus-shell/src/Shell.js":5,"d3-selection":6}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9kM3BsdXMtZGF0YXBvaW50L25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vYnVpbGQvZDMuanMiLCIvVXNlcnMvRGF2ZS9TaXRlcy9kM3BsdXMtZGF0YXBvaW50L3NyYy9EYXRhUG9pbnQuanMiLCIvVXNlcnMvRGF2ZS9TaXRlcy9kM3BsdXMtc2hlbGwvc3JjL1NldHRpbmcuanMiLCIvVXNlcnMvRGF2ZS9TaXRlcy9kM3BsdXMtc2hlbGwvc3JjL1NldHRpbmdzLmpzIiwiL1VzZXJzL0RhdmUvU2l0ZXMvZDNwbHVzLXNoZWxsL3NyYy9TaGVsbC5qcyIsIi9Vc2Vycy9EYXZlL1NpdGVzL2QzcGx1cy10ZXh0Ym94L3NyYy90ZXh0Ym94LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFTLENBQUMsSUFBSSxDQUFDLElBQUksU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztTQUN6RCxDQUFDLENBQUM7T0FDSixNQUNJO0FBQ0gsWUFBSSxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLFVBQVMsQ0FBQyxFQUFFO0FBQ25DLGlCQUFPLElBQUksU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDeEMsQ0FBQyxDQUFDO09BQ0o7O0FBRUQsYUFBTyxJQUFJLENBQUM7S0FFYjs7O1dBRUksY0FBQyxNQUFNLEVBQUU7O0FBRVosVUFBSSxTQUFTLENBQUMsTUFBTSxFQUFFO0FBQ3BCLFlBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO09BQ3RCOztBQUVELGFBQU8sSUFBSSxDQUFDO0tBRWI7OztTQS9DRyxPQUFPO0dBQVMsS0FBSzs7QUFtRDNCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImlmICh0eXBlb2YgTWFwID09PSBcInVuZGVmaW5lZFwiKSB7XG4gIE1hcCA9IGZ1bmN0aW9uKCkge307XG4gIE1hcC5wcm90b3R5cGUgPSB7XG4gICAgc2V0OiBmdW5jdGlvbihrLCB2KSB7IHRoaXNbXCIkXCIgKyBrXSA9IHY7IHJldHVybiB0aGlzOyB9LFxuICAgIGdldDogZnVuY3Rpb24oaykgeyByZXR1cm4gdGhpc1tcIiRcIiArIGtdOyB9LFxuICAgIGhhczogZnVuY3Rpb24oaykgeyByZXR1cm4gXCIkXCIgKyBrIGluIHRoaXM7IH1cbiAgfTtcbn1cblxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG4gICAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgICBnbG9iYWwuZDMgPSBmYWN0b3J5KCk7XG59KHRoaXMsIGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGJ1ZzQ0MDgzID0gdHlwZW9mIG5hdmlnYXRvciAhPT0gXCJ1bmRlZmluZWRcIiAmJiAvV2ViS2l0Ly50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpID8gLTEgOiAwOyAvLyBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NDQwODMvLyBXaGVuIGRlcHRoID0gMSwgcm9vdCA9IFtOb2RlLCDigKZdLlxuICAgIC8vIFdoZW4gZGVwdGggPSAyLCByb290ID0gW1tOb2RlLCDigKZdLCDigKZdLlxuICAgIC8vIFdoZW4gZGVwdGggPSAzLCByb290ID0gW1tbTm9kZSwg4oCmXSwg4oCmXSwg4oCmXS4gZXRjLlxuICAgIC8vIE5vdGUgdGhhdCBbTm9kZSwg4oCmXSBhbmQgTm9kZUxpc3QgYXJlIHVzZWQgaW50ZXJjaGFuZ2VhYmx5OyBzZWUgYXJyYXlpZnkuXG5cbiAgICBmdW5jdGlvbiBTZWxlY3Rpb24ocm9vdCwgZGVwdGgpIHtcbiAgICAgIHRoaXMuX3Jvb3QgPSByb290O1xuICAgICAgdGhpcy5fZGVwdGggPSBkZXB0aDtcbiAgICAgIHRoaXMuX2VudGVyID0gdGhpcy5fdXBkYXRlID0gdGhpcy5fZXhpdCA9IG51bGw7XG4gICAgfVxuICAgIHZhciBkZWZhdWx0VmlldyA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHJldHVybiBub2RlXG4gICAgICAgICAgJiYgKChub2RlLm93bmVyRG9jdW1lbnQgJiYgbm9kZS5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3KSAvLyBub2RlIGlzIGEgTm9kZVxuICAgICAgICAgICAgICB8fCAobm9kZS5kb2N1bWVudCAmJiBub2RlKSAvLyBub2RlIGlzIGEgV2luZG93XG4gICAgICAgICAgICAgIHx8IG5vZGUuZGVmYXVsdFZpZXcpOyAvLyBub2RlIGlzIGEgRG9jdW1lbnRcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KG5vZGUsIHR5cGUsIHBhcmFtcykge1xuICAgICAgdmFyIHdpbmRvdyA9IGRlZmF1bHRWaWV3KG5vZGUpLFxuICAgICAgICAgIGV2ZW50ID0gd2luZG93LkN1c3RvbUV2ZW50O1xuXG4gICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQgPSBuZXcgZXZlbnQodHlwZSwgcGFyYW1zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGV2ZW50ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRcIik7XG4gICAgICAgIGlmIChwYXJhbXMpIGV2ZW50LmluaXRFdmVudCh0eXBlLCBwYXJhbXMuYnViYmxlcywgcGFyYW1zLmNhbmNlbGFibGUpLCBldmVudC5kZXRhaWwgPSBwYXJhbXMuZGV0YWlsO1xuICAgICAgICBlbHNlIGV2ZW50LmluaXRFdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UpO1xuICAgICAgfVxuXG4gICAgICBub2RlLmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgIH1cblxuICAgIHZhciBzZWxlY3Rpb25fZGlzcGF0Y2ggPSBmdW5jdGlvbih0eXBlLCBwYXJhbXMpIHtcblxuICAgICAgZnVuY3Rpb24gZGlzcGF0Y2hDb25zdGFudCgpIHtcbiAgICAgICAgcmV0dXJuIGRpc3BhdGNoRXZlbnQodGhpcywgdHlwZSwgcGFyYW1zKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZGlzcGF0Y2hGdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGRpc3BhdGNoRXZlbnQodGhpcywgdHlwZSwgcGFyYW1zLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5lYWNoKHR5cGVvZiBwYXJhbXMgPT09IFwiZnVuY3Rpb25cIiA/IGRpc3BhdGNoRnVuY3Rpb24gOiBkaXNwYXRjaENvbnN0YW50KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBub29wKCkge31cbiAgICB2YXIgcmVxdW90ZVJlID0gL1tcXFxcXFxeXFwkXFwqXFwrXFw/XFx8XFxbXFxdXFwoXFwpXFwuXFx7XFx9XS9nO1xuXG4gICAgdmFyIHJlcXVvdGUgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcucmVwbGFjZShyZXF1b3RlUmUsIFwiXFxcXCQmXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZpbHRlckxpc3RlbmVyT2YobGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgcmVsYXRlZCA9IGV2ZW50LnJlbGF0ZWRUYXJnZXQ7XG4gICAgICAgIGlmICghcmVsYXRlZCB8fCAocmVsYXRlZCAhPT0gdGhpcyAmJiAhKHJlbGF0ZWQuY29tcGFyZURvY3VtZW50UG9zaXRpb24odGhpcykgJiA4KSkpIHtcbiAgICAgICAgICBsaXN0ZW5lcihldmVudCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIGV2ZW50ID0gbnVsbDtcblxuICAgIGZ1bmN0aW9uIGxpc3RlbmVyT2YobGlzdGVuZXIsIGFuY2VzdG9ycywgYXJncykge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGV2ZW50MSkge1xuICAgICAgICB2YXIgaSA9IGFuY2VzdG9ycy5sZW5ndGgsIGV2ZW50MCA9IGV2ZW50OyAvLyBFdmVudHMgY2FuIGJlIHJlZW50cmFudCAoZS5nLiwgZm9jdXMpLlxuICAgICAgICB3aGlsZSAoLS1pID49IDApIGFyZ3NbaSA8PCAxXSA9IGFuY2VzdG9yc1tpXS5fX2RhdGFfXztcbiAgICAgICAgZXZlbnQgPSBldmVudDE7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgbGlzdGVuZXIuYXBwbHkoYW5jZXN0b3JzWzBdLCBhcmdzKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBldmVudCA9IGV2ZW50MDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgZmlsdGVyRXZlbnRzID0gbmV3IE1hcDtcblxuICAgIHZhciBzZWxlY3Rpb25fZXZlbnQgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkge1xuICAgICAgdmFyIG4gPSBhcmd1bWVudHMubGVuZ3RoLFxuICAgICAgICAgIGtleSA9IFwiX19vblwiICsgdHlwZSxcbiAgICAgICAgICBmaWx0ZXIsXG4gICAgICAgICAgcm9vdCA9IHRoaXMuX3Jvb3Q7XG5cbiAgICAgIGlmIChuIDwgMikgcmV0dXJuIChuID0gdGhpcy5ub2RlKClba2V5XSkgJiYgbi5fbGlzdGVuZXI7XG5cbiAgICAgIGlmIChuIDwgMykgY2FwdHVyZSA9IGZhbHNlO1xuICAgICAgaWYgKChuID0gdHlwZS5pbmRleE9mKFwiLlwiKSkgPiAwKSB0eXBlID0gdHlwZS5zbGljZSgwLCBuKTtcbiAgICAgIGlmIChmaWx0ZXIgPSBmaWx0ZXJFdmVudHMuaGFzKHR5cGUpKSB0eXBlID0gZmlsdGVyRXZlbnRzLmdldCh0eXBlKTtcblxuICAgICAgZnVuY3Rpb24gYWRkKCkge1xuICAgICAgICB2YXIgYW5jZXN0b3IgPSByb290LCBpID0gYXJndW1lbnRzLmxlbmd0aCA+PiAxLCBhbmNlc3RvcnMgPSBuZXcgQXJyYXkoaSk7XG4gICAgICAgIHdoaWxlICgtLWkgPj0gMCkgYW5jZXN0b3IgPSBhbmNlc3Rvclthcmd1bWVudHNbKGkgPDwgMSkgKyAxXV0sIGFuY2VzdG9yc1tpXSA9IGkgPyBhbmNlc3Rvci5fcGFyZW50IDogYW5jZXN0b3I7XG4gICAgICAgIHZhciBsID0gbGlzdGVuZXJPZihsaXN0ZW5lciwgYW5jZXN0b3JzLCBhcmd1bWVudHMpO1xuICAgICAgICBpZiAoZmlsdGVyKSBsID0gZmlsdGVyTGlzdGVuZXJPZihsKTtcbiAgICAgICAgcmVtb3ZlLmNhbGwodGhpcyk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCB0aGlzW2tleV0gPSBsLCBsLl9jYXB0dXJlID0gY2FwdHVyZSk7XG4gICAgICAgIGwuX2xpc3RlbmVyID0gbGlzdGVuZXI7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgdmFyIGwgPSB0aGlzW2tleV07XG4gICAgICAgIGlmIChsKSB7XG4gICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGwsIGwuX2NhcHR1cmUpO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcmVtb3ZlQWxsKCkge1xuICAgICAgICB2YXIgcmUgPSBuZXcgUmVnRXhwKFwiXl9fb24oW14uXSspXCIgKyByZXF1b3RlKHR5cGUpICsgXCIkXCIpLCBtYXRjaDtcbiAgICAgICAgZm9yICh2YXIgbmFtZSBpbiB0aGlzKSB7XG4gICAgICAgICAgaWYgKG1hdGNoID0gbmFtZS5tYXRjaChyZSkpIHtcbiAgICAgICAgICAgIHZhciBsID0gdGhpc1tuYW1lXTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihtYXRjaFsxXSwgbCwgbC5fY2FwdHVyZSk7XG4gICAgICAgICAgICBkZWxldGUgdGhpc1tuYW1lXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuZWFjaChsaXN0ZW5lclxuICAgICAgICAgID8gKG4gPyBhZGQgOiBub29wKSAvLyBBdHRlbXB0IHRvIGFkZCB1bnR5cGVkIGxpc3RlbmVyIGlzIGlnbm9yZWQuXG4gICAgICAgICAgOiAobiA/IHJlbW92ZSA6IHJlbW92ZUFsbCkpO1xuICAgIH1cbiAgICB2YXIgc2VsZWN0aW9uX2RhdHVtID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gdGhpcy5wcm9wZXJ0eShcIl9fZGF0YV9fXCIsIHZhbHVlKSA6IHRoaXMubm9kZSgpLl9fZGF0YV9fO1xuICAgIH1cbiAgICB2YXIgc2VsZWN0aW9uX3JlbW92ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgICAgICAgaWYgKHBhcmVudCkgcGFyZW50LnJlbW92ZUNoaWxkKHRoaXMpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHZhciBzZWxlY3Rvck9mID0gZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgICB9O1xuICAgIH1cbiAgICB2YXIgbmFtZXNwYWNlcyA9IChuZXcgTWFwKVxuICAgICAgICAuc2V0KFwic3ZnXCIsIFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIilcbiAgICAgICAgLnNldChcInhodG1sXCIsIFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiKVxuICAgICAgICAuc2V0KFwieGxpbmtcIiwgXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIpXG4gICAgICAgIC5zZXQoXCJ4bWxcIiwgXCJodHRwOi8vd3d3LnczLm9yZy9YTUwvMTk5OC9uYW1lc3BhY2VcIilcbiAgICAgICAgLnNldChcInhtbG5zXCIsIFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC94bWxucy9cIik7XG5cbiAgICB2YXIgbmFtZXNwYWNlID0gZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIGkgPSBuYW1lLmluZGV4T2YoXCI6XCIpLCBwcmVmaXggPSBuYW1lO1xuICAgICAgaWYgKGkgPj0gMCkgcHJlZml4ID0gbmFtZS5zbGljZSgwLCBpKSwgbmFtZSA9IG5hbWUuc2xpY2UoaSArIDEpO1xuICAgICAgcmV0dXJuIG5hbWVzcGFjZXMuaGFzKHByZWZpeCkgPyB7c3BhY2U6IG5hbWVzcGFjZXMuZ2V0KHByZWZpeCksIGxvY2FsOiBuYW1lfSA6IG5hbWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRvck9mKG5hbWUpIHtcbiAgICAgIG5hbWUgPSBuYW1lc3BhY2UobmFtZSk7XG5cbiAgICAgIGZ1bmN0aW9uIGNyZWF0b3IoKSB7XG4gICAgICAgIHZhciBkb2N1bWVudCA9IHRoaXMub3duZXJEb2N1bWVudCxcbiAgICAgICAgICAgIHVyaSA9IHRoaXMubmFtZXNwYWNlVVJJO1xuICAgICAgICByZXR1cm4gdXJpXG4gICAgICAgICAgICA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyh1cmksIG5hbWUpXG4gICAgICAgICAgICA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobmFtZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNyZWF0b3JOUygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3duZXJEb2N1bWVudC5jcmVhdGVFbGVtZW50TlMobmFtZS5zcGFjZSwgbmFtZS5sb2NhbCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuYW1lLmxvY2FsID8gY3JlYXRvck5TIDogY3JlYXRvcjtcbiAgICB9XG5cbiAgICB2YXIgc2VsZWN0aW9uX2FwcGVuZCA9IGZ1bmN0aW9uKGNyZWF0b3IsIHNlbGVjdG9yKSB7XG4gICAgICBpZiAodHlwZW9mIGNyZWF0b3IgIT09IFwiZnVuY3Rpb25cIikgY3JlYXRvciA9IGNyZWF0b3JPZihjcmVhdG9yKTtcblxuICAgICAgZnVuY3Rpb24gYXBwZW5kKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcHBlbmRDaGlsZChjcmVhdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBpbnNlcnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmluc2VydEJlZm9yZShjcmVhdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyksIHNlbGVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgbnVsbCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnNlbGVjdChhcmd1bWVudHMubGVuZ3RoIDwgMlxuICAgICAgICAgID8gYXBwZW5kXG4gICAgICAgICAgOiAodHlwZW9mIHNlbGVjdG9yICE9PSBcImZ1bmN0aW9uXCIgJiYgKHNlbGVjdG9yID0gc2VsZWN0b3JPZihzZWxlY3RvcikpLCBpbnNlcnQpKTtcbiAgICB9XG4gICAgdmFyIHNlbGVjdGlvbl9odG1sID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMubm9kZSgpLmlubmVySFRNTDtcblxuICAgICAgZnVuY3Rpb24gc2V0Q29uc3RhbnQoKSB7XG4gICAgICAgIHRoaXMuaW5uZXJIVE1MID0gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNldEZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMuaW5uZXJIVE1MID0gdiA9PSBudWxsID8gXCJcIiA6IHY7XG4gICAgICB9XG5cbiAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSB2YWx1ZSA9IFwiXCI7XG5cbiAgICAgIHJldHVybiB0aGlzLmVhY2godHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyBzZXRGdW5jdGlvbiA6IHNldENvbnN0YW50KTtcbiAgICB9XG4gICAgdmFyIHNlbGVjdGlvbl90ZXh0ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRoaXMubm9kZSgpLnRleHRDb250ZW50O1xuXG4gICAgICBmdW5jdGlvbiBzZXRDb25zdGFudCgpIHtcbiAgICAgICAgdGhpcy50ZXh0Q29udGVudCA9IHZhbHVlO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzZXRGdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB0aGlzLnRleHRDb250ZW50ID0gdiA9PSBudWxsID8gXCJcIiA6IHY7XG4gICAgICB9XG5cbiAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSB2YWx1ZSA9IFwiXCI7XG5cbiAgICAgIHJldHVybiB0aGlzLmVhY2godHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyBzZXRGdW5jdGlvbiA6IHNldENvbnN0YW50KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb2xsYXBzZShzdHJpbmcpIHtcbiAgICAgIHJldHVybiBzdHJpbmcudHJpbSgpLnJlcGxhY2UoL1xccysvZywgXCIgXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNsYXNzZXJPZihuYW1lKSB7XG4gICAgICB2YXIgcmU7XG4gICAgICByZXR1cm4gZnVuY3Rpb24obm9kZSwgdmFsdWUpIHtcbiAgICAgICAgaWYgKGMgPSBub2RlLmNsYXNzTGlzdCkgcmV0dXJuIHZhbHVlID8gYy5hZGQobmFtZSkgOiBjLnJlbW92ZShuYW1lKTtcbiAgICAgICAgaWYgKCFyZSkgcmUgPSBuZXcgUmVnRXhwKFwiKD86XnxcXFxccyspXCIgKyByZXF1b3RlKG5hbWUpICsgXCIoPzpcXFxccyt8JClcIiwgXCJnXCIpO1xuICAgICAgICB2YXIgYyA9IG5vZGUuZ2V0QXR0cmlidXRlKFwiY2xhc3NcIikgfHwgXCJcIjtcbiAgICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgICAgcmUubGFzdEluZGV4ID0gMDtcbiAgICAgICAgICBpZiAoIXJlLnRlc3QoYykpIG5vZGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgY29sbGFwc2UoYyArIFwiIFwiICsgbmFtZSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgY29sbGFwc2UoYy5yZXBsYWNlKHJlLCBcIiBcIikpKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZWN0aW9uX2NsYXNzID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICAgIG5hbWUgPSAobmFtZSArIFwiXCIpLnRyaW0oKS5zcGxpdCgvXnxcXHMrLyk7XG4gICAgICB2YXIgbiA9IG5hbWUubGVuZ3RoO1xuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgdmFyIG5vZGUgPSB0aGlzLm5vZGUoKSwgaSA9IC0xO1xuICAgICAgICBpZiAodmFsdWUgPSBub2RlLmNsYXNzTGlzdCkgeyAvLyBTVkcgZWxlbWVudHMgbWF5IG5vdCBzdXBwb3J0IERPTVRva2VuTGlzdCFcbiAgICAgICAgICB3aGlsZSAoKytpIDwgbikgaWYgKCF2YWx1ZS5jb250YWlucyhuYW1lW2ldKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gbm9kZS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKTtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgbikgaWYgKCFjbGFzc2VkUmUobmFtZVtpXSkudGVzdCh2YWx1ZSkpIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgbmFtZSA9IG5hbWUubWFwKGNsYXNzZXJPZik7XG5cbiAgICAgIGZ1bmN0aW9uIHNldENvbnN0YW50KCkge1xuICAgICAgICB2YXIgaSA9IC0xO1xuICAgICAgICB3aGlsZSAoKytpIDwgbikgbmFtZVtpXSh0aGlzLCB2YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNldEZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaSA9IC0xLCB4ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgd2hpbGUgKCsraSA8IG4pIG5hbWVbaV0odGhpcywgeCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmVhY2godHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyBzZXRGdW5jdGlvbiA6IHNldENvbnN0YW50KTtcbiAgICB9XG4gICAgdmFyIHNlbGVjdGlvbl9wcm9wZXJ0eSA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHJldHVybiB0aGlzLm5vZGUoKVtuYW1lXTtcblxuICAgICAgZnVuY3Rpb24gcmVtb3ZlKCkge1xuICAgICAgICBkZWxldGUgdGhpc1tuYW1lXTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2V0Q29uc3RhbnQoKSB7XG4gICAgICAgIHRoaXNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2V0RnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB4ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKHggPT0gbnVsbCkgZGVsZXRlIHRoaXNbbmFtZV07XG4gICAgICAgIGVsc2UgdGhpc1tuYW1lXSA9IHg7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLmVhY2godmFsdWUgPT0gbnVsbCA/IHJlbW92ZSA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gc2V0RnVuY3Rpb24gOiBzZXRDb25zdGFudCk7XG4gICAgfVxuXG4gICAgdmFyIHNlbGVjdGlvbl9zdHlsZSA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICAgICAgdmFyIG4gPSBhcmd1bWVudHMubGVuZ3RoO1xuXG4gICAgICBpZiAobiA8IDIpIHJldHVybiBkZWZhdWx0VmlldyhuID0gdGhpcy5ub2RlKCkpLmdldENvbXB1dGVkU3R5bGUobiwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKTtcblxuICAgICAgaWYgKG4gPCAzKSBwcmlvcml0eSA9IFwiXCI7XG5cbiAgICAgIGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgdGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2V0Q29uc3RhbnQoKSB7XG4gICAgICAgIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkobmFtZSwgdmFsdWUsIHByaW9yaXR5KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2V0RnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB4ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKHggPT0gbnVsbCkgdGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcbiAgICAgICAgZWxzZSB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIHgsIHByaW9yaXR5KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMuZWFjaCh2YWx1ZSA9PSBudWxsID8gcmVtb3ZlIDogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyBzZXRGdW5jdGlvbiA6IHNldENvbnN0YW50KTtcbiAgICB9XG5cbiAgICB2YXIgc2VsZWN0aW9uX2F0dHIgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgICAgbmFtZSA9IG5hbWVzcGFjZShuYW1lKTtcblxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5ub2RlKCk7XG4gICAgICAgIHJldHVybiBuYW1lLmxvY2FsXG4gICAgICAgICAgICA/IG5vZGUuZ2V0QXR0cmlidXRlTlMobmFtZS5zcGFjZSwgbmFtZS5sb2NhbClcbiAgICAgICAgICAgIDogbm9kZS5nZXRBdHRyaWJ1dGUobmFtZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHJlbW92ZSgpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHJlbW92ZU5TKCkge1xuICAgICAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKG5hbWUuc3BhY2UsIG5hbWUubG9jYWwpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzZXRDb25zdGFudCgpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzZXRDb25zdGFudE5TKCkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZU5TKG5hbWUuc3BhY2UsIG5hbWUubG9jYWwsIHZhbHVlKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2V0RnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB4ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKHggPT0gbnVsbCkgdGhpcy5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgICAgIGVsc2UgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgeCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNldEZ1bmN0aW9uTlMoKSB7XG4gICAgICAgIHZhciB4ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgaWYgKHggPT0gbnVsbCkgdGhpcy5yZW1vdmVBdHRyaWJ1dGVOUyhuYW1lLnNwYWNlLCBuYW1lLmxvY2FsKTtcbiAgICAgICAgZWxzZSB0aGlzLnNldEF0dHJpYnV0ZU5TKG5hbWUuc3BhY2UsIG5hbWUubG9jYWwsIHgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5lYWNoKHZhbHVlID09IG51bGxcbiAgICAgICAgICA/IChuYW1lLmxvY2FsID8gcmVtb3ZlTlMgOiByZW1vdmUpXG4gICAgICAgICAgOiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgICAgPyAobmFtZS5sb2NhbCA/IHNldEZ1bmN0aW9uTlMgOiBzZXRGdW5jdGlvbilcbiAgICAgICAgICAgICAgOiAobmFtZS5sb2NhbCA/IHNldENvbnN0YW50TlMgOiBzZXRDb25zdGFudCkpKTtcbiAgICB9XG4gICAgdmFyIHNlbGVjdGlvbl9lYWNoID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgIHZhciBkZXB0aCA9IHRoaXMuX2RlcHRoLFxuICAgICAgICAgIHN0YWNrID0gbmV3IEFycmF5KGRlcHRoKTtcblxuICAgICAgZnVuY3Rpb24gdmlzaXQobm9kZXMsIGRlcHRoKSB7XG4gICAgICAgIHZhciBpID0gLTEsXG4gICAgICAgICAgICBuID0gbm9kZXMubGVuZ3RoLFxuICAgICAgICAgICAgbm9kZTtcblxuICAgICAgICBpZiAoLS1kZXB0aCkge1xuICAgICAgICAgIHZhciBzdGFjazAgPSBkZXB0aCAqIDIsXG4gICAgICAgICAgICAgIHN0YWNrMSA9IHN0YWNrMCArIDE7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgICAgIGlmIChub2RlID0gbm9kZXNbaV0pIHtcbiAgICAgICAgICAgICAgc3RhY2tbc3RhY2swXSA9IG5vZGUuX3BhcmVudC5fX2RhdGFfXywgc3RhY2tbc3RhY2sxXSA9IGk7XG4gICAgICAgICAgICAgIHZpc2l0KG5vZGUsIGRlcHRoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgICAgaWYgKG5vZGUgPSBub2Rlc1tpXSkge1xuICAgICAgICAgICAgICBzdGFja1swXSA9IG5vZGUuX19kYXRhX18sIHN0YWNrWzFdID0gaTtcbiAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobm9kZSwgc3RhY2spO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2aXNpdCh0aGlzLl9yb290LCBkZXB0aCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdmFyIHNlbGVjdGlvbl9lbXB0eSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICF0aGlzLm5vZGUoKTtcbiAgICB9XG4gICAgdmFyIHNlbGVjdGlvbl9zaXplID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2l6ZSA9IDA7XG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7ICsrc2l6ZTsgfSk7XG4gICAgICByZXR1cm4gc2l6ZTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBmaXJzdE5vZGUobm9kZXMsIGRlcHRoKSB7XG4gICAgICB2YXIgaSA9IC0xLFxuICAgICAgICAgIG4gPSBub2Rlcy5sZW5ndGgsXG4gICAgICAgICAgbm9kZTtcblxuICAgICAgaWYgKC0tZGVwdGgpIHtcbiAgICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgICBpZiAobm9kZSA9IG5vZGVzW2ldKSB7XG4gICAgICAgICAgICBpZiAobm9kZSA9IGZpcnN0Tm9kZShub2RlLCBkZXB0aCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGVsc2Uge1xuICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgIGlmIChub2RlID0gbm9kZXNbaV0pIHtcbiAgICAgICAgICAgIHJldHVybiBub2RlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB2YXIgc2VsZWN0aW9uX25vZGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmaXJzdE5vZGUodGhpcy5fcm9vdCwgdGhpcy5fZGVwdGgpO1xuICAgIH1cbiAgICB2YXIgc2VsZWN0aW9uX25vZGVzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbm9kZXMgPSBuZXcgQXJyYXkodGhpcy5zaXplKCkpLCBpID0gLTE7XG4gICAgICB0aGlzLmVhY2goZnVuY3Rpb24oKSB7IG5vZGVzWysraV0gPSB0aGlzOyB9KTtcbiAgICAgIHJldHVybiBub2RlcztcbiAgICB9XG4gICAgdmFyIHNlbGVjdGlvbl9jYWxsID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHNbMF07XG4gICAgICBjYWxsYmFjay5hcHBseShhcmd1bWVudHNbMF0gPSB0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXJyYXlpZnlOb2RlKG5vZGVzLCBkZXB0aCkge1xuICAgICAgdmFyIGkgPSAtMSxcbiAgICAgICAgICBuID0gbm9kZXMubGVuZ3RoLFxuICAgICAgICAgIG5vZGU7XG5cbiAgICAgIGlmICgtLWRlcHRoKSB7XG4gICAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgICAgaWYgKG5vZGUgPSBub2Rlc1tpXSkge1xuICAgICAgICAgICAgbm9kZXNbaV0gPSBhcnJheWlmeU5vZGUobm9kZSwgZGVwdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBlbHNlIGlmICghQXJyYXkuaXNBcnJheShub2RlcykpIHtcbiAgICAgICAgdmFyIGFycmF5ID0gbmV3IEFycmF5KG4pO1xuICAgICAgICB3aGlsZSAoKytpIDwgbikgYXJyYXlbaV0gPSBub2Rlc1tpXTtcbiAgICAgICAgYXJyYXkuX3BhcmVudCA9IG5vZGVzLl9wYXJlbnQ7XG4gICAgICAgIG5vZGVzID0gYXJyYXk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBub2RlcztcbiAgICB9Ly8gVGhlIGxlYWYgZ3JvdXBzIG9mIHRoZSBzZWxlY3Rpb24gaGllcmFyY2h5IGFyZSBpbml0aWFsbHkgTm9kZUxpc3QsXG4gICAgLy8gYW5kIHRoZW4gbGF6aWx5IGNvbnZlcnRlZCB0byBhcnJheXMgd2hlbiBtdXRhdGlvbiBpcyByZXF1aXJlZC5cbiAgICB2YXIgYXJyYXlpZnkgPSBmdW5jdGlvbihzZWxlY3Rpb24pIHtcbiAgICAgIHJldHVybiBzZWxlY3Rpb24uX3Jvb3QgPSBhcnJheWlmeU5vZGUoc2VsZWN0aW9uLl9yb290LCBzZWxlY3Rpb24uX2RlcHRoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhc2NlbmRpbmcoYSwgYikge1xuICAgICAgcmV0dXJuIGEgPCBiID8gLTEgOiBhID4gYiA/IDEgOiBhID49IGIgPyAwIDogTmFOO1xuICAgIH1cblxuICAgIHZhciBzZWxlY3Rpb25fc29ydCA9IGZ1bmN0aW9uKGNvbXBhcmF0b3IpIHtcbiAgICAgIGlmICghY29tcGFyYXRvcikgY29tcGFyYXRvciA9IGFzY2VuZGluZztcblxuICAgICAgZnVuY3Rpb24gY29tcGFyZShhLCBiKSB7XG4gICAgICAgIHJldHVybiBhICYmIGIgPyBjb21wYXJhdG9yKGEuX19kYXRhX18sIGIuX19kYXRhX18pIDogIWEgLSAhYjtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gdmlzaXQobm9kZXMsIGRlcHRoKSB7XG4gICAgICAgIGlmICgtLWRlcHRoKSB7XG4gICAgICAgICAgdmFyIGkgPSAtMSxcbiAgICAgICAgICAgICAgbiA9IG5vZGVzLmxlbmd0aCxcbiAgICAgICAgICAgICAgbm9kZTtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgICAgaWYgKG5vZGUgPSBub2Rlc1tpXSkge1xuICAgICAgICAgICAgICB2aXNpdChub2RlLCBkZXB0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgbm9kZXMuc29ydChjb21wYXJlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2aXNpdChhcnJheWlmeSh0aGlzKSwgdGhpcy5fZGVwdGgpO1xuICAgICAgcmV0dXJuIHRoaXMub3JkZXIoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvcmRlck5vZGUobm9kZXMsIGRlcHRoKSB7XG4gICAgICB2YXIgaSA9IG5vZGVzLmxlbmd0aCxcbiAgICAgICAgICBub2RlLFxuICAgICAgICAgIG5leHQ7XG5cbiAgICAgIGlmICgtLWRlcHRoKSB7XG4gICAgICAgIHdoaWxlICgtLWkgPj0gMCkge1xuICAgICAgICAgIGlmIChub2RlID0gbm9kZXNbaV0pIHtcbiAgICAgICAgICAgIG9yZGVyTm9kZShub2RlLCBkZXB0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGVsc2Uge1xuICAgICAgICBuZXh0ID0gbm9kZXNbLS1pXTtcbiAgICAgICAgd2hpbGUgKC0taSA+PSAwKSB7XG4gICAgICAgICAgaWYgKG5vZGUgPSBub2Rlc1tpXSkge1xuICAgICAgICAgICAgaWYgKG5leHQgJiYgbmV4dCAhPT0gbm9kZS5uZXh0U2libGluZykgbmV4dC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShub2RlLCBuZXh0KTtcbiAgICAgICAgICAgIG5leHQgPSBub2RlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB2YXIgc2VsZWN0aW9uX29yZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBvcmRlck5vZGUodGhpcy5fcm9vdCwgdGhpcy5fZGVwdGgpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZW1wdHlOb2RlKG5vZGVzLCBkZXB0aCkge1xuICAgICAgdmFyIGkgPSAtMSxcbiAgICAgICAgICBuID0gbm9kZXMubGVuZ3RoLFxuICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgZW1wdHkgPSBuZXcgQXJyYXkobik7XG5cbiAgICAgIGlmICgtLWRlcHRoKSB7XG4gICAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgICAgaWYgKG5vZGUgPSBub2Rlc1tpXSkge1xuICAgICAgICAgICAgZW1wdHlbaV0gPSBlbXB0eU5vZGUobm9kZSwgZGVwdGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBlbXB0eS5fcGFyZW50ID0gbm9kZXMuX3BhcmVudDtcbiAgICAgIHJldHVybiBlbXB0eTtcbiAgICB9XG5cbiAgICB2YXIgZW1wdHlPZiA9IGZ1bmN0aW9uKHNlbGVjdGlvbikge1xuICAgICAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oZW1wdHlOb2RlKGFycmF5aWZ5KHNlbGVjdGlvbiksIHNlbGVjdGlvbi5fZGVwdGgpLCBzZWxlY3Rpb24uX2RlcHRoKTtcbiAgICB9Ly8gTGF6aWx5IGNvbnN0cnVjdHMgdGhlIGV4aXQgc2VsZWN0aW9uIGZvciB0aGlzICh1cGRhdGUpIHNlbGVjdGlvbi5cbiAgICAvLyBVbnRpbCB0aGlzIHNlbGVjdGlvbiBpcyBqb2luZWQgdG8gZGF0YSwgdGhlIGV4aXQgc2VsZWN0aW9uIHdpbGwgYmUgZW1wdHkuXG5cbiAgICB2YXIgc2VsZWN0aW9uX2V4aXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl9leGl0IHx8ICh0aGlzLl9leGl0ID0gZW1wdHlPZih0aGlzKSk7XG4gICAgfS8vIExhemlseSBjb25zdHJ1Y3RzIHRoZSBlbnRlciBzZWxlY3Rpb24gZm9yIHRoaXMgKHVwZGF0ZSkgc2VsZWN0aW9uLlxuICAgIC8vIFVudGlsIHRoaXMgc2VsZWN0aW9uIGlzIGpvaW5lZCB0byBkYXRhLCB0aGUgZW50ZXIgc2VsZWN0aW9uIHdpbGwgYmUgZW1wdHkuXG5cbiAgICB2YXIgc2VsZWN0aW9uX2VudGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIXRoaXMuX2VudGVyKSB7XG4gICAgICAgIHRoaXMuX2VudGVyID0gZW1wdHlPZih0aGlzKTtcbiAgICAgICAgdGhpcy5fZW50ZXIuX3VwZGF0ZSA9IHRoaXM7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcy5fZW50ZXI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gRW50ZXJOb2RlKHBhcmVudCwgZGF0dW0pIHtcbiAgICAgIHRoaXMub3duZXJEb2N1bWVudCA9IHBhcmVudC5vd25lckRvY3VtZW50O1xuICAgICAgdGhpcy5uYW1lc3BhY2VVUkkgPSBwYXJlbnQubmFtZXNwYWNlVVJJO1xuICAgICAgdGhpcy5fbmV4dCA9IG51bGw7XG4gICAgICB0aGlzLl9wYXJlbnQgPSBwYXJlbnQ7XG4gICAgICB0aGlzLl9fZGF0YV9fID0gZGF0dW07XG4gICAgfVxuXG4gICAgRW50ZXJOb2RlLnByb3RvdHlwZSA9IHtcbiAgICAgIGFwcGVuZENoaWxkOiBmdW5jdGlvbihjaGlsZCkgeyByZXR1cm4gdGhpcy5fcGFyZW50Lmluc2VydEJlZm9yZShjaGlsZCwgdGhpcy5fbmV4dCk7IH0sXG4gICAgICBpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uKGNoaWxkLCBuZXh0KSB7IHJldHVybiB0aGlzLl9wYXJlbnQuaW5zZXJ0QmVmb3JlKGNoaWxkLCBuZXh0IHx8IHRoaXMuX25leHQpOyB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIHZhbHVlT2ZfKHZhbHVlKSB7IC8vIFhYWCBodHRwczovL2dpdGh1Yi5jb20vcm9sbHVwL3JvbGx1cC9pc3N1ZXMvMTJcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfTtcbiAgICB9Ly8gVGhlIHZhbHVlIG1heSBlaXRoZXIgYmUgYW4gYXJyYXkgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gYXJyYXkuXG4gICAgLy8gQW4gb3B0aW9uYWwga2V5IGZ1bmN0aW9uIG1heSBiZSBzcGVjaWZpZWQgdG8gY29udHJvbCBob3cgZGF0YSBpcyBib3VuZDtcbiAgICAvLyBpZiBubyBrZXkgZnVuY3Rpb24gaXMgc3BlY2lmaWVkLCBkYXRhIGlzIGJvdW5kIHRvIG5vZGVzIGJ5IGluZGV4LlxuICAgIC8vIE9yLCBpZiBubyBhcmd1bWVudHMgYXJlIHNwZWNpZmllZCwgdGhpcyBtZXRob2QgcmV0dXJucyBhbGwgYm91bmQgZGF0YS5cbiAgICB2YXIgc2VsZWN0aW9uX2RhdGEgPSBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgIHZhciBkYXRhID0gbmV3IEFycmF5KHRoaXMuc2l6ZSgpKSwgaSA9IC0xO1xuICAgICAgICB0aGlzLmVhY2goZnVuY3Rpb24oZCkgeyBkYXRhWysraV0gPSBkOyB9KTtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICB9XG5cbiAgICAgIHZhciBkZXB0aCA9IHRoaXMuX2RlcHRoIC0gMSxcbiAgICAgICAgICBzdGFjayA9IG5ldyBBcnJheShkZXB0aCAqIDIpLFxuICAgICAgICAgIGJpbmQgPSBrZXkgPyBiaW5kS2V5IDogYmluZEluZGV4O1xuXG4gICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHZhbHVlID0gdmFsdWVPZl8odmFsdWUpO1xuICAgICAgdmlzaXQodGhpcy5fcm9vdCwgdGhpcy5lbnRlcigpLl9yb290LCB0aGlzLmV4aXQoKS5fcm9vdCwgZGVwdGgpO1xuXG4gICAgICBmdW5jdGlvbiB2aXNpdCh1cGRhdGUsIGVudGVyLCBleGl0LCBkZXB0aCkge1xuICAgICAgICB2YXIgaSA9IC0xLFxuICAgICAgICAgICAgbixcbiAgICAgICAgICAgIG5vZGU7XG5cbiAgICAgICAgaWYgKGRlcHRoLS0pIHtcbiAgICAgICAgICB2YXIgc3RhY2swID0gZGVwdGggKiAyLFxuICAgICAgICAgICAgICBzdGFjazEgPSBzdGFjazAgKyAxO1xuXG4gICAgICAgICAgbiA9IHVwZGF0ZS5sZW5ndGg7XG5cbiAgICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgICAgaWYgKG5vZGUgPSB1cGRhdGVbaV0pIHtcbiAgICAgICAgICAgICAgc3RhY2tbc3RhY2swXSA9IG5vZGUuX3BhcmVudC5fX2RhdGFfXywgc3RhY2tbc3RhY2sxXSA9IGk7XG4gICAgICAgICAgICAgIHZpc2l0KG5vZGUsIGVudGVyW2ldLCBleGl0W2ldLCBkZXB0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdmFyIGogPSAwLFxuICAgICAgICAgICAgICBiZWZvcmU7XG5cbiAgICAgICAgICBiaW5kKHVwZGF0ZSwgZW50ZXIsIGV4aXQsIHZhbHVlLmFwcGx5KHVwZGF0ZS5fcGFyZW50LCBzdGFjaykpO1xuICAgICAgICAgIG4gPSB1cGRhdGUubGVuZ3RoO1xuXG4gICAgICAgICAgLy8gTm93IGNvbm5lY3QgdGhlIGVudGVyIG5vZGVzIHRvIHRoZWlyIGZvbGxvd2luZyB1cGRhdGUgbm9kZSwgc3VjaCB0aGF0XG4gICAgICAgICAgLy8gYXBwZW5kQ2hpbGQgY2FuIGluc2VydCB0aGUgbWF0ZXJpYWxpemVkIGVudGVyIG5vZGUgYmVmb3JlIHRoaXMgbm9kZSxcbiAgICAgICAgICAvLyByYXRoZXIgdGhhbiBhdCB0aGUgZW5kIG9mIHRoZSBwYXJlbnQgbm9kZS5cbiAgICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgICAgaWYgKGJlZm9yZSA9IGVudGVyW2ldKSB7XG4gICAgICAgICAgICAgIGlmIChpID49IGopIGogPSBpICsgMTtcbiAgICAgICAgICAgICAgd2hpbGUgKCEobm9kZSA9IHVwZGF0ZVtqXSkgJiYgKytqIDwgbik7XG4gICAgICAgICAgICAgIGJlZm9yZS5fbmV4dCA9IG5vZGUgfHwgbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gYmluZEluZGV4KHVwZGF0ZSwgZW50ZXIsIGV4aXQsIGRhdGEpIHtcbiAgICAgICAgdmFyIGkgPSAwLFxuICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgIG5vZGVMZW5ndGggPSB1cGRhdGUubGVuZ3RoLFxuICAgICAgICAgICAgZGF0YUxlbmd0aCA9IGRhdGEubGVuZ3RoLFxuICAgICAgICAgICAgbWluTGVuZ3RoID0gTWF0aC5taW4obm9kZUxlbmd0aCwgZGF0YUxlbmd0aCk7XG5cbiAgICAgICAgLy8gQ2xlYXIgdGhlIGVudGVyIGFuZCBleGl0IGFycmF5cywgYW5kIHRoZW4gaW5pdGlhbGl6ZSB0byB0aGUgbmV3IGxlbmd0aC5cbiAgICAgICAgZW50ZXIubGVuZ3RoID0gMCwgZW50ZXIubGVuZ3RoID0gZGF0YUxlbmd0aDtcbiAgICAgICAgZXhpdC5sZW5ndGggPSAwLCBleGl0Lmxlbmd0aCA9IG5vZGVMZW5ndGg7XG5cbiAgICAgICAgZm9yICg7IGkgPCBtaW5MZW5ndGg7ICsraSkge1xuICAgICAgICAgIGlmIChub2RlID0gdXBkYXRlW2ldKSB7XG4gICAgICAgICAgICBub2RlLl9fZGF0YV9fID0gZGF0YVtpXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZW50ZXJbaV0gPSBuZXcgRW50ZXJOb2RlKHVwZGF0ZS5fcGFyZW50LCBkYXRhW2ldKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3RlOiB3ZSBkb27igJl0IG5lZWQgdG8gZGVsZXRlIHVwZGF0ZVtpXSBoZXJlIGJlY2F1c2UgdGhpcyBsb29wIG9ubHlcbiAgICAgICAgLy8gcnVucyB3aGVuIHRoZSBkYXRhIGxlbmd0aCBpcyBncmVhdGVyIHRoYW4gdGhlIG5vZGUgbGVuZ3RoLlxuICAgICAgICBmb3IgKDsgaSA8IGRhdGFMZW5ndGg7ICsraSkge1xuICAgICAgICAgIGVudGVyW2ldID0gbmV3IEVudGVyTm9kZSh1cGRhdGUuX3BhcmVudCwgZGF0YVtpXSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3RlOiBhbmQsIHdlIGRvbuKAmXQgbmVlZCB0byBkZWxldGUgdXBkYXRlW2ldIGhlcmUgYmVjYXVzZSBpbW1lZGlhdGVseVxuICAgICAgICAvLyBmb2xsb3dpbmcgdGhpcyBsb29wIHdlIHNldCB0aGUgdXBkYXRlIGxlbmd0aCB0byBkYXRhIGxlbmd0aC5cbiAgICAgICAgZm9yICg7IGkgPCBub2RlTGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICBpZiAobm9kZSA9IHVwZGF0ZVtpXSkge1xuICAgICAgICAgICAgZXhpdFtpXSA9IHVwZGF0ZVtpXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB1cGRhdGUubGVuZ3RoID0gZGF0YUxlbmd0aDtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gYmluZEtleSh1cGRhdGUsIGVudGVyLCBleGl0LCBkYXRhKSB7XG4gICAgICAgIHZhciBpLFxuICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgIGRhdGFMZW5ndGggPSBkYXRhLmxlbmd0aCxcbiAgICAgICAgICAgIG5vZGVMZW5ndGggPSB1cGRhdGUubGVuZ3RoLFxuICAgICAgICAgICAgbm9kZUJ5S2V5VmFsdWUgPSBuZXcgTWFwLFxuICAgICAgICAgICAga2V5U3RhY2sgPSBuZXcgQXJyYXkoMikuY29uY2F0KHN0YWNrKSxcbiAgICAgICAgICAgIGtleVZhbHVlcyA9IG5ldyBBcnJheShub2RlTGVuZ3RoKSxcbiAgICAgICAgICAgIGtleVZhbHVlO1xuXG4gICAgICAgIC8vIENsZWFyIHRoZSBlbnRlciBhbmQgZXhpdCBhcnJheXMsIGFuZCB0aGVuIGluaXRpYWxpemUgdG8gdGhlIG5ldyBsZW5ndGguXG4gICAgICAgIGVudGVyLmxlbmd0aCA9IDAsIGVudGVyLmxlbmd0aCA9IGRhdGFMZW5ndGg7XG4gICAgICAgIGV4aXQubGVuZ3RoID0gMCwgZXhpdC5sZW5ndGggPSBub2RlTGVuZ3RoO1xuXG4gICAgICAgIC8vIENvbXB1dGUgdGhlIGtleXMgZm9yIGVhY2ggbm9kZS5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IG5vZGVMZW5ndGg7ICsraSkge1xuICAgICAgICAgIGlmIChub2RlID0gdXBkYXRlW2ldKSB7XG4gICAgICAgICAgICBrZXlTdGFja1swXSA9IG5vZGUuX19kYXRhX18sIGtleVN0YWNrWzFdID0gaTtcbiAgICAgICAgICAgIGtleVZhbHVlc1tpXSA9IGtleVZhbHVlID0ga2V5LmFwcGx5KG5vZGUsIGtleVN0YWNrKTtcblxuICAgICAgICAgICAgLy8gSXMgdGhpcyBhIGR1cGxpY2F0ZSBvZiBhIGtleSB3ZeKAmXZlIHByZXZpb3VzbHkgc2Vlbj9cbiAgICAgICAgICAgIC8vIElmIHNvLCB0aGlzIG5vZGUgaXMgbW92ZWQgdG8gdGhlIGV4aXQgc2VsZWN0aW9uLlxuICAgICAgICAgICAgaWYgKG5vZGVCeUtleVZhbHVlLmhhcyhrZXlWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgZXhpdFtpXSA9IG5vZGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE90aGVyd2lzZSwgcmVjb3JkIHRoZSBtYXBwaW5nIGZyb20ga2V5IHRvIG5vZGUuXG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgbm9kZUJ5S2V5VmFsdWUuc2V0KGtleVZhbHVlLCBub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3cgY2xlYXIgdGhlIHVwZGF0ZSBhcnJheSBhbmQgaW5pdGlhbGl6ZSB0byB0aGUgbmV3IGxlbmd0aC5cbiAgICAgICAgdXBkYXRlLmxlbmd0aCA9IDAsIHVwZGF0ZS5sZW5ndGggPSBkYXRhTGVuZ3RoO1xuXG4gICAgICAgIC8vIENvbXB1dGUgdGhlIGtleXMgZm9yIGVhY2ggZGF0dW0uXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBkYXRhTGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICBrZXlTdGFja1swXSA9IGRhdGFbaV0sIGtleVN0YWNrWzFdID0gaTtcbiAgICAgICAgICBrZXlWYWx1ZSA9IGtleS5hcHBseSh1cGRhdGUuX3BhcmVudCwga2V5U3RhY2spO1xuXG4gICAgICAgICAgLy8gSXMgdGhlcmUgYSBub2RlIGFzc29jaWF0ZWQgd2l0aCB0aGlzIGtleT9cbiAgICAgICAgICAvLyBJZiBub3QsIHRoaXMgZGF0dW0gaXMgYWRkZWQgdG8gdGhlIGVudGVyIHNlbGVjdGlvbi5cbiAgICAgICAgICBpZiAoIShub2RlID0gbm9kZUJ5S2V5VmFsdWUuZ2V0KGtleVZhbHVlKSkpIHtcbiAgICAgICAgICAgIGVudGVyW2ldID0gbmV3IEVudGVyTm9kZSh1cGRhdGUuX3BhcmVudCwgZGF0YVtpXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRGlkIHdlIGFscmVhZHkgYmluZCBhIG5vZGUgdXNpbmcgdGhpcyBrZXk/IChPciBpcyBhIGR1cGxpY2F0ZT8pXG4gICAgICAgICAgLy8gSWYgdW5pcXVlLCB0aGUgbm9kZSBhbmQgZGF0dW0gYXJlIGpvaW5lZCBpbiB0aGUgdXBkYXRlIHNlbGVjdGlvbi5cbiAgICAgICAgICAvLyBPdGhlcndpc2UsIHRoZSBkYXR1bSBpcyBpZ25vcmVkLCBuZWl0aGVyIGVudGVyaW5nIG5vciBleGl0aW5nLlxuICAgICAgICAgIGVsc2UgaWYgKG5vZGUgIT09IHRydWUpIHtcbiAgICAgICAgICAgIHVwZGF0ZVtpXSA9IG5vZGU7XG4gICAgICAgICAgICBub2RlLl9fZGF0YV9fID0gZGF0YVtpXTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBSZWNvcmQgdGhhdCB3ZSBjb25zdW1lZCB0aGlzIGtleSwgZWl0aGVyIHRvIGVudGVyIG9yIHVwZGF0ZS5cbiAgICAgICAgICBub2RlQnlLZXlWYWx1ZS5zZXQoa2V5VmFsdWUsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGFrZSBhbnkgcmVtYWluaW5nIG5vZGVzIHRoYXQgd2VyZSBub3QgYm91bmQgdG8gZGF0YSxcbiAgICAgICAgLy8gYW5kIHBsYWNlIHRoZW0gaW4gdGhlIGV4aXQgc2VsZWN0aW9uLlxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbm9kZUxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgaWYgKChub2RlID0gbm9kZUJ5S2V5VmFsdWUuZ2V0KGtleVZhbHVlc1tpXSkpICE9PSB0cnVlKSB7XG4gICAgICAgICAgICBleGl0W2ldID0gbm9kZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdmFyIGZpbHRlck9mID0gZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWF0Y2hlcyhzZWxlY3Rvcik7XG4gICAgICB9O1xuICAgIH07XG5cbiAgICBpZiAodHlwZW9mIGRvY3VtZW50ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gICAgICB2YXIgZWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICAgIGlmICghZWxlbWVudC5tYXRjaGVzKSB7XG4gICAgICAgIHZhciB2ZW5kb3JNYXRjaGVzID0gZWxlbWVudC53ZWJraXRNYXRjaGVzU2VsZWN0b3IgfHwgZWxlbWVudC5tc01hdGNoZXNTZWxlY3RvciB8fCBlbGVtZW50Lm1vek1hdGNoZXNTZWxlY3RvciB8fCBlbGVtZW50Lm9NYXRjaGVzU2VsZWN0b3I7XG4gICAgICAgIGZpbHRlck9mID0gZnVuY3Rpb24oc2VsZWN0b3IpIHsgcmV0dXJuIGZ1bmN0aW9uKCkgeyByZXR1cm4gdmVuZG9yTWF0Y2hlcy5jYWxsKHRoaXMsIHNlbGVjdG9yKTsgfTsgfTtcbiAgICAgIH1cbiAgICB9Ly8gVGhlIGZpbHRlciBtYXkgZWl0aGVyIGJlIGEgc2VsZWN0b3Igc3RyaW5nIChlLmcuLCBcIi5mb29cIilcbiAgICAvLyBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIGJvb2xlYW4uXG5cbiAgICB2YXIgc2VsZWN0aW9uX2ZpbHRlciA9IGZ1bmN0aW9uKGZpbHRlcikge1xuICAgICAgdmFyIGRlcHRoID0gdGhpcy5fZGVwdGgsXG4gICAgICAgICAgc3RhY2sgPSBuZXcgQXJyYXkoZGVwdGggKiAyKTtcblxuICAgICAgaWYgKHR5cGVvZiBmaWx0ZXIgIT09IFwiZnVuY3Rpb25cIikgZmlsdGVyID0gZmlsdGVyT2YoZmlsdGVyKTtcblxuICAgICAgZnVuY3Rpb24gdmlzaXQobm9kZXMsIGRlcHRoKSB7XG4gICAgICAgIHZhciBpID0gLTEsXG4gICAgICAgICAgICBuID0gbm9kZXMubGVuZ3RoLFxuICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgIHN1Ym5vZGVzO1xuXG4gICAgICAgIGlmICgtLWRlcHRoKSB7XG4gICAgICAgICAgdmFyIHN0YWNrMCA9IGRlcHRoICogMixcbiAgICAgICAgICAgICAgc3RhY2sxID0gc3RhY2swICsgMTtcbiAgICAgICAgICBzdWJub2RlcyA9IG5ldyBBcnJheShuKTtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgICAgaWYgKG5vZGUgPSBub2Rlc1tpXSkge1xuICAgICAgICAgICAgICBzdGFja1tzdGFjazBdID0gbm9kZS5fcGFyZW50Ll9fZGF0YV9fLCBzdGFja1tzdGFjazFdID0gaTtcbiAgICAgICAgICAgICAgc3Vibm9kZXNbaV0gPSB2aXNpdChub2RlLCBkZXB0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIGZpbHRlciBvcGVyYXRpb24gZG9lcyBub3QgcHJlc2VydmUgdGhlIG9yaWdpbmFsIGluZGV4LFxuICAgICAgICAvLyBzbyB0aGUgcmVzdWx0aW5nIGxlYWYgZ3JvdXBzIGFyZSBkZW5zZSAobm90IHNwYXJzZSkuXG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIHN1Ym5vZGVzID0gW107XG4gICAgICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgICAgIGlmIChub2RlID0gbm9kZXNbaV0pIHtcbiAgICAgICAgICAgICAgc3RhY2tbMF0gPSBub2RlLl9fZGF0YV9fLCBzdGFja1sxXSA9IGk7XG4gICAgICAgICAgICAgIGlmIChmaWx0ZXIuYXBwbHkobm9kZSwgc3RhY2spKSB7XG4gICAgICAgICAgICAgICAgc3Vibm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHN1Ym5vZGVzLl9wYXJlbnQgPSBub2Rlcy5fcGFyZW50O1xuICAgICAgICByZXR1cm4gc3Vibm9kZXM7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgU2VsZWN0aW9uKHZpc2l0KHRoaXMuX3Jvb3QsIGRlcHRoKSwgZGVwdGgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlbGVjdG9yQWxsT2Yoc2VsZWN0b3IpIHtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gICAgICB9O1xuICAgIH0vLyBUaGUgc2VsZWN0b3IgbWF5IGVpdGhlciBiZSBhIHNlbGVjdG9yIHN0cmluZyAoZS5nLiwgXCIuZm9vXCIpXG4gICAgLy8gb3IgYSBmdW5jdGlvbiB0aGF0IG9wdGlvbmFsbHkgcmV0dXJucyBhbiBhcnJheSBvZiBub2RlcyB0byBzZWxlY3QuXG4gICAgLy8gVGhpcyBpcyB0aGUgb25seSBvcGVyYXRpb24gdGhhdCBpbmNyZWFzZXMgdGhlIGRlcHRoIG9mIGEgc2VsZWN0aW9uLlxuXG4gICAgdmFyIHNlbGVjdGlvbl9zZWxlY3RBbGwgPSBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgICAgdmFyIGRlcHRoID0gdGhpcy5fZGVwdGgsXG4gICAgICAgICAgc3RhY2sgPSBuZXcgQXJyYXkoZGVwdGggKiAyKTtcblxuICAgICAgaWYgKHR5cGVvZiBzZWxlY3RvciAhPT0gXCJmdW5jdGlvblwiKSBzZWxlY3RvciA9IHNlbGVjdG9yQWxsT2Yoc2VsZWN0b3IpO1xuXG4gICAgICBmdW5jdGlvbiB2aXNpdChub2RlcywgZGVwdGgpIHtcbiAgICAgICAgdmFyIGkgPSAtMSxcbiAgICAgICAgICAgIG4gPSBub2Rlcy5sZW5ndGgsXG4gICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgc3Vibm9kZSxcbiAgICAgICAgICAgIHN1Ym5vZGVzID0gbmV3IEFycmF5KG4pO1xuXG4gICAgICAgIGlmICgtLWRlcHRoKSB7XG4gICAgICAgICAgdmFyIHN0YWNrMCA9IGRlcHRoICogMixcbiAgICAgICAgICAgICAgc3RhY2sxID0gc3RhY2swICsgMTtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgICAgaWYgKG5vZGUgPSBub2Rlc1tpXSkge1xuICAgICAgICAgICAgICBzdGFja1tzdGFjazBdID0gbm9kZS5fcGFyZW50Ll9fZGF0YV9fLCBzdGFja1tzdGFjazFdID0gaTtcbiAgICAgICAgICAgICAgc3Vibm9kZXNbaV0gPSB2aXNpdChub2RlLCBkZXB0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRGF0YSBpcyBub3QgcHJvcGFnYXRlZCBzaW5jZSB0aGVyZSBpcyBhIG9uZS10by1tYW55IG1hcHBpbmcuXG4gICAgICAgIC8vIFRoZSBwYXJlbnQgb2YgdGhlIG5ldyBsZWFmIGdyb3VwIGlzIHRoZSBvbGQgbm9kZS5cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgICAgIGlmIChub2RlID0gbm9kZXNbaV0pIHtcbiAgICAgICAgICAgICAgc3RhY2tbMF0gPSBub2RlLl9fZGF0YV9fLCBzdGFja1sxXSA9IGk7XG4gICAgICAgICAgICAgIHN1Ym5vZGVzW2ldID0gc3Vibm9kZSA9IHNlbGVjdG9yLmFwcGx5KG5vZGUsIHN0YWNrKTtcbiAgICAgICAgICAgICAgc3Vibm9kZS5fcGFyZW50ID0gbm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzdWJub2Rlcy5fcGFyZW50ID0gbm9kZXMuX3BhcmVudDtcbiAgICAgICAgcmV0dXJuIHN1Ym5vZGVzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFNlbGVjdGlvbih2aXNpdCh0aGlzLl9yb290LCBkZXB0aCksIGRlcHRoICsgMSk7XG4gICAgfS8vIFRoZSBzZWxlY3RvciBtYXkgZWl0aGVyIGJlIGEgc2VsZWN0b3Igc3RyaW5nIChlLmcuLCBcIi5mb29cIilcbiAgICAvLyBvciBhIGZ1bmN0aW9uIHRoYXQgb3B0aW9uYWxseSByZXR1cm5zIHRoZSBub2RlIHRvIHNlbGVjdC5cblxuICAgIHZhciBzZWxlY3Rpb25fc2VsZWN0ID0gZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICAgIHZhciBkZXB0aCA9IHRoaXMuX2RlcHRoLFxuICAgICAgICAgIHN0YWNrID0gbmV3IEFycmF5KGRlcHRoICogMik7XG5cbiAgICAgIGlmICh0eXBlb2Ygc2VsZWN0b3IgIT09IFwiZnVuY3Rpb25cIikgc2VsZWN0b3IgPSBzZWxlY3Rvck9mKHNlbGVjdG9yKTtcblxuICAgICAgZnVuY3Rpb24gdmlzaXQobm9kZXMsIHVwZGF0ZSwgZGVwdGgpIHtcbiAgICAgICAgdmFyIGkgPSAtMSxcbiAgICAgICAgICAgIG4gPSBub2Rlcy5sZW5ndGgsXG4gICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgc3Vibm9kZSxcbiAgICAgICAgICAgIHN1Ym5vZGVzID0gbmV3IEFycmF5KG4pO1xuXG4gICAgICAgIGlmICgtLWRlcHRoKSB7XG4gICAgICAgICAgdmFyIHN0YWNrMCA9IGRlcHRoICogMixcbiAgICAgICAgICAgICAgc3RhY2sxID0gc3RhY2swICsgMTtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgICAgaWYgKG5vZGUgPSBub2Rlc1tpXSkge1xuICAgICAgICAgICAgICBzdGFja1tzdGFjazBdID0gbm9kZS5fcGFyZW50Ll9fZGF0YV9fLCBzdGFja1tzdGFjazFdID0gaTtcbiAgICAgICAgICAgICAgc3Vibm9kZXNbaV0gPSB2aXNpdChub2RlLCB1cGRhdGUgJiYgdXBkYXRlW2ldLCBkZXB0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhlIGxlYWYgZ3JvdXAgbWF5IGJlIHNwYXJzZSBpZiB0aGUgc2VsZWN0b3IgcmV0dXJucyBhIGZhbHNleSB2YWx1ZTtcbiAgICAgICAgLy8gdGhpcyBwcmVzZXJ2ZXMgdGhlIGluZGV4IG9mIG5vZGVzICh1bmxpa2Ugc2VsZWN0aW9uLmZpbHRlcikuXG4gICAgICAgIC8vIFByb3BhZ2F0ZSBkYXRhIHRvIHRoZSBuZXcgbm9kZSBvbmx5IGlmIGl0IGlzIGRlZmluZWQgb24gdGhlIG9sZC5cbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhbiBlbnRlciBzZWxlY3Rpb24sIG1hdGVyaWFsaXplZCBub2RlcyBhcmUgbW92ZWQgdG8gdXBkYXRlLlxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgICAgaWYgKG5vZGUgPSBub2Rlc1tpXSkge1xuICAgICAgICAgICAgICBzdGFja1swXSA9IG5vZGUuX19kYXRhX18sIHN0YWNrWzFdID0gaTtcbiAgICAgICAgICAgICAgaWYgKHN1Ym5vZGUgPSBzZWxlY3Rvci5hcHBseShub2RlLCBzdGFjaykpIHtcbiAgICAgICAgICAgICAgICBpZiAoXCJfX2RhdGFfX1wiIGluIG5vZGUpIHN1Ym5vZGUuX19kYXRhX18gPSBub2RlLl9fZGF0YV9fO1xuICAgICAgICAgICAgICAgIGlmICh1cGRhdGUpIHVwZGF0ZVtpXSA9IHN1Ym5vZGUsIGRlbGV0ZSBub2Rlc1tpXTtcbiAgICAgICAgICAgICAgICBzdWJub2Rlc1tpXSA9IHN1Ym5vZGU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzdWJub2Rlcy5fcGFyZW50ID0gbm9kZXMuX3BhcmVudDtcbiAgICAgICAgcmV0dXJuIHN1Ym5vZGVzO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFNlbGVjdGlvbih2aXNpdCh0aGlzLl9yb290LCB0aGlzLl91cGRhdGUgJiYgdGhpcy5fdXBkYXRlLl9yb290LCBkZXB0aCksIGRlcHRoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZWxlY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IFNlbGVjdGlvbihbZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XSwgMSk7XG4gICAgfVxuXG4gICAgU2VsZWN0aW9uLnByb3RvdHlwZSA9IHNlbGVjdGlvbi5wcm90b3R5cGUgPSB7XG4gICAgICBzZWxlY3Q6IHNlbGVjdGlvbl9zZWxlY3QsXG4gICAgICBzZWxlY3RBbGw6IHNlbGVjdGlvbl9zZWxlY3RBbGwsXG4gICAgICBmaWx0ZXI6IHNlbGVjdGlvbl9maWx0ZXIsXG4gICAgICBkYXRhOiBzZWxlY3Rpb25fZGF0YSxcbiAgICAgIGVudGVyOiBzZWxlY3Rpb25fZW50ZXIsXG4gICAgICBleGl0OiBzZWxlY3Rpb25fZXhpdCxcbiAgICAgIG9yZGVyOiBzZWxlY3Rpb25fb3JkZXIsXG4gICAgICBzb3J0OiBzZWxlY3Rpb25fc29ydCxcbiAgICAgIGNhbGw6IHNlbGVjdGlvbl9jYWxsLFxuICAgICAgbm9kZXM6IHNlbGVjdGlvbl9ub2RlcyxcbiAgICAgIG5vZGU6IHNlbGVjdGlvbl9ub2RlLFxuICAgICAgc2l6ZTogc2VsZWN0aW9uX3NpemUsXG4gICAgICBlbXB0eTogc2VsZWN0aW9uX2VtcHR5LFxuICAgICAgZWFjaDogc2VsZWN0aW9uX2VhY2gsXG4gICAgICBhdHRyOiBzZWxlY3Rpb25fYXR0cixcbiAgICAgIHN0eWxlOiBzZWxlY3Rpb25fc3R5bGUsXG4gICAgICBwcm9wZXJ0eTogc2VsZWN0aW9uX3Byb3BlcnR5LFxuICAgICAgY2xhc3M6IHNlbGVjdGlvbl9jbGFzcyxcbiAgICAgIGNsYXNzZWQ6IHNlbGVjdGlvbl9jbGFzcywgLy8gZGVwcmVjYXRlZCBhbGlhc1xuICAgICAgdGV4dDogc2VsZWN0aW9uX3RleHQsXG4gICAgICBodG1sOiBzZWxlY3Rpb25faHRtbCxcbiAgICAgIGFwcGVuZDogc2VsZWN0aW9uX2FwcGVuZCxcbiAgICAgIGluc2VydDogc2VsZWN0aW9uX2FwcGVuZCwgLy8gZGVwcmVjYXRlZCBhbGlhc1xuICAgICAgcmVtb3ZlOiBzZWxlY3Rpb25fcmVtb3ZlLFxuICAgICAgZGF0dW06IHNlbGVjdGlvbl9kYXR1bSxcbiAgICAgIGV2ZW50OiBzZWxlY3Rpb25fZXZlbnQsXG4gICAgICBvbjogc2VsZWN0aW9uX2V2ZW50LCAvLyBkZXByZWNhdGVkIGFsaWFzXG4gICAgICBkaXNwYXRjaDogc2VsZWN0aW9uX2Rpc3BhdGNoXG4gICAgfTtcblxuICAgIHZhciBzZWxlY3QgPSBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgICAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oW3R5cGVvZiBzZWxlY3RvciA9PT0gXCJzdHJpbmdcIiA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpIDogc2VsZWN0b3JdLCAxKTtcbiAgICB9XG5cbiAgICB2YXIgcG9pbnQgPSBmdW5jdGlvbihub2RlLCBldmVudCkge1xuICAgICAgdmFyIHN2ZyA9IG5vZGUub3duZXJTVkdFbGVtZW50IHx8IG5vZGU7XG4gICAgICBpZiAoc3ZnLmNyZWF0ZVNWR1BvaW50KSB7XG4gICAgICAgIHZhciBwb2ludCA9IHN2Zy5jcmVhdGVTVkdQb2ludCgpO1xuICAgICAgICBpZiAoYnVnNDQwODMgPCAwKSB7XG4gICAgICAgICAgdmFyIHdpbmRvdyA9IGRlZmF1bHRWaWV3KG5vZGUpO1xuICAgICAgICAgIGlmICh3aW5kb3cuc2Nyb2xsWCB8fCB3aW5kb3cuc2Nyb2xsWSkge1xuICAgICAgICAgICAgc3ZnID0gc2VsZWN0KHdpbmRvdy5kb2N1bWVudC5ib2R5KS5hcHBlbmQoXCJzdmdcIikuc3R5bGUoe3Bvc2l0aW9uOiBcImFic29sdXRlXCIsIHRvcDogMCwgbGVmdDogMCwgbWFyZ2luOiAwLCBwYWRkaW5nOiAwLCBib3JkZXI6IFwibm9uZVwifSwgXCJpbXBvcnRhbnRcIik7XG4gICAgICAgICAgICB2YXIgY3RtID0gc3ZnLm5vZGUoKS5nZXRTY3JlZW5DVE0oKTtcbiAgICAgICAgICAgIGJ1ZzQ0MDgzID0gIShjdG0uZiB8fCBjdG0uZSk7XG4gICAgICAgICAgICBzdmcucmVtb3ZlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChidWc0NDA4MykgcG9pbnQueCA9IGV2ZW50LnBhZ2VYLCBwb2ludC55ID0gZXZlbnQucGFnZVk7XG4gICAgICAgIGVsc2UgcG9pbnQueCA9IGV2ZW50LmNsaWVudFgsIHBvaW50LnkgPSBldmVudC5jbGllbnRZO1xuICAgICAgICBwb2ludCA9IHBvaW50Lm1hdHJpeFRyYW5zZm9ybShub2RlLmdldFNjcmVlbkNUTSgpLmludmVyc2UoKSk7XG4gICAgICAgIHJldHVybiBbcG9pbnQueCwgcG9pbnQueV07XG4gICAgICB9XG4gICAgICB2YXIgcmVjdCA9IG5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICByZXR1cm4gW2V2ZW50LmNsaWVudFggLSByZWN0LmxlZnQgLSBub2RlLmNsaWVudExlZnQsIGV2ZW50LmNsaWVudFkgLSByZWN0LnRvcCAtIG5vZGUuY2xpZW50VG9wXTtcbiAgICB9XG5cbiAgICB2YXIgc291cmNlRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBjdXJyZW50ID0gZXZlbnQsIHNvdXJjZTtcbiAgICAgIHdoaWxlIChzb3VyY2UgPSBjdXJyZW50LnNvdXJjZUV2ZW50KSBjdXJyZW50ID0gc291cmNlO1xuICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgfVxuXG4gICAgdmFyIHRvdWNoZXMgPSBmdW5jdGlvbihub2RlLCB0b3VjaGVzKSB7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHRvdWNoZXMgPSBzb3VyY2VFdmVudCgpLnRvdWNoZXM7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbiA9IHRvdWNoZXMgPyB0b3VjaGVzLmxlbmd0aCA6IDAsIHBvaW50cyA9IG5ldyBBcnJheShuKTsgaSA8IG47ICsraSkge1xuICAgICAgICBwb2ludHNbaV0gPSBwb2ludChub2RlLCB0b3VjaGVzW2ldKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBwb2ludHM7XG4gICAgfVxuXG4gICAgdmFyIHRvdWNoID0gZnVuY3Rpb24obm9kZSwgdG91Y2hlcywgaWRlbnRpZmllcikge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSBpZGVudGlmaWVyID0gdG91Y2hlcywgdG91Y2hlcyA9IHNvdXJjZUV2ZW50KCkuY2hhbmdlZFRvdWNoZXM7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbiA9IHRvdWNoZXMgPyB0b3VjaGVzLmxlbmd0aCA6IDAsIHRvdWNoOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIGlmICgodG91Y2ggPSB0b3VjaGVzW2ldKS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICAgICAgcmV0dXJuIHBvaW50KG5vZGUsIHRvdWNoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIHNlbGVjdEFsbCA9IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gICAgICByZXR1cm4gbmV3IFNlbGVjdGlvbih0eXBlb2Ygc2VsZWN0b3IgPT09IFwic3RyaW5nXCIgPyBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKSA6IHNlbGVjdG9yLCAxKTtcbiAgICB9XG5cbiAgICB2YXIgbW91c2UgPSBmdW5jdGlvbihub2RlLCBldmVudCkge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSBldmVudCA9IHNvdXJjZUV2ZW50KCk7XG4gICAgICBpZiAoZXZlbnQuY2hhbmdlZFRvdWNoZXMpIGV2ZW50ID0gZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF07XG4gICAgICByZXR1cm4gcG9pbnQobm9kZSwgZXZlbnQpO1xuICAgIH1cblxuICAgIHZhciBkMyA9IHtcbiAgICAgIGdldCBldmVudCgpIHsgcmV0dXJuIGV2ZW50OyB9LFxuICAgICAgbW91c2U6IG1vdXNlLFxuICAgICAgbmFtZXNwYWNlOiBuYW1lc3BhY2UsXG4gICAgICBuYW1lc3BhY2VzOiBuYW1lc3BhY2VzLFxuICAgICAgcmVxdW90ZTogcmVxdW90ZSxcbiAgICAgIHNlbGVjdDogc2VsZWN0LFxuICAgICAgc2VsZWN0QWxsOiBzZWxlY3RBbGwsXG4gICAgICBzZWxlY3Rpb246IHNlbGVjdGlvbixcbiAgICAgIHRvdWNoOiB0b3VjaCxcbiAgICAgIHRvdWNoZXM6IHRvdWNoZXNcbiAgICB9O1xuXG4gICAgcmV0dXJuIGQzO1xuXG59KSk7IiwidmFyIGQzID0gcmVxdWlyZShcImQzLXNlbGVjdGlvblwiKSxcbiAgICBTaGVsbCA9IHJlcXVpcmUoXCIuLi8uLi9kM3BsdXMtc2hlbGwvc3JjL1NoZWxsLmpzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIGV4dGVuZHMgU2hlbGwge1xuXG4gIGNvbnN0cnVjdG9yIChkYXRhLCBzZXR0aW5ncyA9IG5ldyBNYXAoKSkge1xuXG4gICAgc3VwZXIoc2V0dGluZ3MpO1xuICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgdGhpcy5jYWNoZSA9IG5ldyBNYXAoKTtcblxuICB9XG5cbiAgY2xlYXIgKCkge1xuICAgIGZvciAobGV0IGtleSBvZiB0aGlzLmNhY2hlLmtleXMoKSkge1xuICAgICAgdmFyIGF0dHIgPSB0aGlzLnNldHRpbmdzLmdldChrZXkpO1xuICAgICAgaWYgKGF0dHIuY2hhbmdlZCB8fCBhdHRyLnR5cGUgPT09IEZ1bmN0aW9uKSB7XG4gICAgICAgIHRoaXMuY2FjaGUuZGVsZXRlKGtleSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZmV0Y2ggKG5hbWUpIHtcblxuICAgIGlmICh0aGlzLmNhY2hlLmhhcyhuYW1lKSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGUuZ2V0KG5hbWUpO1xuICAgIH1cblxuICAgIHZhciBhdHRyID0gdGhpcy5zZXR0aW5ncy5nZXQobmFtZSksIHZhbHVlO1xuICAgIGlmIChhdHRyKSB7XG4gICAgICB2YWx1ZSA9IGF0dHIudmFsdWU7XG4gICAgICBpZiAoYXR0ci50eXBlID09PSBGdW5jdGlvbikge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlKHRoaXMuZGF0YSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmICh2YWx1ZS5jb25zdHJ1Y3RvciA9PT0gU3RyaW5nKXtcbiAgICAgICAgaWYgKHRoaXMuZGF0YSBpbnN0YW5jZW9mIGQzLnNlbGVjdGlvbikge1xuICAgICAgICAgIHZhbHVlID0gdGhpcy5kYXRhLmF0dHIodmFsdWUpIHx8IHRoaXMuZGF0YS5zdHlsZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5kYXRhLmNvbnN0cnVjdG9yID09PSBPYmplY3QpIHtcbiAgICAgICAgICB2YWx1ZSA9IHRoaXMuZGF0YVt2YWx1ZV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmNhY2hlLnNldChuYW1lLCB2YWx1ZSk7XG4gICAgcmV0dXJuIHZhbHVlO1xuXG4gIH1cblxufTtcbiIsImNsYXNzIFNldHRpbmcge1xuXG4gIGNvbnN0cnVjdG9yICh2YWx1ZSwgYWxsb3dlZCA9IG51bGwpIHtcblxuICAgIHRoaXMuYWxsb3dlZCA9IGFsbG93ZWQ7XG4gICAgdGhpcy51cGRhdGUodmFsdWUpO1xuXG4gIH1cblxuICB1cGRhdGUgKHZhbHVlKSB7XG5cbiAgICB0aGlzLmNoYW5nZWQgPSB0cnVlO1xuICAgIHRoaXMudHlwZSA9IHZhbHVlLmNvbnN0cnVjdG9yO1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcblxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTZXR0aW5nO1xuIiwidmFyIFNldHRpbmcgPSByZXF1aXJlKFwiLi9TZXR0aW5nLmpzXCIpO1xuXG5jbGFzcyBTZXR0aW5ncyB7XG5cbiAgY29uc3RydWN0b3IgKGRhdGEgPSBuZXcgTWFwKCkpIHtcblxuICAgIGlmIChkYXRhLmNvbnN0cnVjdG9yID09PSBNYXApIHtcbiAgICAgIHRoaXMuZGF0YSA9IG5ldyBNYXAoKTtcbiAgICAgIGZvciAobGV0IGtleSBvZiBkYXRhLmtleXMoKSkge1xuICAgICAgICB0aGlzLmRhdGEuc2V0KGtleSwgbmV3IFNldHRpbmcoZGF0YS5nZXQoa2V5KSkpO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuZGF0YSA9IGRhdGE7XG4gICAgfVxuXG4gIH1cblxuICBnZXQgKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmdldChuYW1lKTtcbiAgfVxuXG4gIGtleXMgKCkge1xuICAgIHJldHVybiB0aGlzLmRhdGEua2V5cygpO1xuICB9XG5cbiAgc2V0IChuYW1lLCB2YWx1ZSkge1xuXG4gICAgaWYgKHRoaXMuZGF0YS5oYXMobmFtZSkpIHtcbiAgICAgIHRoaXMuZGF0YS5nZXQobmFtZSkudXBkYXRlKHZhbHVlKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLmRhdGEuc2V0KG5hbWUsIG5ldyBTZXR0aW5nKHZhbHVlKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2V0dGluZ3M7XG4iLCJ2YXIgU2V0dGluZ3MgPSByZXF1aXJlKFwiLi9TZXR0aW5ncy5qc1wiKTtcblxuY2xhc3MgU2hlbGwge1xuXG4gIGNvbnN0cnVjdG9yIChzZXR0aW5ncyA9IG5ldyBNYXAoKSkge1xuXG4gICAgdGhpcy5zZXR0aW5ncyA9IG5ldyBTZXR0aW5ncyhzZXR0aW5ncyk7XG5cbiAgfVxuXG4gIGF0dHIgKG5hbWUsIHZhbHVlKSB7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHJldHVybiB0aGlzLnNldHRpbmdzLmdldChuYW1lKS52YWx1ZTtcbiAgICB9XG4gICAgdGhpcy5zZXR0aW5ncy5zZXQobmFtZSwgdmFsdWUpO1xuXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgfVxuXG4gIGF0dHJzIChvYmopIHtcblxuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIHRoaXMuYXR0cihrZXksIG9ialtrZXldKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcblxuICB9XG5cbiAgcmVzZXQgKCkge1xuXG4gICAgZm9yIChsZXQga2V5IG9mIHRoaXMuc2V0dGluZ3Mua2V5cygpKSB7XG4gICAgICB0aGlzLnNldHRpbmdzLmdldChrZXkpLmNoYW5nZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcblxuICB9XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaGVsbDtcbiIsInZhciBkMyA9IHJlcXVpcmUoXCJkMy1zZWxlY3Rpb25cIiksXG4gICAgRGF0YVBvaW50ID0gcmVxdWlyZShcIi4uLy4uL2QzcGx1cy1kYXRhcG9pbnQvc3JjL0RhdGFQb2ludC5qc1wiKSxcbiAgICBTaGVsbCA9IHJlcXVpcmUoXCIuLi8uLi9kM3BsdXMtc2hlbGwvc3JjL1NoZWxsLmpzXCIpO1xuXG4vKiogQGNsYXNzICovXG5jbGFzcyBUZXh0Qm94IGV4dGVuZHMgU2hlbGwge1xuXG4gIGNvbnN0cnVjdG9yIChkYXRhID0gW10pIHtcblxuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zZXR0aW5ncy5zZXQoXCJyZXNpemVcIiwgZmFsc2UpO1xuICAgIHRoaXMuc2V0dGluZ3Muc2V0KFwieFwiLCAwKTtcbiAgICB0aGlzLnNldHRpbmdzLnNldChcInlcIiwgMCk7XG4gICAgdGhpcy5kYXRhKGRhdGEpO1xuXG4gIH1cblxuICBkYXRhIChhcnIpIHtcblxuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YUFycmF5O1xuICAgIH1cblxuICAgIGlmIChhcnIuY29uc3RydWN0b3IgPT09IFN0cmluZykge1xuICAgICAgYXJyID0gZDMuc2VsZWN0QWxsKGFycik7XG4gICAgfVxuXG4gICAgaWYgKGFyciBpbnN0YW5jZW9mIGQzLnNlbGVjdGlvbikge1xuICAgICAgdGhpcy5kYXRhQXJyYXkgPSBbXTtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIGFyci5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICBzZWxmLmRhdGFBcnJheS5wdXNoKG5ldyBEYXRhUG9pbnQodGhpcywgc2VsZi5zZXR0aW5ncykpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhpcy5kYXRhQXJyYXkgPSBhcnIubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRhUG9pbnQoZCwgdGhpcy5zZXR0aW5ncyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcblxuICB9XG5cbiAgZHJhdyAodGltaW5nKSB7XG5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgdGhpcy50aW1pbmcgPSB0aW1pbmc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgfVxuXG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGV4dEJveDtcbiJdfQ==
