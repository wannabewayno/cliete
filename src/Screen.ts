import { EventEmitter } from 'node:events';
import type Stream from 'node:stream';
import { PassThrough } from 'node:stream';
import Cursor from './Cursor.js';
import KEY_MAP from './constants/KEY_MAP.js';
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
  private currentScreen = '';

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
    this.updateScreen();
  }

  /**
   * Processes a single line of output, interpreting ANSI sequences and updating buffer.
   * @param line - Single line of text to process
   */
  private processLine(line: string) {
    // Go through the control commands for each line
    const ctrlChars = line.split(KEY_MAP.escape);

    ctrlChars.forEach(ctrl => {
      ctrl = this.style.interpret(ctrl);
      ctrl = this.cursor.interpret(ctrl);

      // Ensure a line exists for the current cursor position.
      this.buffer[this.cursor.y] ??= [];

      // interpret the buffer commands
      switch (ctrl) {
        case '[2K':
          // @ts-ignore: covered above with `this.buffer[this.cursor.y] ??= [];`
          this.buffer[this.cursor.y].length = 0;
          break;
        default: {
          if (!ctrl) return;
          const token = new Token(ctrl, this.style.clone());
          // @ts-ignore: covered above with `this.buffer[this.cursor.y] ??= [];`
          this.buffer[this.cursor.y].push(token);
        }
      }
    });
  }

  /**
   * Updates the current screen representation and emits update event.
   */
  private updateScreen() {
    const visibleLines = this.buffer.slice(-this.height).map(tokens => {
      const line = tokens.map(token => token.raw()).join('');
      return wrapText(line, this.width);
    });
    this.currentScreen = visibleLines.join('\n');
    this.emitter.emit('update');
  }

  /**
   * Pipes multiple readable streams (stdout/stderr) into this screen.
   * @param streams - Readable streams to monitor
   */
  pipe(...streams: Stream.Readable[]) {
    streams.forEach(stream => stream.pipe(this.combinedStream));
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
  render(): string {
    return this.currentScreen;
  }

  /**
   * Waits for the next screen update event.
   * @param timeout - Maximum wait time in milliseconds (default: 5000)
   * @returns Promise that resolves on next update
   * @throws Error if timeout is reached
   */
  waitForUpdate(timeout = 5000): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error('Screen update timeout'));
      }, timeout);

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
