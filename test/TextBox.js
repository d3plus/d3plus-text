import {test} from "tape";
import {default as TextBox} from "../src/TextBox.js";

test("TextBox", assert => {

  assert.end();

  const data = {text: "Hello D3plus, please wrap this sentence for me."},
        height = 200,
        width = 200,
        x = 100,
        y = 100;

  const testBox = new TextBox()
    .data([data])
    .fontSize(14)
    .height(height)
    .width(width)
    .x(x)
    .y(y)
    .render();

  assert.equal(document.getElementsByTagName("svg").length, 1, "automatically added <svg> element to page");
  assert.equal(document.getElementsByTagName("text").length, 1, "created <text> container element");
  assert.equal(document.getElementsByTagName("tspan").length, 2, "created 2 <tspan> elements");

  let tspans = document.getElementsByTagName("tspan");
  assert.true(tspans[0].textContent === "Hello D3plus, please wrap" &&
              tspans[1].textContent === "this sentence for me.", "wrapped text");

  const elem = document.getElementById("d3plus-textBox-0");
  let bbox = elem.getBBox();
  assert.true(bbox.width <= width, "fit within width");
  assert.true(bbox.height <= height, "fit within height");
  assert.equal(Math.round(bbox.x), x, "x positioned correctly");

  const yP = 1;
  let y2 = y;
  assert.true(y2 - yP <= bbox.y <= y + yP, "y positioned correctly (top)");

  testBox.verticalAlign("middle").render(() => {

    bbox = elem.getBBox();
    y2 = y + height / 2 - bbox.height / 2;
    assert.true(y2 - yP <= bbox.y <= y + yP, "y positioned correctly (middle)");

    testBox.verticalAlign("bottom").render(() => {

      bbox = elem.getBBox();
      y2 = y + height - bbox.height;
      assert.true(y2 - yP <= bbox.y <= y + yP, "y positioned correctly (bottom)");

      testBox.fontResize(true).verticalAlign("top").render(() => {

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

  });

});
