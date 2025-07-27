/* c8 ignore next */
import type { IPty } from 'node-pty';
import KEY_MAP from './constants/KEY_MAP.js';

export class Keyboard {
  private pty: IPty;

  constructor(pty: IPty) {
    this.pty = pty;
  }

  type(text: string): void {
    this.pty.write(text);
  }

  press(key: keyof typeof KEY_MAP) {
    return this.type(KEY_MAP[key]);
  }
}
