import {JSDOM} from "jsdom";

/**
 * 
 * @param {String} message Test message to pass as first argument to the "it" functoin.
 * @param {String} [html = ""] Optional HTML string to render on the page.
 * @param {Function} run Callback function that is run once the "window" and "document" are ready.
 * @returns 
 */
export default function jsdomit(message, html, run) {
  if (arguments.length < 3) run = html, html = "";
  return it(message, async() => {
    try {
      const dom = new JSDOM(html);
      global.window = dom.window;
      global.document = dom.window.document;
      global.DOMParser = dom.window.DOMParser;
      await run();
    }
    finally {
      delete global.window;
      delete global.document;
      delete global.DOMParser;
    }
  });
}  
