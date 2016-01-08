(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define('d3plus-text', ['exports'], factory) :
  (factory((global.d3plus_textbox = {})));
}(this, function (exports) { 'use strict';

  function box() {
    console.log("it worked");
  }

  var version = "0.2.0";

  exports.version = version;
  exports.box = box;

}));