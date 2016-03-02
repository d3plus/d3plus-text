import {test} from "tape";
import {default as nightmare} from "nightmare";

const url = "http://localhost:4000/test/browser/box.html";

test("automatically added <svg> element to page", (assert) => {
  const page = nightmare();
  page.goto(url)
    .evaluate(() => document.getElementsByTagName("svg").length)
    .then((result) => {
      assert.equal(1, result);
      page.end(() => {
        assert.end();
      });
    });
});

test("created <text> container element", (assert) => {
  const page = nightmare();
  page.goto(url)
    .evaluate(() => document.getElementsByTagName("text").length)
    .then((result) => {
      assert.equal(1, result);
      page.end(() => {
        assert.end();
      });
    });
});

test("created 2 <tspan> elements", (assert) => {
  const page = nightmare();
  page.goto(url)
    .evaluate(() => document.getElementsByTagName("tspan").length)
    .then((result) => {
      assert.equal(2, result);
      page.end(() => {
        assert.end();
      });
    });
});

test("wrapped text correctly", (assert) => {
  const page = nightmare();
  page.goto(url)
    .evaluate(() => {

      const tspans = document.getElementsByTagName("tspan");

      return tspans[0].textContent === "Hello D3plus, please wrap" &&
             tspans[1].textContent === "this sentence for me.";

    })
    .then((result) => {
      assert.equal(true, result);
      page.end(() => {
        assert.end();
      });
    });
});
