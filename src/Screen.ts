import { EventEmitter } from 'node:events';
import { PassThrough, Readable } from 'node:stream';
import type { IPty } from 'node-pty';
import Cursor from './Cursor.js';
import Style from './Style.js';
import Token from './Token.js';
import wrapText from './utils/wrapText.js';

/**
 * Manages CLI process output by maintaining internal state for snapshot testing and recording.
 *
 * When testing CLI applications, you need to capture and analyze stdout/stderr
 * while maintaining proper terminal state (cursor position, styling, screen dimensions).
 * This enables reliable snapshot testing and output verification.
 *
 * @example
 * const screen = new Screen(80, 24);
 * screen.pipe(process.stdout, process.stderr);
 * await screen.waitForUpdate();
 * console.log(screen.render()); // Current screen content
 */
export class Screen {
  private style = new Style();
  private cursor = new Cursor();
  private buffer: Token[][] = [[]];
  private emitter: EventEmitter = new EventEmitter();
  protected combinedStream = new PassThrough();
  private width: number;
  private height: number;

  /**
   * Creates a new screen with specified dimensions.
   * @param width - Screen width in characters
   * @param height - Screen height in lines
   */
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.combinedStream.on('data', data => this.processData(data.toString()));
  }

  /**
   * Processes incoming data from CLI streams, handling line breaks and cursor movement.
   * @param data - Raw string data from stdout/stderr
   */
  private processData(data: string) {
    // break into lines
    const [firstLine = '', ...otherLines] = data.split('\n');

    this.processLine(firstLine);

    // Process each line and apply it's changes
    otherLines.forEach(line => {
      // New line move the cursor down
      this.cursor.down();
      this.processLine(line);
    });

    // finally update the screen
    this.emitter.emit('update');
  }

  /**
   * Processes a single line of output, interpreting ANSI sequences and updating buffer.
   * @param line - Single line of text to process
   */
  private processLine(line: string) {
    // Go through the control commands for each line
    // biome-ignore lint/suspicious/noControlCharactersInRegex: we're interpeting control characters
    const ctrlChars = line.split(/\x1b(\[[\d;]*\w)/);

    ctrlChars.forEach(ctrl => {
      ctrl = this.style.interpret(ctrl);
      ctrl = this.cursor.interpret(ctrl);

      // Ensure a line exists for the current cursor position.
      this.buffer[this.cursor.y] ??= [];

      if (!ctrl) return;

      // interpret the buffer commands
      switch (ctrl) {
        case '[2K': // Clear current line
          // @ts-ignore: covered above with `this.buffer[this.cursor.y] ??= [];`
          this.buffer[this.cursor.y].length = 0;
          break;
        case '[J':
        case '[0J': // Clear from cursor to end of screen
          // Clear current line from cursor to end
          // @ts-ignore: covered above with `this.buffer[this.cursor.y] ??= [];`
          this.buffer[this.cursor.y] = this.buffer[this.cursor.y].slice(0, this.cursor.x);
          // Clear all lines after current
          this.buffer = this.buffer.slice(0, this.cursor.y + 1);
          break;
        case '[1J': // Clear from cursor to beginning of screen
          // Clear all lines before current
          for (let i = 0; i < this.cursor.y; i++) this.buffer[i] = [];

          // Clear current line from beginning to cursor
          // @ts-ignore: covered above with `this.buffer[this.cursor.y] ??= [];`
          this.buffer[this.cursor.y] = this.buffer[this.cursor.y].slice(this.cursor.x);
          break;
        case '[2J': // Clear entire screen
          this.buffer = [[]];
          break;
        default: {
          const token = new Token(ctrl, this.style.clone());
          // @ts-ignore: covered above with `this.buffer[this.cursor.y] ??= [];`
          this.buffer[this.cursor.y].push(token);
        }
      }
    });
  }

  /**
   * Pipes multiple readable streams (stdout/stderr) into this screen.
   * @param streams - Readable streams to monitor
   */
  pipe(...streams: (IPty | Readable)[]) {
    streams.forEach(stream => {
      if (stream instanceof Readable) return stream.pipe(this.combinedStream);
      stream.onData(data => this.combinedStream.write(data));
    });
  }

  /**
   * Gets the internal combined stream for advanced usage.
   * @returns PassThrough stream that receives all piped data
   */
  getCombinedStream() {
    return this.combinedStream;
  }

  /**
   * Renders the current screen content as a string.
   * @returns Current screen content with proper line wrapping
   */
  render(color = false): string {
    const visibleLines = this.buffer.slice(-this.height).map(tokens => {
      const line = tokens.map(token => token[color ? 'styled' : 'raw']()).join('');
      return wrapText(line, this.width);
    });
    return visibleLines.join('\n');
  }

  /**
   * Waits for the next screen update event.
   * @param {number} timeout - Maximum wait time in milliseconds (default: 5000), 0 disables the timeout
   * @returns Promise that resolves on next update
   * @throws Error if timeout is reached
   */
  waitForUpdate(timeout = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer =
        timeout > 0
          ? setTimeout(() => {
              reject(new Error('Screen update timeout'));
            }, timeout)
          : undefined;

      this.emitter.once('update', () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }

  /**
   * Waits for screen to become idle (no updates for specified duration).
   * @param idleDuration - Duration of inactivity to consider idle in milliseconds (default: 100)
   * @param timeout - Maximum wait time in milliseconds (default: 5000)
   * @returns Promise that resolves when screen becomes idle
   * @throws Error if timeout is reached
   */
  async waitForIdle(idleDuration = 100, timeout = 5000): Promise<void> {
    let updateCount = 0;
    this.emitter.on('update', () => updateCount++);

    return new Promise((resolve, reject) => {
      const timeoutTimer = setTimeout(() => {
        reject(new Error(`Screen idle timeout of ${timeout}ms`));
      }, timeout);

      let lastCount = updateCount;

      const checkIdle = () => {
        if (updateCount === lastCount) {
          clearTimeout(timeoutTimer);
          return resolve();
        }

        lastCount = updateCount;
        setTimeout(checkIdle, idleDuration);
      };

      setTimeout(checkIdle, idleDuration);
    });
  }
}
