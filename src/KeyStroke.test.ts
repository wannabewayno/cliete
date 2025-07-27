import { expect } from 'chai';
import sinon from 'sinon';
import type { Keyboard } from './Keyboard.js';
import KeyStroke from './KeyStroke.js';
import Multiplier from './Multiplier.js';

describe('KeyStroke', () => {
  let mockKeyboard: { press: sinon.SinonStub };
  let fallbackObject: { method: () => void };
  let keyStroke: KeyStroke<typeof fallbackObject>;

  beforeEach(() => {
    mockKeyboard = { press: sinon.stub().resolves() };
    fallbackObject = { method: sinon.spy() };
    keyStroke = new KeyStroke(mockKeyboard as unknown as Keyboard, fallbackObject);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should initialize with keyboard and fallback', () => {
      expect(keyStroke).to.be.instanceOf(KeyStroke);
      expect(keyStroke.keyStrokes).to.be.an('array').that.is.empty;
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
      expect(keyStroke.keyStrokes).to.have.length(1);
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
      keyStroke.up.three.times.method();

      expect(mockKeyboard.press).to.have.been.calledWith('up');
      expect(mockKeyboard.press).to.have.callCount(3);
    });
  });

  describe('promise tracking', () => {
    it('should track promises for key presses', () => {
      keyStroke.enter.twice;

      expect(keyStroke.keyStrokes).to.have.length(2);
      expect(keyStroke.keyStrokes[0]).to.be.a('promise');
      expect(keyStroke.keyStrokes[1]).to.be.a('promise');
    });

    it('should accumulate promises across multiple operations', () => {
      keyStroke.up.once;
      keyStroke.down.twice;

      expect(keyStroke.keyStrokes).to.have.length(3);
    });
  });
});
