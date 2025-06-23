import { expect } from 'chai';
import sinon from 'sinon';
import BaseMultiplier from './BaseMultiplier.js';

describe('BaseMultiplier', () => {
  let actionSpy: sinon.SinonSpy;
  let fallbackObject: { method: () => void };
  let multiplier: BaseMultiplier<typeof fallbackObject>;

  beforeEach(() => {
    actionSpy = sinon.spy();
    fallbackObject = { method: sinon.spy() };
    multiplier = new BaseMultiplier(actionSpy, fallbackObject);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should initialize with action and fallback', () => {
      expect(multiplier).to.be.instanceOf(BaseMultiplier);
    });
  });

  describe('nth method', () => {
    it('should execute action once by default', () => {
      multiplier.nth();

      expect(actionSpy).to.have.been.calledOnce;
    });

    it('should execute action specified number of times', () => {
      multiplier.nth(5);

      expect(actionSpy).to.have.callCount(5);
    });

    it('should return object with and property', () => {
      const result = multiplier.nth(2);

      expect(result).to.have.property('and');
      expect(result.and).to.equal(fallbackObject);
    });

    it('should handle zero executions', () => {
      multiplier.nth(0);

      expect(actionSpy).to.not.have.been.called;
    });
  });

  describe('natural language getters', () => {
    it('should execute action once with one getter', () => {
      multiplier.one.times;

      expect(actionSpy).to.have.been.calledOnce;
    });

    it('should execute action twice with two getter', () => {
      multiplier.two.times;

      expect(actionSpy).to.have.been.calledTwice;
    });

    it('should execute action three times with three getter', () => {
      multiplier.three.times;

      expect(actionSpy).to.have.callCount(3);
    });

    it('should execute action four times with four getter', () => {
      multiplier.four.times;

      expect(actionSpy).to.have.callCount(4);
    });

    it('should execute action five times with five getter', () => {
      multiplier.five.times;

      expect(actionSpy).to.have.callCount(5);
    });

    it('should execute action six times with six getter', () => {
      multiplier.six.times;

      expect(actionSpy).to.have.callCount(6);
    });

    it('should execute action seven times with seven getter', () => {
      multiplier.seven.times;

      expect(actionSpy).to.have.callCount(7);
    });

    it('should execute action eight times with eight getter', () => {
      multiplier.eight.times;

      expect(actionSpy).to.have.callCount(8);
    });

    it('should execute action nine times with nine getter', () => {
      multiplier.nine.times;

      expect(actionSpy).to.have.callCount(9);
    });
  });

  describe('chaining behavior', () => {
    it('should return times object with and property', () => {
      const result = multiplier.three;

      expect(result).to.have.property('times');
      expect(result.times).to.have.property('and');
      expect(result.times.and).to.equal(fallbackObject);
    });

    it('should support fluent chaining', () => {
      const result = multiplier.two.times.and;

      expect(result).to.equal(fallbackObject);
      expect(actionSpy).to.have.been.calledTwice;
    });
  });

  describe('action execution', () => {
    it('should execute action with correct context', () => {
      const contextAction = sinon.spy();
      const contextMultiplier = new BaseMultiplier(contextAction, {});

      contextMultiplier.three.times;

      expect(contextAction).to.have.callCount(3);
    });

    it('should handle action that returns values', () => {
      let counter = 0;
      const countingAction = () => ++counter;
      const countingMultiplier = new BaseMultiplier(countingAction, {});

      countingMultiplier.four.times;

      expect(counter).to.equal(4);
    });

    it('should handle action that throws errors', () => {
      const errorAction = () => {
        throw new Error('test error');
      };
      const errorMultiplier = new BaseMultiplier(errorAction, {});

      expect(() => errorMultiplier.two.times).to.throw('test error');
    });
  });
});
