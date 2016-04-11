import {test} from "tape";
import {default as box} from "../src/box.js";

const data = {"text": "Hello D3plus, please wrap this sentence for me."};
box().data([data]).fontFamily("Verdana").fontSize(14)();

test("automatically added <svg> element to page", (assert) => {
  assert.equal(document.getElementsByTagName("svg").length, 1);
  assert.end();
});

test("created <text> container element", (assert) => {
  assert.equal(document.getElementsByTagName("text").length, 1);
  assert.end();
});

test("created 2 <tspan> elements", (assert) => {
  assert.equal(document.getElementsByTagName("tspan").length, 2);
  assert.end();
});

test("wrapped text correctly", (assert) => {
  const tspans = document.getElementsByTagName("tspan");

  assert.true(tspans[0].textContent === "Hello D3plus, please wrap" &&
              tspans[1].textContent === "this sentence for me.");
  assert.end();
});
