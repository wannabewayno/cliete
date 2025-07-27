/** biome-ignore-all lint/suspicious/noExplicitAny: any is used to access private properties of clase instances */
import { expect } from 'chai';
import sinon from 'sinon';
import AsyncAssertions from './AsyncAssertions.js';
import { Screen } from './Screen.js';

describe('AsyncAssertions', () => {
  let mockScreen: sinon.SinonStubbedInstance<Screen>;
  let asyncAssertions: AsyncAssertions;

  beforeEach(() => {
    mockScreen = sinon.createStubInstance(Screen);
    mockScreen.render.returns('test output');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should initialize with screen and options', () => {
      asyncAssertions = new AsyncAssertions(mockScreen as any, { until: 1000 });
      expect(asyncAssertions).to.be.instanceOf(AsyncAssertions);
    });

    it('should accept action in options', () => {
      const action = sinon.stub().resolves();
      asyncAssertions = new AsyncAssertions(mockScreen as any, { until: 1000, action });
      expect(asyncAssertions).to.be.instanceOf(AsyncAssertions);
    });
  });

  describe('action execution during retry', () => {
    it('should execute action before each retry attempt', async () => {
      const action = sinon.stub().resolves();
      let callCount = 0;

      mockScreen.render.callsFake(() => {
        callCount++;
        return callCount < 3 ? 'wrong output' : 'expected output';
      });

      asyncAssertions = new AsyncAssertions(mockScreen as any, { until: 1000, action });

      await asyncAssertions.see('expected output');

      expect(action.callCount).to.be.at.least(2);
    });

    it('should not execute action if no action provided', async () => {
      mockScreen.render.returns('expected output');
      asyncAssertions = new AsyncAssertions(mockScreen as any, { until: 1000 });

      await asyncAssertions.see('expected output');
      // Test passes if no errors thrown
    });

    it('should execute action with spot method', async () => {
      const action = sinon.stub().resolves();
      let callCount = 0;

      mockScreen.render.callsFake(() => {
        callCount++;
        return callCount < 3 ? 'wrong output' : 'target found';
      });

      asyncAssertions = new AsyncAssertions(mockScreen as any, { until: 1000, action });

      await asyncAssertions.spot('target');

      expect(action.callCount).to.be.at.least(2);
    });
  });

  describe('without until option', () => {
    it('should not execute action for immediate assertions', async () => {
      const action = sinon.stub().resolves();
      mockScreen.render.returns('expected output');

      asyncAssertions = new AsyncAssertions(mockScreen as any, { action });

      await asyncAssertions.see('expected output');

      expect(action).to.not.have.been.called;
    });
  });
});
