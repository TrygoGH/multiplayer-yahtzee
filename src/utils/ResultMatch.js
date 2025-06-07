import { Result } from "./Result.js"
import { Any, isMatch } from "./Match.js";

export const Failure = Symbol("match_failure");
/**
 * Attempts to match a given value against a list of pattern-handler pairs,
 * returning a `Result` based on the first successful match.
 *
 * - If the pattern is `Any`, it always matches.
 * - If the pattern is `Failure`, the result is wrapped as a failure.
 * - Otherwise, it uses `isMatch` to determine if the pattern matches the value.
 *
 * @template T - The type of the input value being matched.
 * @template R - The type returned by the handler for a successful match.
 * @template E - The type used in the failure case. **This is not inferred from handlers.**
 * @param {T} value - The value to match against the patterns.
 * @param {Array<[pattern: any, handler: (value: T) => R]>} arms - An array of [pattern, handler] pairs.
 * @returns {Result<R, E>} A Result containing success (R) or failure (E).
 */
export function matchToResult(value, arms) {
    for (const [pattern, handler] of arms) {
        const isAny = pattern === Any;
        const isFailure = pattern === Failure;

        if (isAny || isFailure || isMatch(pattern, value)) {
            const val = handler(value);
            if (isFailure) return Result.failure(val);
            return Result.success(val);
        }
    }
    return Result.failure('No matching pattern found');
}