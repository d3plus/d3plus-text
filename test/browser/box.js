/* global casper */

casper.on("page.error", function(msg, trace) {
  this.echo("Error:    " + msg, "ERROR");
  this.echo("file:     " + trace[0].file, "WARNING");
  this.echo("line:     " + trace[0].line, "WARNING");
  this.echo("function: " + trace[0].function, "WARNING");
});

casper.on("remote.message", function(msg) {
  this.echo("Console message: " + msg);
});

casper.test.begin("Box Tests", function(test) {

  casper
    .start("http://localhost:4000/test/browser/box.html", function(){

      test.assertElementCount("svg", 1, "Automatically added <svg> element to page.");
      test.assertElementCount("text", 1, "Created <text> container element.");
      test.assertElementCount("tspan", 2, "Created 2 <tspan> elements.");
      test.assertEval(function(){
        var tspans = document.getElementsByTagName("tspan");

        function getText(t) {
          return t.textContent || t.innerText;
        }

        return getText(tspans[0]) === "Hello D3plus, please wrap" &&
               getText(tspans[1]) === "this sentence for me.";
      }, "Wrapped text correctly.");

    })
    .run(function(){
      test.done();
    });
});
