import { expect } from 'chai';
import sinon from 'sinon';
import BaseMultiplier from './BaseMultiplier.js';
import Multiplier from './Multiplier.js';

describe('Multiplier', () => {
  let actionSpy: sinon.SinonSpy;
  let fallbackObject: { and: () => 'AND'; until: () => 'UNTIL' };
  let multiplier: Multiplier<() => void, () => void>;

  beforeEach(() => {
    actionSpy = sinon.spy();
    fallbackObject = { and: sinon.spy(), until: sinon.spy() };
    multiplier = new Multiplier(actionSpy, fallbackObject);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('and getter', () => {
    it('should execute action once and return and fallback', () => {
      const result = multiplier.and;

      expect(actionSpy).to.have.been.calledOnce;
      expect(result).to.equal(fallbackObject.and);
    });

    it('should execute action once and return until fallback', () => {
      const result = multiplier.until;

      expect(actionSpy).to.have.been.calledOnce;
      expect(result).to.equal(fallbackObject.until);
    });
  });

  describe('alternative phrasing getters', () => {
    it('should execute action once with once getter', () => {
      multiplier.once;

      expect(actionSpy).to.have.been.calledOnce;
    });

    it('should execute action twice with twice getter', () => {
      multiplier.twice;

      expect(actionSpy).to.have.been.calledTwice;
    });

    it('should execute action three times with thrice getter', () => {
      multiplier.thrice;

      expect(actionSpy).to.have.callCount(3);
    });

    it('should return object with and property for chaining', () => {
      const result = multiplier.twice;

      expect(result).to.equal(fallbackObject);
    });
  });

  describe('teen number getters', () => {
    it('should execute action ten times', () => {
      multiplier.ten;

      expect(actionSpy).to.have.callCount(10);
    });

    it('should execute action eleven times', () => {
      multiplier.eleven;

      expect(actionSpy).to.have.callCount(11);
    });

    it('should execute action twelve times', () => {
      multiplier.twelve;

      expect(actionSpy).to.have.callCount(12);
    });

    it('should execute action thirteen times', () => {
      multiplier.thirteen;

      expect(actionSpy).to.have.callCount(13);
    });

    it('should execute action fourteen times', () => {
      multiplier.fourteen;

      expect(actionSpy).to.have.callCount(14);
    });

    it('should execute action fifteen times', () => {
      multiplier.fifteen;

      expect(actionSpy).to.have.callCount(15);
    });

    it('should execute action sixteen times', () => {
      multiplier.sixteen;

      expect(actionSpy).to.have.callCount(16);
    });

    it('should execute action seventeen times', () => {
      multiplier.seventeen;

      expect(actionSpy).to.have.callCount(17);
    });

    it('should execute action eighteen times', () => {
      multiplier.eighteen;

      expect(actionSpy).to.have.callCount(18);
    });

    it('should execute action nineteen times', () => {
      multiplier.nineteen;

      expect(actionSpy).to.have.callCount(19);
    });
  });

  describe('decade number getters', () => {
    it('should execute action twenty times and return BaseMultiplier', () => {
      const result = multiplier.twenty;

      expect(actionSpy).to.have.callCount(20);
      expect(result).to.be.instanceOf(BaseMultiplier);
    });

    it('should execute action thirty times and return BaseMultiplier', () => {
      const result = multiplier.thirty;

      expect(actionSpy).to.have.callCount(30);
      expect(result).to.be.instanceOf(BaseMultiplier);
    });

    it('should execute action forty times and return BaseMultiplier', () => {
      const result = multiplier.forty;

      expect(actionSpy).to.have.callCount(40);
      expect(result).to.be.instanceOf(BaseMultiplier);
    });

    it('should execute action fifty times and return BaseMultiplier', () => {
      const result = multiplier.fifty;

      expect(actionSpy).to.have.callCount(50);
      expect(result).to.be.instanceOf(BaseMultiplier);
    });

    it('should execute action sixty times and return BaseMultiplier', () => {
      const result = multiplier.sixty;

      expect(actionSpy).to.have.callCount(60);
      expect(result).to.be.instanceOf(BaseMultiplier);
    });

    it('should execute action seventy times and return BaseMultiplier', () => {
      const result = multiplier.seventy;

      expect(actionSpy).to.have.callCount(70);
      expect(result).to.be.instanceOf(BaseMultiplier);
    });

    it('should execute action eighty times and return BaseMultiplier', () => {
      const result = multiplier.eighty;

      expect(actionSpy).to.have.callCount(80);
      expect(result).to.be.instanceOf(BaseMultiplier);
    });

    it('should execute action ninety times and return BaseMultiplier', () => {
      const result = multiplier.ninety;

      expect(actionSpy).to.have.callCount(90);
      expect(result).to.be.instanceOf(BaseMultiplier);
    });

    it('should execute action hundred times and return BaseMultiplier', () => {
      const result = multiplier.hundred;

      expect(actionSpy).to.have.callCount(100);
      expect(result).to.be.instanceOf(BaseMultiplier);
    });
  });

  describe('compound operations', () => {
    it('should support twenty plus additional operations', () => {
      const result = multiplier.twenty.three.times;

      expect(actionSpy).to.have.callCount(23);
      expect(result).to.equal(fallbackObject);
    });

    it('should support fifty plus additional operations', () => {
      const result = multiplier.fifty.five.times;

      expect(actionSpy).to.have.callCount(55);
      expect(result).to.equal(fallbackObject);
    });

    it('should support hundred plus additional operations', () => {
      const result = multiplier.hundred.one.times;

      expect(actionSpy).to.have.callCount(101);
      expect(result).to.equal(fallbackObject);
    });
  });

  describe('inheritance behavior', () => {
    it('should inherit base multiplier functionality', () => {
      multiplier.one.times;

      expect(actionSpy).to.have.been.calledOnce;
    });

    it('should support nth method from base class', () => {
      multiplier.nth(7);

      expect(actionSpy).to.have.callCount(7);
    });
  });
});
