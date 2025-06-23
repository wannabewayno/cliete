import type { ChildProcess } from 'node:child_process';
import KEY_MAP from './constants/KEY_MAP.js';

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
