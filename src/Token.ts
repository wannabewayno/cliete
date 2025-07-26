/* c8 ignore next */
import Style from './Style.js';

/**
 * Represents a block of text with associated styling information.
 *
 * When parsing CLI output, tokens preserve both the raw text content
 * and its formatting information separately; you can access clean text for analysis and also reproduce styled output.
 *
 * @example
 * const token = new Token('Error', new Style().color('Red').weight('bright'));
 * console.log(token.raw());    // 'Error'
 * console.log(token.styled()); // '\u001b[31;1mError\u001b[m'
 */
export default class Token {
  /**
   * Creates a new token with text content and optional styling.
   * @param text - The text content of this token
   * @param style - Style information for this token (default: new Style())
   */
  constructor(
    readonly text: string,
    readonly style = new Style(),
  ) {}

  /**
   * Returns the raw text content without any styling applied.
   * @returns Plain text content
   */
  raw(): string {
    return this.text;
  }

  /**
   * Returns the text content with styling applied as ANSI escape sequences.
   * @returns Text wrapped with ANSI escape sequences for styling
   */
  styled(): string {
    return this.style.apply(this.text);
  }
}
