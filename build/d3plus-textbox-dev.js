require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = (function () {
  function _class() {
    var attrLookup = arguments.length <= 0 || arguments[0] === undefined ? new Map() : arguments[0];

    _classCallCheck(this, _class);

    this.attrLookup = attrLookup;
  }

  _createClass(_class, [{
    key: "attr",
    value: function attr(name, value) {

      this.attrLookup.set(name, {
        changed: true,
        "function": value.constructor === Function,
        value: value
      });

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

        for (var _iterator = this.attrLookup.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _name = _step.value;

          this.attrLookup.get(_name).changed = false;
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

  return _class;
})();

},{}],"d3plus-textbox":[function(require,module,exports){
"use strict";

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Shell = require("../../d3plus-shell/src/shell.js");

module.exports = (function (_Shell) {
  _inherits(_class, _Shell);

  function _class() {
    _classCallCheck(this, _class);

    _get(Object.getPrototypeOf(_class.prototype), "constructor", this).call(this);
  }

  return _class;
})(Shell);

},{"../../d3plus-shell/src/shell.js":1}]},{},[])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvRGF2ZS9TaXRlcy9kM3BsdXMtc2hlbGwvc3JjL3NoZWxsLmpzIiwiL1VzZXJzL0RhdmUvU2l0ZXMvZDNwbHVzLXRleHRib3gvc3JjL3RleHRib3guanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNBQSxNQUFNLENBQUMsT0FBTztBQUVBLG9CQUF5QjtRQUF4QixVQUFVLHlEQUFHLElBQUksR0FBRyxFQUFFOzs7O0FBRWpDLFFBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0dBRTlCOzs7O1dBRUksY0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFOztBQUVqQixVQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUU7QUFDeEIsZUFBTyxFQUFFLElBQUk7QUFDYixvQkFBVSxLQUFLLENBQUMsV0FBVyxLQUFLLFFBQVE7QUFDeEMsYUFBSyxFQUFFLEtBQUs7T0FDYixDQUFDLENBQUM7O0FBRUgsYUFBTyxJQUFJLENBQUM7S0FFYjs7O1dBRUssZUFBQyxHQUFHLEVBQUU7O0FBRVYsV0FBSyxJQUFJLEdBQUcsSUFBSSxHQUFHLEVBQUU7QUFDbkIsWUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7T0FDMUI7O0FBRUQsYUFBTyxJQUFJLENBQUM7S0FFYjs7O1dBRUssaUJBQUc7Ozs7Ozs7QUFFUCw2QkFBaUIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsOEhBQUU7Y0FBaEMsS0FBSTs7QUFDWCxjQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFJLENBQUMsQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO1NBQzNDOzs7Ozs7Ozs7Ozs7Ozs7O0FBRUQsYUFBTyxJQUFJLENBQUM7S0FFYjs7OztJQUVGLENBQUM7Ozs7Ozs7Ozs7O0FDeENGLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDOztBQUV2RCxNQUFNLENBQUMsT0FBTzs7O0FBRUEsb0JBQUc7OztBQUViLGtGQUFRO0dBRVQ7OztHQU40QixLQUFLLENBUW5DLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSBjbGFzcyB7XG5cbiAgY29uc3RydWN0b3IgKGF0dHJMb29rdXAgPSBuZXcgTWFwKCkpIHtcblxuICAgIHRoaXMuYXR0ckxvb2t1cCA9IGF0dHJMb29rdXA7XG5cbiAgfVxuXG4gIGF0dHIgKG5hbWUsIHZhbHVlKSB7XG5cbiAgICB0aGlzLmF0dHJMb29rdXAuc2V0KG5hbWUsIHtcbiAgICAgIGNoYW5nZWQ6IHRydWUsXG4gICAgICBmdW5jdGlvbjogdmFsdWUuY29uc3RydWN0b3IgPT09IEZ1bmN0aW9uLFxuICAgICAgdmFsdWU6IHZhbHVlXG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcblxuICB9XG5cbiAgYXR0cnMgKG9iaikge1xuXG4gICAgZm9yIChsZXQga2V5IGluIG9iaikge1xuICAgICAgdGhpcy5hdHRyKGtleSwgb2JqW2tleV0pO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuXG4gIH1cblxuICByZXNldCAoKSB7XG5cbiAgICBmb3IgKGxldCBuYW1lIG9mIHRoaXMuYXR0ckxvb2t1cC5rZXlzKCkpIHtcbiAgICAgIHRoaXMuYXR0ckxvb2t1cC5nZXQobmFtZSkuY2hhbmdlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuXG4gIH1cblxufTtcbiIsInZhciBTaGVsbCA9IHJlcXVpcmUoXCIuLi8uLi9kM3BsdXMtc2hlbGwvc3JjL3NoZWxsLmpzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIGV4dGVuZHMgU2hlbGwge1xuXG4gIGNvbnN0cnVjdG9yICgpIHtcblxuICAgIHN1cGVyKCk7XG5cbiAgfVxuXG59O1xuIl19
