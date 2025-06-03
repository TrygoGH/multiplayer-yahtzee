export class Result {
  constructor(success, data = undefined, error = "") {
    this.success = success;
    this.data = data;
    this.error = error;
  }

  // Factory methods for success and failure
  static success(data) {
    return new Result(true, data, null);
  }

  static failure(error) {
    return new Result(false, undefined, error);
  }

  // Check if the result is a success
  isSuccess() {
    return this.success;
  }

  // Check if the result is a failure
  isFailure() {
    return !this.success;
  }

  // Get data or throw an error if it's a failure
  unwrap() {
    if (this.isSuccess()) {
      return this.data;
    }
    throw new Error(`Cannot unwrap a failure: ${this.error}`);
  }

  // Get data or return a default value
  unwrapOr(defaultValue) {
    return this.isSuccess() ? this.data : defaultValue;
  }

  unwrapOrThrow(message = 'Operation failed') {
    if (this.isFailure()) {
      throw new Error(`${message}: ${this.error}`);
    }
    return this.data;
  }

  // Get error or throw if it's a success
  getError() {
    if (this.isFailure()) {
      return this.error;
    }
    throw new Error("Cannot get error from a success result.");
  }
}

/**
 * Wraps a promise in a try-catch block and returns a Result object.
 *
 * @template T The type of the successful data.
 * @template E The type of the error.
 * @param {Promise<T>} promise - The promise to execute.
 * @returns {Promise<Result<T, E>>} A Result object containing either the resolved data or an error.
 */
export async function tryCatchAsync(promise) {
  try {
    const data = await promise;
    return Result.success(data);
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
 * @returns {Result<T, E>} A Result object containing either the result or an error.
 */
export function tryCatch(fn) {
  try {
    const data = fn();
    return Result.success(data);
  } catch (error) {
    return Result.failure(error);
  }

  return Result.failure("Somehow bypassed the try-catch");
}

/**
 * Wraps a synchronous function in a try-catch block and returns a Result object.
 *
 * @template T The type of the successful data.
 * @template E The type of the error.
 * @param {Result} result - The function to execute.
 */
export function logResult(result) {
  if (result.isFailure()) {
    console.error(result.error);
  }
  else {
    console.log(result.data);
  }
}


function isConstructorMatch(value, typeSpec) {
  return typeof typeSpec === "function" && typeSpec !== Function && value instanceof typeSpec;
}

function isSpecificFunctionMatch(value, typeSpec) {
  return typeof value === "function" && value === typeSpec;
}

function isFunctionSignatureMatch(value, typeSpec) {
  if (typeof typeSpec !== "object" || !typeSpec.__function) return false;
  if (typeof value !== "function") return false;
  if ("length" in typeSpec && value.length !== typeSpec.length) return false;
  return true;
}

function isArrayMatch(value, typeSpec) {
  if (!Array.isArray(typeSpec)) return false;
  if (!Array.isArray(value)) return false;
  if (typeSpec.length === 0) return true; // Accept any array
  const itemShape = typeSpec[0];
  return value.every((item) => matchesType(item, itemShape));
}

function isPlainObjectMatch(value, typeSpec) {
  if (typeof typeSpec !== "object" || typeSpec === null || typeSpec.__function) return false;
  if (typeof value !== "object" || value === null) return false;
  return Object.keys(typeSpec).every((key) => key in value);
}

// Master type matcher
function matchesType(value, typeSpec) {
  return (
    isConstructorMatch(value, typeSpec) ||
    isSpecificFunctionMatch(value, typeSpec) ||
    isFunctionSignatureMatch(value, typeSpec) ||
    isArrayMatch(value, typeSpec) ||
    isPlainObjectMatch(value, typeSpec)
  );
}

// Result evaluator
function ensureResult(valueType, errorType, fn) {
  const result = fn();

  if (matchesType(result, valueType)) return Result.success(result);
  if (matchesType(result, errorType)) return Result.failure(result);

  throw new Error(`ensureResult: value did not match expected valueType or errorType. Got: ${JSON.stringify(result)}`);
}


export default Result;
