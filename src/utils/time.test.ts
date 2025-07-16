import { expect } from 'chai';
import { adders, sleep, time, timeout, timePlural, timeWithSingular, waitFor } from './time.js';

describe('timePlural', () => {
  it('should calculate time units correctly', () => {
    const mockDone = (value: number) => value;
    const result = timePlural(5, mockDone);

    expect(result.milliseconds).to.equal(5);
    expect(result.seconds).to.equal(5000);
    expect(result.minutes).to.equal(300000);
    expect(result.hours).to.equal(18000000);
  });

  it('should call done callback with correct values', () => {
    let capturedValue = 0;
    const mockDone = (value: number) => {
      capturedValue = value;
      return value;
    };
    const result = timePlural(3, mockDone);

    result.seconds;
    expect(capturedValue).to.equal(3000);
  });
});

describe('adders', () => {
  it('should add numbers correctly to base amount', () => {
    const mockDone = (value: number) => value;
    const result = adders(10, mockDone);

    expect(result.one).to.equal(11);
    expect(result.five).to.equal(15);
    expect(result.nine).to.equal(19);
  });

  it('should test all number getters', () => {
    const mockDone = (value: number) => value;
    const result = adders(20, mockDone);

    expect(result.one).to.equal(21);
    expect(result.two).to.equal(22);
    expect(result.three).to.equal(23);
    expect(result.four).to.equal(24);
    expect(result.five).to.equal(25);
    expect(result.six).to.equal(26);
    expect(result.seven).to.equal(27);
    expect(result.eight).to.equal(28);
    expect(result.nine).to.equal(29);
  });
});

describe('time', () => {
  it('should calculate direct time units', () => {
    const mockDone = (value: number) => value;
    const result = time(2, mockDone);

    expect(result.milliseconds).to.equal(2);
    expect(result.seconds).to.equal(2000);
    expect(result.minutes).to.equal(120000);
    expect(result.hours).to.equal(7200000);
  });

  it('should handle multipliers', () => {
    const mockDone = (value: number) => value;
    const result = time(3, mockDone);

    expect(result.hundred.milliseconds).to.equal(300);
    expect(result.thousand.seconds).to.equal(3000000);
  });
});

describe('timeWithSingular', () => {
  it('should handle singular units with base value 1', () => {
    const mockDone = (value: number) => value;
    const result = timeWithSingular(mockDone);

    expect(result.millisecond).to.equal(1);
    expect(result.second).to.equal(1000);
    expect(result.minute).to.equal(60000);
    expect(result.hour).to.equal(3600000);
  });

  it('should handle multipliers with singular base', () => {
    const mockDone = (value: number) => value;
    const result = timeWithSingular(mockDone);

    expect(result.hundred.milliseconds).to.equal(100);
    expect(result.thousand.seconds).to.equal(1000000);
  });
});

describe('sleep', () => {
  it('should resolve after specified timeout', async () => {
    const start = Date.now();
    await sleep(50);
    const elapsed = Date.now() - start;

    expect(elapsed).to.be.at.least(45);
    expect(elapsed).to.be.at.most(100);
  });
});

describe('timeout', () => {
  it('should resolve when promise completes', async () => {
    const promise = Promise.resolve('success');
    const result = await timeout(promise, 'test', 1000);
    expect(result).to.equal('success');
  });

  it('should throw timeout error', async () => {
    const promise = new Promise(resolve => setTimeout(resolve, 200));

    try {
      await timeout(promise, 'for test operation to complete', 50);
      expect.fail('Should have thrown timeout error');
    } catch (error) {
      expect((error as Error).message).to.include('Timeout of 50ms reached waiting for test operation to complete');
    }
  });

  it('should not set timer for null timeout', async () => {
    const promise = Promise.resolve('success');
    const result = await timeout(promise, 'test', null);
    expect(result).to.equal('success');
  });
});

describe('waitFor', () => {
  it('should infer return type correctly', () => {
    const mockHandler = (_promise: Promise<unknown>) => ({ result: 'test' });
    const result = waitFor({
      the: { test: 'value' },
      and: mockHandler,
    });

    expect(result.the).to.deep.equal({ test: 'value' });
  });

  it('should have all number getters', () => {
    const mockHandler = (_promise: Promise<unknown>) => ({ result: 'test' });
    const result = waitFor({
      the: {},
      and: mockHandler,
    });

    expect(result.one).to.exist;
    expect(result.two).to.exist;
    expect(result.three).to.exist;
    expect(result.four).to.exist;
    expect(result.five).to.exist;
    expect(result.six).to.exist;
    expect(result.seven).to.exist;
    expect(result.eight).to.exist;
    expect(result.nine).to.exist;
    expect(result.ten).to.exist;
    expect(result.eleven).to.exist;
    expect(result.twelve).to.exist;
    expect(result.thirteen).to.exist;
    expect(result.fourteen).to.exist;
    expect(result.fifteen).to.exist;
    expect(result.sixteen).to.exist;
    expect(result.seventeen).to.exist;
    expect(result.eighteen).to.exist;
    expect(result.nineteen).to.exist;
    // ----
    expect(result.twenty).to.exist;
    expect(result.twenty.one).to.exist;
    expect(result.ninety).to.exist;

    expect(result.one.hundred.milliseconds).to.exist;
    expect(result.one.hundred.seconds).to.exist;
    expect(result.one.hundred.minutes).to.exist;
    expect(result.one.hundred.hours).to.exist;

    expect(result.one.thousand.milliseconds).to.exist;
    expect(result.one.thousand.seconds).to.exist;
    expect(result.one.thousand.minutes).to.exist;
    expect(result.one.thousand.hours).to.exist;
    expect(result.one.thousand.and.nine.minutes).to.exist;

    expect(result.one.hundred.and.eight.milliseconds).to.exist;
    expect(result.one.hundred.and.eight.seconds).to.exist;
    expect(result.one.hundred.and.eight.minutes).to.exist;
    expect(result.one.hundred.and.eight.hours).to.exist;

    expect(result.two.hundred.minutes).to.exist;
    expect(result.two.thousand.minutes).to.exist;
    expect(result.two.thousand.and.one.milliseconds).to.exist;
    expect(result.two.thousand.and.one.seconds).to.exist;
    expect(result.two.thousand.and.one.minutes).to.exist;
    expect(result.two.thousand.and.one.hours).to.exist;
  });

  it('should return correct handler result through and property', () => {
    const mockHandler = (_promise: Promise<unknown>) => ({ custom: 'value' });
    const result = waitFor({
      the: {},
      and: mockHandler,
    });

    const timeResult = result.one.second;
    expect(timeResult.and).to.deep.equal({ custom: 'value' });
  });
});
