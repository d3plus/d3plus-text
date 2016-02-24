import {test} from "tape";
import {default as nightmare} from "nightmare";

const page = nightmare().goto("http://localhost:4000/test/browser/box.html");

test("automatically added <svg> element to page", (assert) => {
  page.evaluate(() => document.getElementsByTagName("svg").length)
    .then((result) => assert.equal(1, result))
    .then(() => assert.end());
});

// test("created <text> container element", (assert) => {
//   assert.plan(1);
//   page
//     .evaluate(() => document.getElementsByTagName("text").length)
//     .then((result) => assert.equal(1, result));
//   assert.end();
// });

// test("created 2 <tspan> elements", (assert) => {
//   page
//     .evaluate(() => document.getElementsByTagName("tspan").length)
//     .then((result) => {
//       assert.equal(2, result);
//       assert.end();
//     });
//   // assert.end();
// });

// test("wrapped text correctly", (assert) => {
//   page
//     .evaluate(() => {
//
//       const tspans = document.getElementsByTagName("tspan");
//
//       function getText(t) {
//         return t.textContent || t.innerText;
//       }
//
//       return getText(tspans[0]) === "Hello D3plus, please wrap" &&
//              getText(tspans[1]) === "this sentence for me.";
//
//     })
//     .then((result) => assert.equal(true, result));
//   assert.end();
// });

test.onFinish(() => {
  setTimeout(() => page.end(), 1000);
});
