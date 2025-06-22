import type { ChildProcess } from 'node:child_process';

// Special key mappings
const KEY_MAP = {
  up: '\x1b[A',
  down: '\x1b[B',
  right: '\x1b[C',
  left: '\x1b[D',
  enter: '\r',
  tab: '\t',
  backspace: '\x08',
  escape: '\x1b',
  ctrlC: '\x03',
  space: ' ',
};

export class Keyboard {
  private process: ChildProcess;

  constructor(process: ChildProcess) {
    this.process = process;
  }

  async type(text: string): Promise<void> {
    if (!this.process.stdin) throw new Error('Process stdin is closed');

    return new Promise<void>(resolve => {
      // biome-ignore lint/style/noNonNullAssertion: Guard clause above.
      this.process.stdin!.write(text, 'utf8', () => resolve());
    });
  }

  press(key: keyof typeof KEY_MAP) {
    return this.type(KEY_MAP[key]);
  }
}
