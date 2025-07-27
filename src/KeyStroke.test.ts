import { expect } from 'chai';
import sinon from 'sinon';
import type { Keyboard } from './Keyboard.js';
import KeyStroke from './KeyStroke.js';
import Multiplier from './Multiplier.js';

describe('KeyStroke', () => {
  let mockKeyboard: { press: sinon.SinonStub };
  let fallbackObject: { and: () => 'AND'; until: () => 'UNTIL' };
  let keyStroke: KeyStroke<() => string, () => string>;

  beforeEach(() => {
    mockKeyboard = { press: sinon.stub().resolves() };
    fallbackObject = { and: sinon.spy(), until: sinon.spy() };
    keyStroke = new KeyStroke(mockKeyboard as unknown as Keyboard, fallbackObject);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should initialize with keyboard and fallback', () => {
      expect(keyStroke).to.be.instanceOf(KeyStroke);
    });
  });

  describe('key multiplier getters', () => {
    it('should return Multiplier for enter key', () => {
      const result = keyStroke.enter;

      expect(result).to.be.instanceOf(Multiplier);
    });

    it('should return Multiplier for tab key', () => {
      const result = keyStroke.tab;

      expect(result).to.be.instanceOf(Multiplier);
    });

    it('should return Multiplier for esc key', () => {
      const result = keyStroke.esc;

      expect(result).to.be.instanceOf(Multiplier);
    });

    it('should return Multiplier for backspace key', () => {
      const result = keyStroke.backspace;

      expect(result).to.be.instanceOf(Multiplier);
    });

    it('should return Multiplier for ctrlC key', () => {
      const result = keyStroke.ctrlC;

      expect(result).to.be.instanceOf(Multiplier);
    });

    it('should return Multiplier for up arrow key', () => {
      const result = keyStroke.up;

      expect(result).to.be.instanceOf(Multiplier);
    });

    it('should return Multiplier for down arrow key', () => {
      const result = keyStroke.down;

      expect(result).to.be.instanceOf(Multiplier);
    });

    it('should return Multiplier for left arrow key', () => {
      const result = keyStroke.left;

      expect(result).to.be.instanceOf(Multiplier);
    });

    it('should return Multiplier for right arrow key', () => {
      const result = keyStroke.right;

      expect(result).to.be.instanceOf(Multiplier);
    });
  });

  describe('key press execution', () => {
    it('should execute enter key press', () => {
      keyStroke.enter.once;

      expect(mockKeyboard.press).to.have.been.calledWith('enter');
    });

    it('should execute tab key press', () => {
      keyStroke.tab.once;

      expect(mockKeyboard.press).to.have.been.calledWith('tab');
    });

    it('should execute escape key press', () => {
      keyStroke.esc.once;

      expect(mockKeyboard.press).to.have.been.calledWith('escape');
    });

    it('should execute backspace key press', () => {
      keyStroke.backspace.once;

      expect(mockKeyboard.press).to.have.been.calledWith('backspace');
    });

    it('should execute ctrlC key press', () => {
      keyStroke.ctrlC.once;

      expect(mockKeyboard.press).to.have.been.calledWith('ctrlC');
    });

    it('should execute up arrow key press', () => {
      keyStroke.up.once;

      expect(mockKeyboard.press).to.have.been.calledWith('up');
    });

    it('should execute down arrow key press', () => {
      keyStroke.down.once;

      expect(mockKeyboard.press).to.have.been.calledWith('down');
    });

    it('should execute left arrow key press', () => {
      keyStroke.left.once;

      expect(mockKeyboard.press).to.have.been.calledWith('left');
    });

    it('should execute right arrow key press', () => {
      keyStroke.right.once;

      expect(mockKeyboard.press).to.have.been.calledWith('right');
    });
  });

  describe('natural language chaining', () => {
    it('should support multiple key presses with natural language', () => {
      keyStroke.up.three.times.and();

      expect(mockKeyboard.press).to.have.been.calledWith('up');
      expect(mockKeyboard.press).to.have.callCount(3);
    });
  });

  describe('keystroke tracking via onKeyStroke', () => {
    it('should track promises for key presses', () => {
      const keyStrokeSpy = sinon.spy();
      keyStroke.onKeyStroke(key => keyStrokeSpy(key));

      // Hit enter twice
      keyStroke.enter.twice;
      keyStroke.up.once;
      keyStroke.down.five.times;

      expect(keyStrokeSpy).to.have.callCount(8);
      expect(keyStrokeSpy.calledWith('enter')).to.be.true;
      expect(keyStrokeSpy.calledWith('up')).to.be.true;
      expect(keyStrokeSpy.calledWith('down')).to.be.true;
    });
  });
});
