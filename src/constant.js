/**
    Wraps non-function variables in a simple return function.
    @private
*/
export default function(x) {
  return function constant() {
    return x;
  };
}
