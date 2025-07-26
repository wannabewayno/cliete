/** biome-ignore-all lint/suspicious/noThenProperty: We've deliberately setup classes as 'thenables' */
import { expect } from 'chai';
import { spawn } from 'node-pty';
import AsyncAssertions from './AsyncAssertions.js';
import { Keyboard } from './Keyboard.js';
import KeyStroke from './KeyStroke.js';
import { Screen } from './Screen.js';
import errMessage from './utils/errMessage.js';
import Shell from './utils/ShellCmd.js';
import { timeout, waitFor } from './utils/time.js';

interface IProcess {
  onExit: (listener: (exitCode: number) => void) => void;
  kill: () => void;
  name: string;
  pid: string;
}

interface OpenTerminalOpts {
  width?: number;
  height?: number;
  env?: Record<string, string | undefined>;
  cwd?: string;
  timeout?: number | null;
}

class ProcessExitWithCode {
  constructor(
    private processExit: Promise<number> | null,
    private timeoutMs?: number | null,
    private expectedCode?: number | 'nonZero',
  ) {}

  get with() {
    return {
      timeout: {
        of: (ms: number) => new ProcessExitWithCode(this.processExit, ms, this.expectedCode),
      },
      exit: {
        code: {
          of: (code: number) => new ProcessExitWithCode(this.processExit, this.timeoutMs, code),
          zero: new ProcessExitWithCode(this.processExit, this.timeoutMs, 0),
        },
      },
      nonZero: {
        exit: {
          code: new ProcessExitWithCode(this.processExit, this.timeoutMs, 'nonZero'),
        },
      },
    };
  }

  then<TResult1 = void, TResult2 = never>(
    onfulfilled?: ((value: unknown) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((error: Error) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    if (!this.processExit) return Promise.resolve().then(onfulfilled, onrejected);

    return timeout(this.processExit, 'process to exit', this.timeoutMs)
      .then(exitCode => {
        if (this.expectedCode !== undefined) {
          if (this.expectedCode === 'nonZero') {
            if (exitCode === 0)
              throw new Error(
                `Expected process to exit with non-zero code but instead exited with exit code of '${exitCode}'`,
              );
          } else {
            if (exitCode !== this.expectedCode)
              throw new Error(`Expected process to exit with '${this.expectedCode}' but instead exited with '${exitCode}'`);
          }
        }
      })
      .then(onfulfilled, onrejected);
  }
}

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
  private static defaultOpts: OpenTerminalOpts = {};
  private processExit: Promise<number> | null = null;
  private promises: Set<Promise<unknown>> = new Set();
  /**
   * Creates a new Cliete instance with keyboard and screen components.
   * @param keyboard - Keyboard instance for input simulation
   * @param screen - Screen instance for output capture
   */
  constructor(
    private readonly keyboard: Keyboard,
    private readonly screen: Screen,
    process?: IProcess,
  ) {
    if (process) {
      // Setup a promise to read the process exiting
      this.processExit = new Promise<number>(resolve => {
        process.onExit(exitCode => resolve(exitCode));
      }).finally(() => (this.processExit = null));
    }
  }

  /**
   * Provides access to keyboard interactions with natural language chaining.
   * @returns KeyStroke instance for fluent key press operations
   * @example
   * I.press.up.three.times.and.press.enter.once;
   * I.press.tab.twice.and.type('hello');
   */
  get press() {
    const keyStrokes = new KeyStroke(this.keyboard, this);
    this.addSelfDeletingPromise(Promise.all(keyStrokes.keyStrokes));
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
  type(text: string): { and: Cliete } {
    this.keyboard.type(text);
    return { and: this };
  }

  /**
   * Waits for any outstanding wait conditions and prints the current screen.
   * @param color
   * @returns
   */
  async printScreen(color?: 'color') {
    await this.waitForCmdsToBuffer();
    return this.screen.render(color === 'color');
  }

  /**
   * Waits for all pending keyboard/typing operations to complete.
   */
  private async waitForCmdsToBuffer() {
    await Promise.all(this.promises);
  }

  private addSelfDeletingPromise(promise: Promise<unknown>) {
    this.promises.add(promise);
    promise.finally(() => this.promises.delete(promise));
  }

  /**
   * Waits for a specified duration or action to occur when taking into account assertions and other actions
   * @returns Object with 'for' and 'until' properties for method chaining
   * actions chained with 'for' will wait explicitly for something to happen before asserting
   * actions chained with 'until' will repeatidly try the action until it succeeds within an optional timeout
   * @example
   * await I.wait.one.second.and.see('result'); // Wait 1 second before asserting 'result'
   * await I.type('slow command').and.wait.five.hundred.milliseconds.and.see('result'); // wait 500ms after typing 'slow command' before asserting 'result'
   * await I.wait.until.I.see('result') // wait until the 'result' appears on the screen
   * await I.wait.until.the.process.exits() // wait until the process exits.
   * await I.wait.for.the.screen.to.settle().and.I.see('result') // wait for no more ui layout shifts within a reasonable period of time before asserting 'result'
   */
  get wait() {
    return {
      // Wait for a definitive process to occur
      for: this.for,
      // Run our assertions in a retry loop until they succeed within a timeout.
      until: this.until,
    };
  }

  private get until() {
    return {
      I: new AsyncAssertions(this.screen, { until: 6000 }),
      the: {
        process: {
          exits: new ProcessExitWithCode(this.processExit),
        },
      },
    };
  }

  private get for() {
    return waitFor({
      the: {
        process: {
          to: {
            exit: new ProcessExitWithCode(this.processExit),
          },
        },
        screen: {
          to: {
            settle: (settleDuration?: number, timeout?: number) => {
              this.addSelfDeletingPromise(this.screen.waitForIdle(settleDuration, timeout));
              return { and: this as Cliete };
            },
          },
        },
      },
      and: (sleep: Promise<unknown>) => {
        this.addSelfDeletingPromise(sleep);
        return this as Cliete;
      },
    });
  }

  /**
   * Asserts that the current screen exactly matches the expected lines.
   * Will wait for any outstanding wait conditions first.
   * You are responsible for making sure that the screen is ready for asserting.
   * If you don't know when the screen is ready, try using the handy `wait` modifiers
   * await I.wait.for.<...> or I.wait.until.<...>
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

    const actual = this.screen.render();

    const errorMessage = errMessage(() => expect(actual.trim()).to.equal(expected.join('\n')));
    if (errorMessage) throw new Error(errorMessage);
  }

  /**
   * Asserts that the current screen contains the specified substring or matches a regular expression.
   * Will wait for any outstanding wait conditions first.
   * If you don't know when the screen is ready, try using the handy `wait` modifiers
   * await I.wait.for.<...> or I.wait.until.<...>
   * @param expected - Substring or Regular Expression that should be present in the screen output
   * @example
   * await I.spot('Fix: bugs'); // Find substring anywhere on screen
   * await I.spot(/^commit: [a-f0-9]{40}$/m); // See if the screen matches the regular expression
   */
  async spot(expected: string | RegExp) {
    await this.waitForCmdsToBuffer();

    const actual = expect(this.screen.render().trim());

    const errorMessage = errMessage(() => (expected instanceof RegExp ? actual.match(expected) : actual.include(expected)));
    if (errorMessage) throw new Error(errorMessage);
  }

  /**
   * Sets default options for openTerminal method.
   * @param type - The option type to set ('width', 'height', 'env', 'cwd', or 'timeout')
   * @param value - The default value to use
   * @returns Cliete class for method chaining
   * @example
   * Cliete.setDefault('width', 120);
   * Cliete.setDefault('height', 40);
   */
  static setDefault<K extends keyof OpenTerminalOpts>(type: K, value: OpenTerminalOpts[K]) {
    Cliete.defaultOpts[type] = value;
    return Cliete;
  }

  /**
   * Sets multiple default options for openTerminal method at once.
   * @param defaults - Object containing default options to set
   * @returns Cliete class for method chaining
   * @example
   * Cliete.setDefaults({ width: 120, height: 40, timeout: 2000, cwd: '/path/to/working/dir' });
   */
  static setDefaults(defaults: OpenTerminalOpts) {
    Cliete.defaultOpts = defaults;
    return Cliete;
  }

  /**
   * Clears all default options, resetting them to empty.
   * @example
   * Cliete.clearDefaults();
   */
  static clearDefaults() {
    Cliete.defaultOpts = {};
  }

  /**
   * Opens a terminal session for CLI testing.
   * Uses defaults set via setDefault() if options are not provided, otherwise falls back to built-in defaults.
   * @param cmd - Command to execute in the terminal
   * @param options - Terminal dimensions configuration
   * @returns Promise resolving to Cliete instance ready for testing
   * @example
   * const I = await Cliete.openTerminal('git log', { width: 80, height: 24 });
   * const I = await Cliete.openTerminal('npm test', { width: 120, height: 30 });
   */
  static async openTerminal(cmd: string, options: OpenTerminalOpts = {}) {
    const mergedOptions = { ...Cliete.defaultOpts, ...options };
    const { width = 40, height = 30, cwd = process.cwd(), env = process.env, timeout } = mergedOptions;

    const { shell, args } = Shell.fromString(cmd);
    const terminal = spawn(shell, args, {
      name: 'cliete',
      cols: width,
      rows: height,
      cwd,
      env,
    });

    const screen = new Screen(width, height);
    screen.pipe(terminal);

    const keyboard = new Keyboard(terminal);

    const cliete = new Cliete(keyboard, screen, {
      onExit: (listener: (exitCode: number) => void) => terminal.onExit(({ exitCode }) => listener(exitCode)),
      kill: terminal.kill,
      name: terminal.process,
      pid: terminal.pid.toString(),
    });

    // Wait for the first text to render on the screen.
    if (timeout !== null) await screen.waitForUpdate(timeout);

    return cliete;
  }
}
