import { spawn } from 'node:child_process';
import { expect } from 'chai';
import { Keyboard } from './Keyboard.js';
import KeyStroke from './KeyStroke.js';
import { Screen } from './Screen.js';

/**
 * Main entry point for CLI testing with natural language interface.
 *
 * **Motivation:** Provides a fluent, chainable API for CLI application testing that reads
 * like natural language, making tests more maintainable and expressive.
 *
 * @example
 * ```typescript
 * const I = await Cliete.openTerminal('git log', { width: 40, height: 20 });
 * I.press.up.three.times.and.press.enter.once.and.see(
 *   '1234567 Fix: bugs',
 *   '7654321 count: chickens'
 * );
 * ```
 */
export default class Cliete {
  private promises: Set<Promise<unknown>> = new Set();
  /**
   * Creates a new Cliete instance with keyboard and screen components.
   * @param keyboard - Keyboard instance for input simulation
   * @param screen - Screen instance for output capture
   */
  constructor(
    private readonly keyboard: Keyboard,
    private readonly screen: Screen,
  ) {}

  /**
   * Provides access to keyboard interactions with natural language chaining.
   * @returns KeyStroke instance for fluent key press operations
   * @example
   * I.press.up.three.times.and.press.enter.once;
   * I.press.tab.twice.and.type('hello');
   */
  get press() {
    const keyStrokes = new KeyStroke(this.keyboard, this);
    this.promises.add(Promise.all(keyStrokes.keyStrokes));
    return keyStrokes;
  }

  /**
   * Types text into the terminal.
   * @param text - Text to type
   * @returns Object with 'and' property for method chaining
   * @example
   * I.type('git status').and.press.enter.once;
   * I.type('hello world').and.see('hello world');
   */
  type(text: string): { and: ThisType<Cliete> } {
    this.promises.add(this.keyboard.type(text));
    return { and: this };
  }

  /**
   * Waits for all pending keyboard/typing operations to complete.
   */
  private async waitForCmdsToBuffer() {
    await Promise.all(this.promises);
    this.promises.clear();
  }

  /**
   * Waits for a specified duration.
   * @param ms - Milliseconds to wait
   * @returns This instance for method chaining
   * @example
   * await I.wait(1000); // Wait 1 second
   * await I.type('slow command').and.wait(500).see('result');
   */
  async wait(ms: number) {
    await new Promise(resolve => setTimeout(resolve, ms));
    return this;
  }

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
    await this.waitForCmdsToBuffer();
    await this.screen.waitForIdle();

    const actual = this.screen.render();
    expect(actual.trim()).to.equal(expected.join('\n'));
  }

  /**
   * Asserts that the current screen contains the specified substrings.
   * @param expected - Substrings that should be present in the screen output
   * @example
   * await I.spot('Fix: bugs'); // Find substring anywhere on screen
   */
  async spot(...expected: string[]) {
    await this.waitForCmdsToBuffer();
    await this.screen.waitForIdle();

    const actual = this.screen.render();
    expect(actual).to.include(expected.join('\n'));
  }

  /**
   * Opens a terminal session for CLI testing.
   * @param cmd - Command to execute in the terminal
   * @param options - Terminal dimensions configuration
   * @returns Promise resolving to Cliete instance ready for testing
   * @example
   * const I = await Cliete.openTerminal('git log', { width: 80, height: 24 });
   * const I = await Cliete.openTerminal('npm test', { width: 120, height: 30 });
   */
  static async openTerminal(cmd: string, options: { width: number; height: number }) {
    const child = spawn(cmd, {
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const screen = new Screen(options.width, options.height);
    screen.pipe(child.stdout, child.stderr);

    const keyboard = new Keyboard(child);

    // Wait for the first text to render on the screen.
    await screen.waitForUpdate();

    return new Cliete(keyboard, screen);
  }
}
