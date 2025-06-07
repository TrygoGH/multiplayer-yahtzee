export function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      // If enough arguments are provided, call the original function
      return fn(...args);
    } else {
      // Otherwise, return a function that takes the rest of the arguments
      return function(...nextArgs) {
        return curried(...args, ...nextArgs);
      };
    }
  };
}
