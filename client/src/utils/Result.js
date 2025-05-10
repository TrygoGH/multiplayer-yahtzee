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
export async function tryCatch(promise) {
  try {
    const data = await promise;
    return Result.success(data);
  } catch (error) {
    return Result.failure(error);
  }
}

export default Result;
 