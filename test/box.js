import {test} from "tape";
import {default as box} from "../src/box.js";

const data = {"text": "Hello D3plus, please wrap this sentence for me."};
box().data([data]).fontFamily("Verdana").fontSize(14)();

test("creating DOM elements", (assert) => {
  assert.equal(document.getElementsByTagName("svg").length, 1, "automatically added <svg> element to page");
  assert.equal(document.getElementsByTagName("text").length, 1, "created <text> container element");
  assert.equal(document.getElementsByTagName("tspan").length, 2, "created 2 <tspan> elements");
  assert.end();
});

test("wrapping text correctly", (assert) => {
  const tspans = document.getElementsByTagName("tspan");

  assert.true(tspans[0].textContent === "Hello D3plus, please wrap" &&
              tspans[1].textContent === "this sentence for me.", "2 line test");
  assert.end();
});
