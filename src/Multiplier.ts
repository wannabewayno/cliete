import BaseMultiplier from './BaseMultiplier.js';

/**
 * Extends BaseMultiplier with more natural language options including alternative
 * phrasing (once, twice, thrice) and higher numbers.
 *
 * @template T - Type of the fallback object returned for chaining
 *
 * @example
 * const multiplier = new Multiplier(() => keyboard.press('down'), keyboard);
 * multiplier.twice.and.press('enter');
 * multiplier.twenty.one.times.and.type('hello');
 */
export default class Multiplier<T> extends BaseMultiplier<T> {
  /**
   * Executes action once and returns fallback for immediate chaining.
   * @returns Fallback object for method chaining
   */
  get and() {
    return this.nth(1).and;
  }

  /**
   * Executes the action once using alternative natural language.
   * @returns Object with 'and' property for chaining
   */
  get once() {
    return this.nth(1);
  }

  /**
   * Executes the action twice using alternative natural language.
   * @returns Object with 'and' property for chaining
   */
  get twice() {
    return this.nth(2);
  }

  /**
   * Executes the action three times using alternative natural language.
   * @returns Object with 'and' property for chaining
   */
  get thrice() {
    return this.nth(3);
  }

  /**
   * Executes the action ten times.
   * @returns Object with 'and' property for chaining
   */
  get ten() {
    return this.nth(10);
  }

  /**
   * Executes the action eleven times.
   * @returns Object with 'and' property for chaining
   */
  get eleven() {
    return this.nth(11);
  }

  /**
   * Executes the action twelve times.
   * @returns Object with 'and' property for chaining
   */
  get twelve() {
    return this.nth(12);
  }

  /**
   * Executes the action thirteen times.
   * @returns Object with 'and' property for chaining
   */
  get thirteen() {
    return this.nth(13);
  }

  /**
   * Executes the action fourteen times.
   * @returns Object with 'and' property for chaining
   */
  get fourteen() {
    return this.nth(14);
  }

  /**
   * Executes the action fifteen times.
   * @returns Object with 'and' property for chaining
   */
  get fifteen() {
    return this.nth(15);
  }

  /**
   * Executes the action sixteen times.
   * @returns Object with 'and' property for chaining
   */
  get sixteen() {
    return this.nth(16);
  }

  /**
   * Executes the action seventeen times.
   * @returns Object with 'and' property for chaining
   */
  get seventeen() {
    return this.nth(17);
  }

  /**
   * Executes the action eighteen times.
   * @returns Object with 'and' property for chaining
   */
  get eighteen() {
    return this.nth(18);
  }

  /**
   * Executes the action nineteen times.
   * @returns Object with 'and' property for chaining
   */
  get nineteen() {
    return this.nth(19);
  }

  /**
   * Executes the action twenty times and returns new multiplier for additional chaining.
   * @returns New BaseMultiplier instance for further operations
   */
  get twenty() {
    this.nth(20);
    return new BaseMultiplier(this.action, this.fallback);
  }

  /**
   * Executes the action thirty times and returns new multiplier for additional chaining.
   * @returns New BaseMultiplier instance for further operations
   */
  get thirty() {
    this.nth(30);
    return new BaseMultiplier(this.action, this.fallback);
  }

  /**
   * Executes the action forty times and returns new multiplier for additional chaining.
   * @returns New BaseMultiplier instance for further operations
   */
  get forty() {
    this.nth(40);
    return new BaseMultiplier(this.action, this.fallback);
  }

  /**
   * Executes the action fifty times and returns new multiplier for additional chaining.
   * @returns New BaseMultiplier instance for further operations
   */
  get fifty() {
    this.nth(50);
    return new BaseMultiplier(this.action, this.fallback);
  }

  /**
   * Executes the action sixty times and returns new multiplier for additional chaining.
   * @returns New BaseMultiplier instance for further operations
   */
  get sixty() {
    this.nth(60);
    return new BaseMultiplier(this.action, this.fallback);
  }

  /**
   * Executes the action seventy times and returns new multiplier for additional chaining.
   * @returns New BaseMultiplier instance for further operations
   */
  get seventy() {
    this.nth(70);
    return new BaseMultiplier(this.action, this.fallback);
  }

  /**
   * Executes the action eighty times and returns new multiplier for additional chaining.
   * @returns New BaseMultiplier instance for further operations
   */
  get eighty() {
    this.nth(80);
    return new BaseMultiplier(this.action, this.fallback);
  }

  /**
   * Executes the action ninety times and returns new multiplier for additional chaining.
   * @returns New BaseMultiplier instance for further operations
   */
  get ninety() {
    this.nth(90);
    return new BaseMultiplier(this.action, this.fallback);
  }

  /**
   * Executes the action one hundred times and returns new multiplier for additional chaining.
   * @returns New BaseMultiplier instance for further operations
   */
  get hundred() {
    this.nth(100);
    return new BaseMultiplier(this.action, this.fallback);
  }
}
