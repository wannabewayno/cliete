import type { ChildProcess } from 'node:child_process';
import { expect } from 'chai';
import sinon from 'sinon';
import { Keyboard } from './Keyboard.js';

describe('Keyboard', () => {
  let mockProcess: ChildProcess;
  let keyboard: Keyboard;
  let writeStub: sinon.SinonStub;

  beforeEach(() => {
    writeStub = sinon.stub().callsArg(2).returns(true);
    mockProcess = { stdin: { write: writeStub } } as unknown as ChildProcess;
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

      expect(writeStub).to.have.been.calledWith('hello world', 'utf8');
    });

    it('should throw error when stdin is null', async () => {
      mockProcess.stdin = null;

      await expect(keyboard.type('test')).to.be.rejectedWith('Process stdin is closed');
    });

    it('should resolve promise after write completes', async () => {
      writeStub.callsArgAsync(2);

      await keyboard.type('test');
      expect(writeStub).to.have.been.called;
    });
  });

  describe('Keyboard.press()', () => {
    it('should send correct escape sequence for up arrow', async () => {
      await keyboard.press('up');
      expect(writeStub).to.have.been.calledWith('\x1b[A', 'utf8');
    });

    it('should send correct escape sequence for down arrow', async () => {
      await keyboard.press('down');
      expect(writeStub).to.have.been.calledWith('\x1b[B', 'utf8');
    });

    it('should send correct escape sequence for right arrow', async () => {
      await keyboard.press('right');
      expect(writeStub).to.have.been.calledWith('\x1b[C', 'utf8');
    });

    it('should send correct escape sequence for left arrow', async () => {
      await keyboard.press('left');
      expect(writeStub).to.have.been.calledWith('\x1b[D', 'utf8');
    });

    it('should send carriage return for enter', async () => {
      await keyboard.press('enter');
      expect(writeStub).to.have.been.calledWith('\r', 'utf8');
    });

    it('should send tab character', async () => {
      await keyboard.press('tab');
      expect(writeStub).to.have.been.calledWith('\t', 'utf8');
    });

    it('should send backspace character', async () => {
      await keyboard.press('backspace');
      expect(writeStub).to.have.been.calledWith('\x08', 'utf8');
    });

    it('should send escape character', async () => {
      await keyboard.press('escape');
      expect(writeStub).to.have.been.calledWith('\x1b', 'utf8');
    });

    it('should send Ctrl+C character', async () => {
      await keyboard.press('ctrlC');
      expect(writeStub).to.have.been.calledWith('\x03', 'utf8');
    });

    it('should send space character', async () => {
      await keyboard.press('space');
      expect(writeStub).to.have.been.calledWith(' ', 'utf8');
    });
  });
});
