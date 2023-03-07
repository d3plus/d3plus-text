import assert from "assert";
import {default as rtl} from "../src/rtl.js";
import it from "./jsdom.js";

it("rtl", () => {
  assert.strictEqual(false, rtl(), "default ltr");
});

it("rtl - html", "<!doctype html><html dir='rtl'><head><meta charset='utf-8'></head><body></body></html>", () => {
  assert.strictEqual(true, rtl(), "detect HTML attribute");
});

it("rtl - body", "<!doctype html><html><head><meta charset='utf-8'></head><body dir='rtl'></body></html>", () => {
  assert.strictEqual(true, rtl(), "detect BODY attribute");
});

it("rtl - nested", "<!doctype html><html><head><meta charset='utf-8'></head><body><main dir='rtl'><svg id='test'></svg></main></body></html>", () => {
  assert.strictEqual(true, rtl(document.querySelector("#test")), "detect nested inheritance");
});
