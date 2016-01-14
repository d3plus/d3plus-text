(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-selection')) :
	typeof define === 'function' && define.amd ? define('d3plus-text', ['exports', 'd3-selection'], factory) :
	(factory((global.d3plus_text = {}),global.d3_selection));
}(this, function (exports,d3Selection) { 'use strict';

	var version = "0.2.0";

	function constant (x) {
	  return function constant() {
	    return x;
	  };
	}

	function boxEllipsis(_) {
	  if (_.includes(" ")) {
	    var a = _.split(/\s+/);
	    return _.replace(" " + a[a.length - 1], "...");
	  }
	  return "...";
	}

	var splitChars = ["-", "/", ";", ":", "&"];
	var splitRegex = new RegExp("[^\\s\\" + splitChars.join("\\") + "]+\\" + splitChars.join("?\\") + "?", "g");
	function boxSplit(_) {
	  return _.match(splitRegex);
	}

	function box () {

	  var ellipsis = boxEllipsis,
	      fontColor,
	      fontFamily,
	      fontSize,
	      height = constant(200),
	      lineHeight,
	      select,
	      split = boxSplit,
	      text,
	      width = constant(200),
	      x = constant(0),
	      y = constant(0);

	  function box() {

	    var fS = fontSize(),
	        h = height(select),
	        l = 1,
	        lH = lineHeight(),
	        p = "",
	        t = text(select),
	        w = width(select),
	        xP = x(select);

	    select.attr("y", y(select) + "px").attr("fill", fontColor()).attr("font-family", fontFamily()).attr("font-size", fS + "px").size("font-size", fS + "px");

	    function tspanStyle(tspan) {
	      tspan.attr("x", xP + "px").attr("dx", "0px").attr("dy", lH + "px").attr("dominant-baseline", "alphabetic").style("baseline-shift", "0%");
	    }

	    var tspan = select.html("").append("tspan").call(tspanStyle);
	    function addWord(word) {
	      var temp = p + word,
	          curr = tspan.html(),
	          join = t.charAt(temp.length);
	      tspan.html(curr + word);

	      if (select.node().getBBox().height > h) {
	        tspan.remove();
	        tspan = d3Selection.select(select.node().lastChild);
	        if (tspan.size()) {
	          t = tspan.html();
	          var e = ellipsis(t);
	          tspan.html(e ? e : t);
	        }
	        return false;
	      } else if (tspan.node().getComputedTextLength() > w) {
	        tspan.html(curr.trimRight());
	        tspan = select.append("tspan").call(tspanStyle);
	        l++;
	        return addWord(word);
	      } else {
	        var char = join === " " ? " " : "";
	        p = temp + char;
	        tspan.html(curr + word + char);
	        return true;
	      }
	    }

	    var _iteratorNormalCompletion = true;
	    var _didIteratorError = false;
	    var _iteratorError = undefined;

	    try {
	      for (var _iterator = split(t)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	        var word = _step.value;

	        var r = addWord(word);
	        if (!r) {
	          break;
	        }
	      }
	    } catch (err) {
	      _didIteratorError = true;
	      _iteratorError = err;
	    } finally {
	      try {
	        if (!_iteratorNormalCompletion && _iterator.return) {
	          _iterator.return();
	        }
	      } finally {
	        if (_didIteratorError) {
	          throw _iteratorError;
	        }
	      }
	    }
	  }

	  box.ellipsis = function (_) {
	    return arguments.length ? (ellipsis = typeof _ === "function" ? _ : constant(_), box) : ellipsis;
	  };

	  box.fontColor = function (_) {
	    return arguments.length ? (fontColor = typeof _ === "function" ? _ : constant(_), box) : fontColor;
	  };

	  box.fontFamily = function (_) {
	    return arguments.length ? (fontFamily = typeof _ === "function" ? _ : constant(_), box) : fontFamily;
	  };

	  box.fontSize = function (_) {
	    return arguments.length ? (fontSize = typeof _ === "function" ? _ : constant(_), box) : fontSize;
	  };

	  box.height = function (_) {
	    return arguments.length ? (height = typeof _ === "function" ? _ : constant(_), box) : height;
	  };

	  box.select = function (_) {
	    if (arguments.length) {
	      select = d3Selection.select(_);
	      if (text === void 0) {
	        text = constant(select.text());
	        if (fontColor === void 0) {
	          fontColor = constant(select.style("font-color"));
	        }
	        if (fontFamily === void 0) {
	          fontFamily = constant(select.style("font-family"));
	        }
	        if (fontSize === void 0) {
	          fontSize = constant(parseFloat(select.style("font-size"), 10));
	          lineHeight = constant(Math.ceil(fontSize() * 1.1));
	        }
	      }
	      return box;
	    }
	    return select;
	  };

	  box.split = function (_) {
	    return arguments.length ? (split = _, box) : split;
	  };

	  box.text = function (_) {
	    return arguments.length ? (text = typeof _ === "function" ? _ : constant(_), box) : text;
	  };

	  box.width = function (_) {
	    return arguments.length ? (width = typeof _ === "function" ? _ : constant(_), box) : width;
	  };

	  box.x = function (_) {
	    return arguments.length ? (x = typeof _ === "function" ? _ : constant(_), box) : x;
	  };

	  box.y = function (_) {
	    return arguments.length ? (y = typeof _ === "function" ? _ : constant(_), box) : y;
	  };

	  return box;
	}

	exports.version = version;
	exports.box = box;

}));