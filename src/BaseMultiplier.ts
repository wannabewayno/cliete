/**
 * Provides natural language chaining for repeating actions multiple times.
 *
 * **Motivation:** When writing CLI tests, you often need to repeat actions (like key presses)
 * multiple times. This class provides a fluent interface using natural language patterns
 * for better test readability and expressiveness.
 *
 * @template T - Type of the fallback object returned for chaining
 *
 * @example
 * ```typescript
 * const multiplier = new BaseMultiplier(() => keyboard.press('up'), keyboard);
 * multiplier.three.times.and.press('enter');
 * // Equivalent to: press up 3 times, then press enter
 * ```
 */
export default class BaseMultiplier<T> {
  /**
   * Creates a new multiplier for repeating actions.
   * @param action - Function to execute multiple times
   * @param fallback - Object to return for method chaining after execution
   */
  constructor(
    protected readonly action: () => unknown,
    protected readonly fallback: T,
  ) {}

  /**
   * Executes the action a specified number of times.
   * @param amount - Number of times to execute the action (default: 1)
   * @returns Object with 'and' property for chaining
   */
  nth(amount = 1) {
    for (let index = 0; index < amount; index++) this.action();
    return { and: this.fallback };
  }

  /**
   * Executes the action once using natural language.
   * @returns Object with 'times' property containing chaining result
   */
  get one() {
    return { times: this.nth(1) };
  }

  /**
   * Executes the action twice using natural language.
   * @returns Object with 'times' property containing chaining result
   */
  get two() {
    return { times: this.nth(2) };
  }

  /**
   * Executes the action three times using natural language.
   * @returns Object with 'times' property containing chaining result
   */
  get three() {
    return { times: this.nth(3) };
  }

  /**
   * Executes the action four times using natural language.
   * @returns Object with 'times' property containing chaining result
   */
  get four() {
    return { times: this.nth(4) };
  }

  /**
   * Executes the action five times using natural language.
   * @returns Object with 'times' property containing chaining result
   */
  get five() {
    return { times: this.nth(5) };
  }

  /**
   * Executes the action six times using natural language.
   * @returns Object with 'times' property containing chaining result
   */
  get six() {
    return { times: this.nth(6) };
  }

  /**
   * Executes the action seven times using natural language.
   * @returns Object with 'times' property containing chaining result
   */
  get seven() {
    return { times: this.nth(7) };
  }

  /**
   * Executes the action eight times using natural language.
   * @returns Object with 'times' property containing chaining result
   */
  get eight() {
    return { times: this.nth(8) };
  }

  /**
   * Executes the action nine times using natural language.
   * @returns Object with 'times' property containing chaining result
   */
  get nine() {
    return { times: this.nth(9) };
  }
}
