import {test} from "tape";
import {default as box} from "../src/box.js";

test("box", (assert) => {

  const data = {text: "Hello D3plus, please wrap this sentence for me."};
  const testBox = box().data([data]).fontFamily("Verdana").fontSize(14)();

  assert.equal(document.getElementsByTagName("svg").length, 1, "automatically added <svg> element to page");
  assert.equal(document.getElementsByTagName("text").length, 1, "created <text> container element");
  assert.equal(document.getElementsByTagName("tspan").length, 2, "created 2 <tspan> elements");

  let tspans = document.getElementsByTagName("tspan");
  assert.true(tspans[0].textContent === "Hello D3plus, please wrap" &&
              tspans[1].textContent === "this sentence for me.", "wrapping text");

  testBox.fontResize(true)(() => {

    tspans = document.getElementsByTagName("tspan");
    assert.true(tspans[0].textContent === "Hello" &&
                tspans[1].textContent === "D3plus," &&
                tspans[2].textContent === "please" &&
                tspans[3].textContent === "wrap this" &&
                tspans[4].textContent === "sentence" &&
                tspans[5].textContent === "for me.", "font resizing");

    assert.end();

  });
});
