import {select} from "d3-selection";

const elemRTL = e => select(e).size() && (select(e).attr("dir") === "rtl" || select(e).style("direction") === "rtl");

/**
    @function rtl
    @desc Returns `true` if the <html> or <body> element has either the "dir" HTML attribute or the "direction" CSS property set to "rtl". Accepts an optional DOM element as an argument, whose own inherited state will be evaluated rather than the default html/body logic.
    @param {HTMLElement} [elem]
*/
export default (elem = "body") => {
  elem = select(elem).node();
  while (elem && elem.parentNode && elem !== document.body && !elemRTL(elem)) {
    elem = elem.parentNode;
  }
  return elemRTL(elem) || elemRTL("html");
}
  
