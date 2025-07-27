/* c8 ignore next */
import type { Fallback } from './BaseMultiplier.js';
import type KEY_MAP from './constants/KEY_MAP.js';
import type { Keyboard } from './Keyboard.js';
import Multiplier from './Multiplier.js';

type KeyStrokeListener = (key: keyof typeof KEY_MAP) => void;

/**
 * Provides natural language interface for executing keyboard interactions multiple times.
 *
 * @template T - Type of the fallback object returned for chaining
 *
 * @example
 * const keyStroke = new KeyStroke(keyboard, testContext);
 * keyStroke.up.three.times.and.enter.once.and.<TestContextMethod>
 * // Equivalent to: press up 3 times, then press enter once, then execute something native to testContext
 */
export default class KeyStroke<And, Until> {
  readonly keyStrokeListeners: Set<KeyStrokeListener> = new Set();
  /**
   * Creates a new KeyStroke instance for natural language keyboard interactions.
   * @param keyboard - Keyboard instance to execute key presses
   * @param fallback - Object to return for method chaining after execution
   */
  constructor(
    private readonly keyboard: Keyboard,
    private readonly fallback: Fallback<And, Until>,
  ) {}

  onKeyStroke(listener: KeyStrokeListener) {
    this.keyStrokeListeners.add(listener);
  }

  /**
   * Executes a key press and tracks the promise for completion.
   * @param key - Key identifier from KEY_MAP
   */
  private pressKey(key: keyof typeof KEY_MAP) {
    // press the key and record the key we pressed
    this.keyboard.press(key);

    // notify listeners of keys we've pressed
    this.keyStrokeListeners.forEach(listener => listener(key));
  }

  /**
   * Creates multiplier for Enter key presses.
   * @returns Multiplier instance for natural language repetition
   */
  get enter() {
    return new Multiplier(() => this.pressKey('enter'), this.fallback);
  }

  /**
   * Creates multiplier for Tab key presses.
   * @returns Multiplier instance for natural language repetition
   */
  get tab() {
    return new Multiplier(() => this.pressKey('tab'), this.fallback);
  }

  /**
   * Creates multiplier for Escape key presses.
   * @returns Multiplier instance for natural language repetition
   */
  get esc() {
    return new Multiplier(() => this.pressKey('escape'), this.fallback);
  }

  /**
   * Creates multiplier for Backspace key presses.
   * @returns Multiplier instance for natural language repetition
   */
  get backspace() {
    return new Multiplier(() => this.pressKey('backspace'), this.fallback);
  }

  /**
   * Creates multiplier for Ctrl+C key presses.
   * @returns Multiplier instance for natural language repetition
   */
  get ctrlC() {
    return new Multiplier(() => this.pressKey('ctrlC'), this.fallback);
  }

  /**
   * Creates multiplier for Up arrow key presses.
   * @returns Multiplier instance for natural language repetition
   */
  get up() {
    return new Multiplier(() => this.pressKey('up'), this.fallback);
  }

  /**
   * Creates multiplier for Down arrow key presses.
   * @returns Multiplier instance for natural language repetition
   */
  get down() {
    return new Multiplier(() => this.pressKey('down'), this.fallback);
  }

  /**
   * Creates multiplier for Left arrow key presses.
   * @returns Multiplier instance for natural language repetition
   */
  get left() {
    return new Multiplier(() => this.pressKey('left'), this.fallback);
  }

  /**
   * Creates multiplier for Right arrow key presses.
   * @returns Multiplier instance for natural language repetition
   */
  get right() {
    return new Multiplier(() => this.pressKey('right'), this.fallback);
  }
}
