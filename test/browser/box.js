/* global casper */

casper.on("page.error", function(msg, trace) {
  this.echo("Error:    " + msg, "ERROR");
  this.echo("file:     " + trace[0].file, "WARNING");
  this.echo("line:     " + trace[0].line, "WARNING");
  this.echo("function: " + trace[0].function, "WARNING");
});

casper.test.begin("Box Tests", function(test) {

  casper
    .start("http://localhost:4000/test/browser/box.html", function(){
      test.assertElementCount("svg", 1);

      // this.wait(1000, function(){
      //   // this.capture("image.png", {
      //   //   top: 0,
      //   //   left: 0,
      //   //   width: 500,
      //   //   height: 500
      //   // });
      //   test.assertElementCount("rect", 1);
      //   test.assertEquals(this.getElementAttribute("rect", "width"), "100", "Correct width");
      // });

    })
    .run(function(){
      test.done();
    });
});
