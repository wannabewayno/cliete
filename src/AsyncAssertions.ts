import { config, expect } from 'chai';
import type { Screen } from './Screen.js';
import errMessage from './utils/errMessage.js';
import { sleep, timeout } from './utils/time.js';

// Configure Chai to show full error messages without truncation
config.truncateThreshold = 0;

export default class AsyncAssertions {
  constructor(
    private readonly screen: Screen,
    private readonly opts: { preCondition?: Promise<unknown>; until?: number; action?: () => Promise<unknown> } = {},
  ) {}

  /**
   * Asserts that the current screen exactly matches the expected lines.
   * @param expected - Lines that should exactly match the screen output
   * @example
   * await I.see(
   *   '1234567 Fix: bugs',
   *   '7654321 count: chickens'
   * );
   * await I.see(
   *  '$ git status',
   *  'On branch main'
   * );
   */
  async see(...expected: string[]) {
    const assertion = () => {
      const actual = this.screen.render();
      expect(actual).to.equal(expected.join('\n'));
    };

    return this.assert(assertion, 'see');
  }

  /**
   * Asserts that the current screen contains the specified substring or regular expression.
   * @param expected - Substrings that should be present in the screen output
   * @example
   * await I.spot('Fix: bugs'); // Find substring anywhere on screen
   * await I.spot(/^commit: [a-f0-9]{40}$/m); // See if the screen matches the regular expression
   */
  async spot(expected: string | RegExp) {
    const assertion = () => {
      const actual = expect(this.screen.render().trim());
      expected instanceof RegExp ? actual.match(expected) : actual.include(expected);
    };

    return this.assert(assertion, 'spot');
  }

  private async assert(assertion: () => void, name: string) {
    // If there's a pre-condition, wait for this to resolve first.
    if (this.opts.preCondition) await this.opts.preCondition;

    // if we're waiting until a condition is met, loop the assertion until it either passes or timesout.
    if (this.opts.until) return this.loopAssertion(assertion, name, this.opts.until);
    assertion();
  }

  /**
   * Loops the Assertion until the timeout
   */
  private async loopAssertion(assertion: () => void, name: string, timeoutMs: number) {
    const loop = async () => {
      while (true) {
        try {
          assertion();
          return;
        } catch {
          if (this.opts.action) await this.opts.action();
          await sleep(25);
        }
      }
    };

    return timeout(loop(), () => `to ${name}\n${errMessage(assertion)}`, timeoutMs);
  }
}
