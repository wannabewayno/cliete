import { expect } from 'chai';
import type { IPty } from 'node-pty';
import sinon from 'sinon';
import { Keyboard } from './Keyboard.js';

describe('Keyboard', () => {
  let mockProcess: IPty;
  let keyboard: Keyboard;
  let writeStub: sinon.SinonStub;

  beforeEach(() => {
    writeStub = sinon.stub();
    mockProcess = { write: writeStub } as unknown as IPty;
    keyboard = new Keyboard(mockProcess);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should initialize with a ChildProcess', () => {
      expect(keyboard).to.be.instanceOf(Keyboard);
    });
  });

  describe('Keyboard.type()', () => {
    it('should write text to process stdin', async () => {
      await keyboard.type('hello world');

      expect(writeStub).to.have.been.calledWith('hello world');
    });
  });

  describe('Keyboard.press()', () => {
    it('should send correct escape sequence for up arrow', async () => {
      await keyboard.press('up');
      expect(writeStub).to.have.been.calledWith('\x1b[A');
    });

    it('should send correct escape sequence for down arrow', async () => {
      await keyboard.press('down');
      expect(writeStub).to.have.been.calledWith('\x1b[B');
    });

    it('should send correct escape sequence for right arrow', async () => {
      await keyboard.press('right');
      expect(writeStub).to.have.been.calledWith('\x1b[C');
    });

    it('should send correct escape sequence for left arrow', async () => {
      await keyboard.press('left');
      expect(writeStub).to.have.been.calledWith('\x1b[D');
    });

    it('should send carriage return for enter', async () => {
      await keyboard.press('enter');
      expect(writeStub).to.have.been.calledWith('\r');
    });

    it('should send tab character', async () => {
      await keyboard.press('tab');
      expect(writeStub).to.have.been.calledWith('\t');
    });

    it('should send backspace character', async () => {
      await keyboard.press('backspace');
      expect(writeStub).to.have.been.calledWith('\x08');
    });

    it('should send escape character', async () => {
      await keyboard.press('escape');
      expect(writeStub).to.have.been.calledWith('\x1b');
    });

    it('should send Ctrl+C character', async () => {
      await keyboard.press('ctrlC');
      expect(writeStub).to.have.been.calledWith('\x03');
    });

    it('should send space character', async () => {
      await keyboard.press('space');
      expect(writeStub).to.have.been.calledWith(' ');
    });
  });
});
