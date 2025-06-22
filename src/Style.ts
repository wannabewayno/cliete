import extract from './utils/extract.js';

class Num {
  private int: number;
  constructor(integer: number | string) {
    this.int = typeof integer === 'number' ? integer : Number.parseInt(integer);
  }

  isBetween(lower: number, upper: number) {
    return this.int >= lower && this.int <= upper;
  }

  isLessThan(boundary: number) {
    return this.int < boundary;
  }

  isGreaterThan(boundary: number) {
    return this.int > boundary;
  }
}

type AnsiItalicized = '3';
type AnsiUnderlined = '4';
type AnsiBright = '1';
type AnsiDim = '2';
type AnsiStrikethrough = '9';

const AnsiColors = {
  Black: '30',
  BrightBlack: '90',
  Red: '31',
  BrightRed: '91',
  Green: '32',
  BrightGreen: '92',
  Yellow: '33',
  BrightYellow: '93',
  Blue: '34',
  BrightBlue: '94',
  Magenta: '35',
  BrightMagenta: '95',
  Cyan: '36',
  BrightCyan: '96',
  White: '37',
  BrightWhite: '97',
} as const;

const AnsiBgColors = {
  Black: '40',
  BrightBlack: '100',
  Red: '41',
  BrightRed: '101',
  Green: '42',
  BrightGreen: '102',
  Yellow: '43',
  BrightYellow: '103',
  Blue: '44',
  BrightBlue: '104',
  Magenta: '45',
  BrightMagenta: '105',
  Cyan: '46',
  BrightCyan: '106',
  White: '47',
  BrightWhite: '107',
} as const;

type AnsiColorName = keyof typeof AnsiColors;
type AnsiBgColorName = keyof typeof AnsiBgColors;
// type AnsiColorValue = typeof AnsiColors[AnsiColorName];
// type AnsiBgColorValue = typeof AnsiBgColors[AnsiBgColorName];

/**
 * Manages ANSI text styling including colors, weights, and decorations for CLI output.
 *
 * **Motivation:** CLI applications use ANSI escape sequences for text styling (colors, bold, italic, etc.).
 * This class provides a way to apply, interpret, and manage these styles for testing and output formatting.
 *
 * Supports 8-bit, 16-bit, and 24-bit color modes depending on terminal capabilities.
 *
 * @example
 * ```typescript
 * const style = new Style();
 * const styledText = style.color('Red').weight('bright').apply('Error message');
 * // Returns: '\u001b[31;1mError message\u001b[m'
 * ```
 */
export default class Style {
  private _strikethrough?: AnsiStrikethrough;
  private _weight?: AnsiBright | AnsiDim;
  private _italicized?: AnsiItalicized;
  private _underlined?: AnsiUnderlined;
  private _color?: string;
  private _bgColor?: string;

  /**
   * Sets text weight (brightness/dimness).
   * @param style - Weight style: 'bright', 'dim', or 'normal'
   * @returns This style instance for chaining
   */
  weight(style: 'bright' | 'dim' | 'normal'): this {
    switch (style) {
      case 'bright':
        this._weight = '1';
        break;
      case 'dim':
        this._weight = '2';
        break;
      case 'normal':
        this._weight = undefined;
        break;
    }
    return this;
  }

  /**
   * Enables or disables strikethrough text decoration.
   * @param enable - Whether to enable strikethrough (default: true)
   * @returns This style instance for chaining
   */
  strikethrough(enable = true): this {
    this._strikethrough = enable ? '9' : undefined;
    return this;
  }

  /**
   * Enables or disables underlined text decoration.
   * @param enable - Whether to enable underline (default: true)
   * @returns This style instance for chaining
   */
  underline(enable = true): this {
    this._underlined = enable ? '4' : undefined;
    return this;
  }

  /**
   * Enables or disables italic text decoration.
   * @param enable - Whether to enable italics (default: true)
   * @returns This style instance for chaining
   */
  italicize(enable = true): this {
    this._italicized = enable ? '3' : undefined;
    return this;
  }

  /**
   * Sets text weight to normal (removes bright/dim).
   * @returns This style instance for chaining
   */
  normal(): this {
    this.weight('normal');
    return this;
  }

  /**
   * Sets text weight to bright (bold).
   * @returns This style instance for chaining
   */
  brighten(): this {
    this.weight('bright');
    return this;
  }

  /**
   * Sets text weight to dim.
   * @returns This style instance for chaining
   */
  darken(): this {
    this.weight('dim');
    return this;
  }

  /**
   * Resets all styling to default values.
   * @returns This style instance for chaining
   */
  reset(): this {
    this.weight('normal');
    this.italicize(false);
    this.underline(false);
    this.strikethrough(false);
    this.color(null);
    this.bgColor(null);
    return this;
  }

  /**
   * Creates a copy of this style instance.
   * @returns New Style instance with identical styling
   */
  clone() {
    const style = new Style();
    if (this._strikethrough) style.strikethrough();
    if (this._weight) style.weight(this._weight === '1' ? 'bright' : 'dim');
    if (this._italicized) style.italicize();
    if (this._underlined) this.underline();
    if (this._color) style.setColor(this._color);
    if (this._bgColor) style.setBgColor(this._bgColor);
    return style;
  }

  /**
   * Sets text color using named colors, 8-bit palette, or RGB values.
   * @param args - Color specification: null (reset), color name, palette index, or RGB values
   * @returns This style instance for chaining
   * @example
   * style.color('Red')           // Named color
   * style.color(196)             // 8-bit palette
   * style.color('255', '0', '0') // RGB values
   * style.color(null)            // Reset color
   */
  color(...args: [null] | [AnsiColorName] | [number] | [string, string, string]): this {
    if (args.length === 1) {
      const [color] = args;

      if (!color) this._color = undefined;
      else this._color = typeof color === 'number' ? `38;5;${color}` : AnsiColors[color];
    } else if (args.length === 3) this._color = `38;2;${args.join(';')}`;
    else throw new Error('Invalid color arguments');
    return this;
  }

  /**
   * Sets background color using named colors, 8-bit palette, or RGB values.
   * @param args - Color specification: null (reset), color name, palette index, or RGB values
   * @returns This style instance for chaining
   */
  bgColor(...args: [null] | [AnsiBgColorName] | [number] | [string, string, string]): this {
    if (args.length === 1) {
      const [bgColor] = args;

      if (!bgColor) this._bgColor = undefined;
      else this._bgColor = typeof bgColor === 'number' ? `48;5;${bgColor}` : AnsiBgColors[bgColor];
    } else if (args.length === 3) this._bgColor = `48;2;${args.join(';')}`;
    else throw new Error('Invalid color arguments');
    return this;
  }

  /**
   * Sets background color using raw ANSI color code.
   * @param text - Raw ANSI background color code
   */
  setBgColor(text: string) {
    this._bgColor = text;
  }

  /**
   * Sets text color using raw ANSI color code.
   * @param text - Raw ANSI color code
   */
  setColor(text: string) {
    this._color = text;
  }

  /**
   * Applies all current styling to the given text.
   * @param text - Text to style
   * @returns Text wrapped with ANSI escape sequences
   */
  apply(text: string): string {
    // Stack styles with ';'
    const styles = [this._weight, this._italicized, this._underlined, this._strikethrough, this._color, this._bgColor]
      .filter(Boolean)
      .join(';');

    // add ansi markings and ship it out the door.
    return `\u001b[${styles}m${text}\u001b[m`;
  }

  /**
   * Checks if text starts with an ANSI style sequence.
   * @param text - Text to check
   * @returns True if text contains ANSI style sequence
   */
  isAnsiStyle(text: string) {
    // biome-ignore lint/suspicious/noControlCharactersInRegex: We're expecting control characters
    return /^(\u001b|\x1b)?\[\d([\d;]+)?m/.test(text);
  }

  /**
   * Interprets ANSI style sequences and updates this style instance accordingly.
   * @param text - Text containing ANSI style sequences
   * @returns Text with ANSI style sequences removed
   */
  interpret(text: string): string {
    if (!this.isAnsiStyle(text)) return text;
    let styles = '';

    // Extract the ansi part from our string
    // biome-ignore lint/suspicious/noControlCharactersInRegex: We're expecting control characters
    [styles, text] = extract(text, /^(\u001b|\x1b)?\[\d[\d;]*m/g);
    if (!styles) return text;

    // remove 'escape' (if present), '[' and 'm'
    // biome-ignore lint/suspicious/noControlCharactersInRegex: We're expecting control characters
    styles = styles.replace(/\u001b|\x1b|\[|m/g, '');

    // Reset All Styles: \u001b[0m (or \u001b[m) (master reset)
    if (!styles || styles === '0') {
      this.reset();
      return text;
    }

    // Extract text or background colours in extende or True format.
    const extracted = extract(styles, /[34]8;[52];\d(;\d;\d)?/);
    if (extracted[0]) {
      if (extracted[0].startsWith('38')) this._color = extracted[0];
      else this._bgColor = extracted[0];
    }

    styles = extracted[1];
    if (!styles) return text;

    // All other codes could be independently delimited by ';'
    // split them by ';' and run them through a switch case that maps the digit to their meaning.
    const codes = styles.split(';');

    codes.forEach(code => {
      const int = new Num(code);
      /*
        Colour	       Text	        Background
        Black	         \u001b[30m	  \u001b[40m
        Red	           \u001b[31m	  \u001b[41m
        Green	         \u001b[32m	  \u001b[42m
        Yellow	       \u001b[33m	  \u001b[43m
        Blue	         \u001b[34m	  \u001b[44m
        Magenta        \u001b[35m   \u001b[45m
        Cyan	         \u001b[36m	  \u001b[46m
        White	         \u001b[37m	  \u001b[47m
        BrightBlack	   \u001b[90m	  \u001b[100m
        BrightRed	     \u001b[91m	  \u001b[101m
        BrightGreen	   \u001b[92m	  \u001b[102m
        BrightYellow	 \u001b[93m	  \u001b[103m
        BrightBlue	   \u001b[94m	  \u001b[104m
        BrightMagenta  \u001b[95m   \u001b[105m
        BrightCyan	   \u001b[96m	  \u001b[106m
        BrightWhite	   \u001b[97m	  \u001b[107m
      */
      if (int.isBetween(30, 37) || int.isBetween(90, 97)) {
        this._color = code;
      } else if (int.isBetween(40, 47) || int.isBetween(100, 107)) {
        this._bgColor = code;

        // Everything between 21 <-> 49 are reset codes for various styles otherwise
      } else if (int.isBetween(21, 49)) {
        switch (code) {
          // \u00[22m => Reset bold / dim text back to normal
          case '22':
            return this.weight('normal');

          // \u00[23m => Reset italics
          case '23':
            return this.italicize(false);

          // \u00[24m => Reset underline
          case '24':
            return this.underline(false);

          // case '25':
          //   return this.blink('normal')
          // case '27':
          //     return this.inverse();

          // \u00[29m => Reset strikethrough
          case '29':
            return this.strikethrough(false);

          // \u001b[39m => reset text colour
          case '39':
            return this.color(null);

          // \u001b[49m => (reset background colour)
          case '49':
            return this.bgColor(null);
        }
      } else {
        switch (code) {
          case '1':
            return this.weight('bright');
          case '2':
            return this.weight('dim');
          case '3':
            return this.italicize();
          case '4':
            return this.underline();
          case '9':
            return this.strikethrough();
        }
      }
    });

    return text;
  }

  /**
   * Creates a new Style instance by interpreting ANSI sequences from text.
   * @param text - Text containing ANSI style sequences
   * @returns New Style instance with interpreted styling
   */
  static fromString(text: string): Style {
    const style = new Style();

    style.interpret(text);

    return style;
  }
}
