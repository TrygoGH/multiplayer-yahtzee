/**
 * Special symbol used to match any value in pattern matching.
 * @type {symbol}
 */
export const Any = Symbol("match_any");

/**
 * Attempts to match a given value against a list of pattern-handler pairs.
 * Returns the result of the first matching handler.
 *
 * @template T, R
 * @param {T} value - The value to match.
 * @param {[pattern: any, handler: (value: T) => R][]} arms - Array of [pattern, handler] pairs.
 * @returns {R} The result of the matching handler.
 * @throws {Error} If no pattern matches the value.
 */
export function match(value, arms) {
  for (const [pattern, handler] of arms) {
    if (pattern === Any || isMatch(pattern, value)) {
      return handler(value);
    }
  }
  throw new Error('No matching pattern found');
}

/**
 * Determines whether a value matches a given pattern.
 *
 * @param {any} pattern - The pattern to match against. Can be a function (predicate), object, or primitive.
 * @param {any} value - The value to compare.
 * @returns {boolean} True if the value matches the pattern; otherwise, false.
 */
export function isMatch(pattern, value) {
  if (typeof pattern === 'function') {
    // Predicate function
    return pattern(value);
  }

  if (pattern !== null && typeof pattern === 'object') {
    return deepMatch(pattern, value);
  }

  // Primitive equality
  return Object.is(pattern, value);
}

/**
 * Recursively checks if the value matches the structure and values of the pattern.
 *
 * @param {object} pattern - The object pattern to match.
 * @param {object} value - The object value to compare.
 * @returns {boolean} True if the value matches the object pattern; otherwise, false.
 */
function deepMatch(pattern, value) {
  if (pattern === value) return true;
  if (typeof pattern !== 'object' || typeof value !== 'object' || pattern === null || value === null) {
    return false;
  }

  for (const key in pattern) {
    if (!(key in value)) return false;
    if (!isMatch(pattern[key], value[key])) return false;
  }

  return true;
}
