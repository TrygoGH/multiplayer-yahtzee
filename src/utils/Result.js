/**
 * Represents the result of an operation that can succeed with data or fail with an error.
 * @template T The type of success data.
 * @template E The type of error.
 */
export class Result {
  /**
   * Creates a Result instance.
   * @param {boolean} success - Whether the result is a success.
   * @param {T} [data] - The successful data.
   * @param {E | string} [error] - The error value if failure.
   */
  constructor(success, data = undefined, error = "") {
    this.success = success;
    this.data = data;
    this.error = error;
  }

  /**
   * Creates a successful Result.
   * @param {T} data - The data to wrap.
   * @returns {Result<T, E>}
   */
  static success(data) {
    return new Result(true, data, null);
  }

  /**
   * Creates a failure Result.
   * @param {E | string} error - The error to wrap.
   * @returns {Result<T, E>}
   */
  static failure(error) {
    return new Result(false, undefined, error);
  }

  static ifNotNull(data){
    return isNullOrUndefined(data) ? Result.failure(data) : Result.success(data);
  }

  /**
   * Wraps an existing Result inside a new Result with the same success/failure state.
   * @param {Result<T, E>} result - The Result to wrap.
   * @returns {Result<Result<T, E>, E>} A new Result wrapping the original.
   */
  static wrap(result) {
    if (!(result instanceof Result)) throw new Error("Expected a Result");
    return result.isSuccess()
      ? Result.success(result)
      : Result.failure(result);
  }


  /** @returns {boolean} True if success. */
  isSuccess() {
    return this.success;
  }

  /** @returns {boolean} True if failure. */
  isFailure() {
    return !this.success;
  }

  /**
   * Returns the data if success, throws if failure.
   * @returns {T}
   * @throws {Error}
   */
  unwrap() {
    if (this.isSuccess()) {
      return this.data;
    }
    throw new Error(`Cannot unwrap a failure: ${this.error}`);
  }

  /**
   * Returns the data if success, otherwise returns a default value.
   * @param {T} defaultValue
   * @returns {T}
   */
  unwrapOr(defaultValue) {
    return this.isSuccess() ? this.data : defaultValue;
  }

  /**
   * Returns the data if success, otherwise throws with a custom message.
   * @param {string} [message='Operation failed']
   * @returns {T}
   * @throws {Error}
   */
  unwrapOrThrow(message = "Operation failed") {
    if (this.isFailure()) {
      throw new Error(`${message}: ${this.error}`);
    }
    return this.data;
  }

  /**
   * Returns the error if failure, throws if success.
   * @returns {E | string}
   * @throws {Error}
   */
  getError() {
    if (this.isFailure()) {
      return this.error;
    }
    throw new Error("Cannot get error from a success result.");
  }

  /**
   * Executes a function and wraps the return value in a Result.
   * Checks that the returned value matches one of the given value types (if any),
   * and that caught errors match one of the error types (if any).
   * 
   * If no value types are specified, the success value is not type-checked.
   * If no error types are specified, any thrown error results in a failure Result.
   * 
   * Throws immediately if neither value types nor error types are provided.
   *
   * @template V
   * @template E
   * @param {Object} options Options object.
   * @param {() => V} options.fn Function to execute.
   * @param {Array<Function|Object|string>} [options.vals=[]] List of acceptable success value types.
   * @param {Array<Function|Object|string>} [options.errs=[]] List of acceptable error types.
   * @returns {Result<V, E | string>} Result wrapping the success or failure.
   * @throws {Error} Throws if no value types or error types are provided.
   * @throws {TypeError} Throws if an unexpected error type is thrown.
   */
  static expectTypes({ fn, vals = [], errs = [] } = {}) {
    vals = Array.isArray(vals) ? vals : [vals];
    errs = Array.isArray(errs) ? errs : [errs];

    if ((!vals || vals.length === 0) && (!errs || errs.length === 0)) {
      throw new Error("ensureTypes requires at least one value type or error type to check against.");
    }

    try {
      const val = fn();
      if (vals.length && !matchesAnyType(val, vals)) {
        return Result.failure(`Expected value of type(s) ${vals.map(t => t.name || t).join(", ")}, got ${typeof val}: ${formatValue(val)}`);
      }
      return Result.success(val);
    } catch (err) {
      if (errs.length) {
        if (matchesAnyType(err, errs)) {
          return Result.failure(err);
        }
        throw new TypeError(`Unexpected error: ${err}`);
      }
      return Result.failure(err);
    }
  }

    /**
   * Executes a function and wraps the return value in a Result.
   * Checks that the returned value matches one of the given value types (if any),
   * and that caught errors match one of the error types (if any).
   * 
   * If no value types are specified, the success value is not type-checked.
   * If no error types are specified, any thrown error results in a failure Result.
   * 
   * Throws immediately if neither value types nor error types are provided.
   *
   * @template V
   * @template E
   * @param {Object} options Options object.
   * @param {() => Result<T, E>} options.fn Function to execute.
   * @param {Array<Function|Object|string>} [options.vals=[]] List of acceptable success value types.
   * @param {Array<Function|Object|string>} [options.errs=[]] List of acceptable error types.
   * @returns {Result<V, E | string>} Result wrapping the success or failure.
   * @throws {Error} Throws if no value types or error types are provided.
   * @throws {TypeError} Throws if an unexpected error type is thrown.
   */
  static expectTypesInside({ fn, vals = [], errs = [] } = {}) {
    vals = Array.isArray(vals) ? vals : [vals];
    errs = Array.isArray(errs) ? errs : [errs];

    if ((!vals || vals.length === 0) && (!errs || errs.length === 0)) {
      throw new Error("ensureTypes requires at least one value type or error type to check against.");
    }

    try {
      const val = fn();
      if (!val instanceof Result) throw new TypeError(`Expected return type of fn is ${typeof Result}, got ${typeof val}`)
      if(val.isFailure()) throw val.getError();
      const innerVal = val.unwrap();
      if (vals.length && !matchesAnyType(innerVal, vals)) {
        return Result.failure(`Expected value of type(s) ${vals.map(t => t.name || t).join(", ")}, got ${typeof innerVal}: ${formatValue(innerVal)}`);
      }
      return Result.success(innerVal);
    } catch (err) {
      if (errs.length) {
        if (matchesAnyType(err, errs)) {
          return Result.failure(err);
        }
        throw new TypeError(`Unexpected error: ${err}`);
      }
      return Result.failure(err);
    }
  }


  /**
   * Maps the success data synchronously, passes through failure unchanged.
   * @template U
   * @param {(data: T) => U} fn
   * @returns {Result<U, E>}
   */
  mapSync(fn) {
    if (this.isFailure()) return Result.failure(this.error);
    try {
      const result = fn(this.data);
      return Result.success(result);
    } catch (e) {
      return Result.failure(e);
    }
  }

  /**
   * Maps the success data asynchronously, passes through failure unchanged.
   * @template U
   * @param {(data: T) => Promise<U>} fn
   * @returns {Promise<Result<U, E>>}
   */
  async mapAsync(fn) {
    if (this.isFailure()) return Result.failure(this.error);
    try {
      const result = await fn(this.data);
      return Result.success(result);
    } catch (e) {
      return Result.failure(e);
    }
  }

  /**
   * Maps success data with a function that can return sync or Promise result.
   * @template U
   * @param {(data: T) => U | Promise<U>} fn
   * @returns {Promise<Result<U, E>>}
   */
  async map(fn) {
    if (this.isFailure()) return Result.failure(this.error);
    try {
      const result = fn(this.data);
      if (result instanceof Promise) {
        const awaited = await result;
        return Result.success(awaited);
      } else {
        return Result.success(result);
      }
    } catch (e) {
      return Result.failure(e);
    }
  }

  /**
   * Maps the error synchronously, passes through success unchanged.
   * @param {(error: E | string) => E | string} fn
   * @returns {Result<T, E>}
   */
  mapErrorSync(fn) {
    if (this.isSuccess()) return Result.success(this.data);
    try {
      const newError = fn(this.error);
      return Result.failure(newError);
    } catch (e) {
      return Result.failure(e);
    }
  }

  /**
   * Maps the error asynchronously, passes through success unchanged.
   * @param {(error: E | string) => Promise<E | string>} fn
   * @returns {Promise<Result<T, E>>}
   */
  async mapErrorAsync(fn) {
    if (this.isSuccess()) return Result.success(this.data);
    try {
      const newError = await fn(this.error);
      return Result.failure(newError);
    } catch (e) {
      return Result.failure(e);
    }
  }

  /**
   * Maps error with a function that can return sync or Promise error.
   * @param {(error: E | string) => E | string | Promise<E | string>} fn
   * @returns {Promise<Result<T, E>>}
   */
  async mapError(fn) {
    if (this.isSuccess()) return Result.success(this.data);
    try {
      const result = fn(this.error);
      if (result instanceof Promise) {
        const awaited = await result;
        return Result.failure(awaited);
      } else {
        return Result.failure(result);
      }
    } catch (e) {
      return Result.failure(e);
    }
  }

  /**
   * Chains synchronous bind operation, expects fn to return Result.
   * @template U
   * @param {(data: T) => Result<U, E>} fn
   * @returns {Result<U, E>}
   */
  bindSync(fn) {
    if (this.isFailure()) return Result.failure(this.error);
    try {
      const result = fn(this.data);
      return result.isSuccess()
        ? Result.success(result.unwrap())
        : Result.failure(result.getError());
    } catch (e) {
      return Result.failure(e);
    }
  }

  /**
   * Chains asynchronous bind operation, expects fn to return Promise<Result>.
   * @template U
   * @param {(data: T) => Promise<Result<U, E>>} fn
   * @returns {Promise<Result<U, E>>}
   */
  async bindAsync(fn) {
    if (this.isFailure()) return Result.failure(this.error);
    try {
      const result = await fn(this.data);
      if (result.isFailure()) return Result.failure(result.getError());
      return Result.success(result.unwrap());
    } catch (e) {
      return Result.failure(e);
    }
  }

  /**
   * Chains bind operation, fn can return Result or Promise<Result>.
   * If fn returns a non-Result value, wraps it in success.
   * @template U
   * @param {(data: T) => Result<U, E> | Promise<Result<U, E>> | U | Promise<U>} fn
   * @returns {Promise<Result<U, E>>}
   */
  async bind(fn) {
    if (this.isFailure()) return Result.failure(this.error);
    try {
      const result = fn(this.data);
      if (result instanceof Promise) {
        const awaitedResult = await result;
        if (awaitedResult instanceof Result) {
          return awaitedResult;
        }
        return Result.success(awaitedResult);
      } else {
        if (result instanceof Result) {
          return result;
        }
        return Result.success(result);
      }
    } catch (e) {
      return Result.failure(e);
    }
  }

  /**
     * Synchronous bind with named key
     * @template U
     * @param {string} key
     * @param {(data: T) => Result<U, E>} fn
     * @returns {Result<T & { [key: string]: U }, E>}
     */
  bindKeepSync(key, fn) {
    if (this.isFailure()) return Result.failure(this.error);
    try {
      const result = fn(this.data);
      if (result.isFailure()) return Result.failure(result.error);
      return Result.success({ ...this.data, [key]: result.data });
    } catch (e) {
      return Result.failure(e);
    }
  }

  /**
   * Asynchronous bind with named key
   * @template U
   * @param {string} key
   * @param {(data: T) => Promise<Result<U, E>>} fn
   * @returns {Promise<Result<T & { [key: string]: U }, E>>}
   */
  async bindKeepAsync(key, fn) {
    if (this.isFailure()) return Result.failure(this.error);
    try {
      const result = await fn(this.data);
      if (result.isFailure()) return Result.failure(result.error);
      return Result.success({ ...this.data, [key]: result.data });
    } catch (e) {
      return Result.failure(e);
    }
  }
  /**
   * Chains bind operation (sync or async) and merges result data with existing data.
   * @param {(data: T) => Result<object, E> | Promise<Result<object, E>>} fn
   * @returns {Promise<Result<object, E>>}
   */
  async bindKeep(fn) {
    if (this.isFailure()) return Result.failure(this.error);
    try {
      const result = fn(this.data);
      if (result instanceof Promise) {
        const awaitedResult = await result;
        if (awaitedResult.isFailure()) return Result.failure(awaitedResult.getError());
        return Result.success({ ...this.data, ...awaitedResult.unwrap() });
      } else {
        if (result.isFailure()) return Result.failure(result.getError());
        return Result.success({ ...this.data, ...result.unwrap() });
      }
    } catch (e) {
      return Result.failure(e);
    }
  }

  /**
   * Matches the result, executing success or failure handler.
   * @param {{success: (data: T) => any, failure: (error: E | string) => any}} handlers
   * @returns {any}
   */
  match({ success, failure }) {
    if (this.isSuccess()) {
      return success(this.data);
    } else {
      return failure(this.error);
    }
  }

  /**
   * Aggregates an array of Results into one Result containing an array of values.
   * If any Result is failure, returns the first failure.
   * @template U
   * @param {Result<U, E>[]} results
   * @returns {Result<U[], E>}
   */
  static all(results) {
    const values = [];
    for (const res of results) {
      if (res.isFailure()){
        const error = res.getError();
        return Result.failure(error);
      }
      else{
        values.push(res.unwrap()) 
      }
    }
    return Result.success(values);
  }
}

/**
 * Executes an async function in a try-catch block.
 * If it returns a Result, returns it as-is; otherwise wraps in Result.success.
 *
 * @template T
 * @template E
 * @param {() => Promise<T>} fn
 * @returns {Promise<Result<T, E>>}
 */
export async function tryCatchAsync(fn) {
  try {
    const data = await fn();
    return Result.success(data);
  } catch (error) {
    return Result.failure(error);
  }
}


/**
 * Executes an async function in a try-catch block.
 * If it returns a Result, returns it as-is; otherwise wraps in Result.success.
 *
 * @template T
 * @template E
 * @param {() => Promise<T> | Promise<Result<T, E>>} fn
 * @returns {Promise<Result<T, E>>}
 */
export async function tryCatchAsyncFlex(fn) {
  try {
    const data = await fn();
    return data instanceof Result ? data : Result.success(data);
  } catch (error) {
    return Result.failure(error);
  }
}

/**
 * Wraps a synchronous function in a try-catch block and returns a Result object.
 *
 * @template T The type of the successful data.
 * @template E The type of the error.
 * @param {() => T} fn - The function to execute.
 * @returns {Result<T, E>}
 */
export function tryCatch(fn) {
  try {
    const data = fn();
    return Result.success(data);
  } catch (error) {
    return Result.failure(error);
  }
}

/**
 * Wraps a function that may return a Result or plain value in a try-catch.
 * If a plain value, wraps in success.
 *
 * @template T
 * @template E
 * @param {() => T | Result<T, E>} fn
 * @returns {Result<T, E>}
 */
export function tryCatchFlex(fn) {
  try {
    const data = fn();
    return data instanceof Result ? data : Result.success(data);
  } catch (error) {
    return Result.failure(error);
  }
}

/**
 * Wraps a promise that may resolve to a Result or plain value.
 * Wraps plain value in Result.success.
 *
 * @template T
 * @template E
 * @param {Promise<T | Result<T, E>>} promise
 * @returns {Promise<Result<T, E>>}
 */
export async function tryCatchFlexAsync(promise) {
  try {
    const data = await promise;
    return data instanceof Result ? data : Result.success(data);
  } catch (error) {
    return Result.failure(error);
  }
}

/**
 * Logs the contents of a Result object.
 * Logs error to console.error, data to console.log.
 *
 * @param {Result<any, any>} result
 */
export function logResult(result) {
  if (result.isFailure()) {
    console.error(result.error);
  } else {
    console.log(result.data);
  }
}
/**
 * Checks if a value matches a null or undefined typeSpec.
 * @param {*} value
 * @param {*} typeSpec
 * @returns {boolean}
 */
function isNullOrUndefined(value, typeSpec) {
  return (typeSpec === null && value === null) ||
         (typeSpec === undefined && value === undefined);
}

/**
 * Checks if a value matches a given constructor type (primitive or class).
 * @param {*} value
 * @param {*} typeSpec
 * @returns {boolean}
 */
function isConstructorMatch(value, typeSpec) {
  if (typeSpec === String) return typeof value === "string";
  if (typeSpec === Number) return typeof value === "number";
  if (typeSpec === Boolean) return typeof value === "boolean";
  return typeof typeSpec === "function" && value instanceof typeSpec;
}

/**
 * Checks if a value matches a specific function reference.
 * @param {*} value
 * @param {*} typeSpec
 * @returns {boolean}
 */
function isSpecificFunctionMatch(value, typeSpec) {
  return typeof value === "function" && value === typeSpec;
}

/**
 * Checks if a function matches a given function signature.
 * @param {*} value
 * @param {*} typeSpec
 * @returns {boolean}
 */
function isFunctionSignatureMatch(value, typeSpec) {
  if (typeof typeSpec !== "object" || !typeSpec.__function) return false;
  if (typeof value !== "function") return false;
  if ("length" in typeSpec && value.length !== typeSpec.length) return false;
  return true;
}

/**
 * Checks if an array matches an expected array type shape.
 * @param {*} value
 * @param {*} typeSpec
 * @returns {boolean}
 */
function isArrayMatch(value, typeSpec) {
  if (!Array.isArray(typeSpec)) return false;
  if (!Array.isArray(value)) return false;
  if (typeSpec.length === 0) return true; // Accept any array
  const itemShape = typeSpec[0];
  return value.every((item) => matchesType(item, itemShape));
}

/**
 * Checks if an object matches a plain object type shape.
 * @param {*} value
 * @param {*} typeSpec
 * @returns {boolean}
 */
function isPlainObjectMatch(value, typeSpec) {
  if (typeof typeSpec !== "object" || typeSpec === null || typeSpec.__function) return false;
  if (typeof value !== "object" || value === null) return false;
  return Object.keys(typeSpec).every((key) => key in value);
}

/**
 * Master type matcher checking multiple matching strategies.
 * @param {*} value
 * @param {*} typeSpec
 * @returns {boolean}
 */
function matchesType(value, typeSpec) {
  return (
    isNullOrUndefined(value, typeSpec) ||
    isConstructorMatch(value, typeSpec) ||
    isSpecificFunctionMatch(value, typeSpec) ||
    isFunctionSignatureMatch(value, typeSpec) ||
    isArrayMatch(value, typeSpec) ||
    isPlainObjectMatch(value, typeSpec)
  );
}

function matchesAnyType(value, types) {
  if (!Array.isArray(types)) {
    types = [types];
  }
  for (const type of types) {
    if (matchesType(value, type)) {
      return true;
    }
  }
  return false;
}

/**
 * Formats a value into a human-readable string, attempting to show the type, class name,
 * and shallow contents (1-level depth) of objects like Set, Map, and plain objects.
 *
 * - Primitives are stringified using `JSON.stringify`.
 * - Sets are shown as `Set { val1, val2, ... }`.
 * - Maps are shown as `Map { key1 => val1, ... }`.
 * - Objects are shown as `ClassName { key1: val1, key2: val2, ... }` (up to 5 keys).
 *
 * @param {*} val - The value to format.
 * @returns {string} A human-readable string representation of the input value.
 */
function formatValue(val) {
    if (val === null) return 'null';
    if (typeof val === 'undefined') return 'undefined';
    if (typeof val !== 'object') return JSON.stringify(val);

    const className = val.constructor?.name || 'Object';

    if (val instanceof Set) {
        return `${className} { ${[...val].map(v => formatValue(v)).join(', ')} }`;
    }

    if (val instanceof Map) {
        return `${className} { ${[...val.entries()].map(([k, v]) => `${formatValue(k)} => ${formatValue(v)}`).join(', ')} }`;
    }

    try {
        const entries = Object.entries(val)
            .slice(0, 5) // limit to avoid too much output
            .map(([k, v]) => `${k}: ${formatValue(v)}`)
            .join(', ');
        return `${className} { ${entries} }`;
    } catch (e) {
        return `${className}`;
    }
}



