import extract from './utils/extract.js';

/**
 * Tracks and manages cursor position in CLI output, interpreting ANSI escape sequences.
 *
 * **Motivation:** CLI applications use ANSI escape sequences to control cursor movement.
 * This class provides a way to track cursor position changes and interpret these sequences
 * for testing and output analysis.
 *
 * The cursor position is relative to the initial command prompt:
 * `user@machine:~/target/directory $|` <- Cursor home position (0,0) is next to the '$'
 *
 * @example
 * const cursor = new Cursor();
 * cursor.interpret('\x1b[2B'); // Move down 2 lines
 * console.log(cursor.x, cursor.y); // (0, 2)
 */
export default class Cursor {
  private _hidden = false;
  /**
   * Creates a new cursor at the specified position.
   * @param _x - Initial horizontal position (default: 0)
   * @param _y - Initial vertical position (default: 0)
   */
  constructor(
    private _x = 0,
    private _y = 0,
  ) {}

  /**
   * Gets the current horizontal position.
   * @returns Current x coordinate
   */
  get x() {
    return this._x;
  }

  /**
   * Gets the current vertical position.
   * @returns Current y coordinate
   */
  get y() {
    return this._y;
  }

  get hidden() {
    return this._hidden;
  }

  /**
   * Hides the cursor (responds to ANSI sequence [?25l).
   */
  hide() {
    this._hidden = true;
  }

  /**
   * Shows the cursor (responds to ANSI sequence [?25h).
   */
  show() {
    this._hidden = false;
  }

  /**
   * Checks if text starts with an ANSI cursor control sequence.
   * @param text - Text to check
   * @returns True if text contains ANSI cursor sequence
   */
  isAnsiCursor(text: string) {
    // biome-ignore lint/suspicious/noControlCharactersInRegex: We're working with control characters
    return /^(\u001b|\x1b)?\[\??(\d+)?[A-DGlh]/.test(text);
  }

  /**
   * Interprets ANSI cursor sequences and updates cursor position accordingly.
   * @param text - Text containing potential ANSI sequences
   * @returns Text with ANSI cursor sequences removed
   */
  interpret(text: string): string {
    if (!this.isAnsiCursor(text)) return text;
    let ctrl = '';

    // Extract the ansi part from our string
    // biome-ignore lint/suspicious/noControlCharactersInRegex: We're expecting control characters
    [ctrl, text] = extract(text, /^(\u001b|\x1b)?\[\??(\d+)?[A-DGlh]/g);

    if (ctrl === '[?25l') {
      this.hide();
      return text;
    }

    if (ctrl === '[?25h') {
      this.show();
      return text;
    }

    // Extract the amount and direction out.
    // biome-ignore lint/suspicious/noControlCharactersInRegex: We're expecting control characters
    const [, amount, direction] = ctrl.replace(/\u001b|\x1b|\[/g, '').split(/(\d+)?([A-DG])/);

    // ? Note: with this regex split, you may encounter undefined on the amount and not an empty string
    // example `['', undefined, '[35G']` this is why we have that cheeky `?? '1'`
    const n = Number.parseInt(amount ?? '1');

    switch (direction) {
      case 'A':
        this.up(n);
        break;
      case 'B':
        this.down(n);
        break;
      case 'C':
        this.left(n);
        break;
      case 'D':
        this.right(n);
        break;
      case 'G':
        this._x = n;
        break;
    }

    return text;
  }

  /**
   * Moves cursor up by n positions.
   * @param n - Number of positions to move (default: 1)
   * @returns This cursor instance for chaining
   */
  up(n = 1): this {
    this._y -= n;
    return this;
  }

  /**
   * Moves cursor down by n positions.
   * @param n - Number of positions to move (default: 1)
   * @returns This cursor instance for chaining
   */
  down(n = 1): this {
    this._y += n;
    return this;
  }

  /**
   * Moves cursor left by n positions.
   * @param n - Number of positions to move (default: 1)
   * @returns This cursor instance for chaining
   */
  left(n = 1): this {
    this._x += n;
    return this;
  }

  /**
   * Moves cursor right by n positions.
   * @param n - Number of positions to move (default: 1)
   * @returns This cursor instance for chaining
   */
  right(n = 1): this {
    this._x -= n;
    return this;
  }

  /**
   * Resets cursor to home position (0,0).
   * @returns This cursor instance for chaining
   */
  home() {
    this._y = 0;
    this._x = 0;
    return this;
  }
}
