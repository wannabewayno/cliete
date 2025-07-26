/** biome-ignore-all lint/suspicious/noExplicitAny: test code */
import { expect } from 'chai';
import sinon from 'sinon';
import Cliete from './index.js';
import { Keyboard } from './Keyboard.js';
import KeyStroke from './KeyStroke.js';
import { Screen } from './Screen.js';

describe('Cliete', () => {
  let mockKeyboard: sinon.SinonStubbedInstance<Keyboard>;
  let mockScreen: sinon.SinonStubbedInstance<Screen>;
  let cliete: Cliete;

  beforeEach(() => {
    mockKeyboard = sinon.createStubInstance(Keyboard);
    mockScreen = sinon.createStubInstance(Screen);
    mockKeyboard.type.resolves();
    mockScreen.waitForIdle.resolves();
    mockScreen.render.returns(`Welcome to the CLItest output

This is some text...
  This is some indented text
  - with
  - Bullet
  - Points


--------
`);

    cliete = new Cliete(mockKeyboard as any, mockScreen as any);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('constructor', () => {
    it('should initialize with keyboard and screen', () => {
      expect(cliete).to.be.instanceOf(Cliete);
    });
  });

  describe('press getter', () => {
    it('should return KeyStroke instance', () => {
      const result = cliete.press;

      expect(result).to.be.instanceOf(KeyStroke);
    });

    it('should track keyStroke promises', () => {
      const keyStroke = cliete.press;

      expect(keyStroke.keyStrokes).to.be.an('array');
    });
  });

  describe('type method', () => {
    it('should call keyboard.type with text', () => {
      cliete.type('hello world');

      expect(mockKeyboard.type).to.have.been.calledWith('hello world');
    });

    it('should return object with and property', () => {
      const result = cliete.type('test');

      expect(result).to.have.property('and');
      expect(result.and).to.equal(cliete);
    });
  });

  describe('wait method', () => {
    it('should wait for specified duration', async () => {
      const start = Date.now();
      await cliete.wait.for.one.hundred.milliseconds.and.printScreen();
      const elapsed = Date.now() - start;

      expect(elapsed).to.be.at.least(90);
    });

    it('should return this for chaining', async () => {
      const result = cliete.wait.for.ten.milliseconds.and;

      expect(result).to.equal(cliete);
    });
  });

  describe('see method', () => {
    it('should call screen.render and assert exact match', async () => {
      mockScreen.render.returns('line1\nline2');

      await cliete.see('line1', 'line2');

      expect(mockScreen.render).to.have.been.called;
    });

    it('should throw on mismatch', async () => {
      mockScreen.render.returns('actual output');

      await expect(cliete.see('expected output')).to.be.rejected;
    });

    it('should handle multiple lines', async () => {
      mockScreen.render.returns('line1\nline2\nline3');

      await expect(cliete.see('line1', 'line2', 'line3')).to.be.fulfilled;
    });
  });

  describe('spot method', () => {
    it('should wait for commands and screen idle', async () => {
      mockScreen.render.returns('some text with substring here');

      await cliete.spot('substring');
    });

    it('should assert substring presence', async () => {
      mockScreen.render.returns('this contains the target text');

      await expect(cliete.spot('target')).to.be.fulfilled;
    });

    it('should throw when substring not found', async () => {
      mockScreen.render.returns('this does not contain it');

      await expect(cliete.spot('missing')).to.be.rejected;
    });

    it('should handle regular expression', async () => {
      mockScreen.render.returns('first\nsecond\nthird');

      await expect(cliete.spot(/second/)).to.be.fulfilled;
    });
  });

  describe('Cliete.openTerminal()', () => {
    it('should be a static method that returns a Cliete instance', () => {
      expect(Cliete.openTerminal).to.be.a('function');
    });

    it('should accept command and options parameters', () => {
      expect(Cliete.openTerminal.length).to.equal(1);
    });
  });

  describe('Cliete.setDefault()', () => {
    afterEach(() => {
      Cliete.clearDefaults();
    });

    it('should be a static method', () => {
      expect(Cliete.setDefault).to.be.a('function');
    });

    it('should set width default', () => {
      Cliete.setDefault('width', 120);
      expect((Cliete as any).defaultOpts.width).to.equal(120);
    });

    it('should set height default', () => {
      Cliete.setDefault('height', 50);
      expect((Cliete as any).defaultOpts.height).to.equal(50);
    });

    it('should set cwd default', () => {
      Cliete.setDefault('cwd', '/tmp');
      expect((Cliete as any).defaultOpts.cwd).to.equal('/tmp');
    });

    it('should set env default', () => {
      const testEnv = { TEST: 'value' };
      Cliete.setDefault('env', testEnv);
      expect((Cliete as any).defaultOpts.env).to.equal(testEnv);
    });

    it('should set timeout default', () => {
      Cliete.setDefault('timeout', 1000);
      expect((Cliete as any).defaultOpts.timeout).to.equal(1000);
    });

    it('should set timeout default to null', () => {
      Cliete.setDefault('timeout', null);
      expect((Cliete as any).defaultOpts.timeout).to.be.null;
    });
  });

  describe('Cliete.setDefaults()', () => {
    afterEach(() => {
      Cliete.clearDefaults();
    });

    it('should set multiple defaults at once', () => {
      const result = Cliete.setDefaults({ width: 120, height: 50, timeout: 2000 });

      expect((Cliete as any).defaultOpts).to.deep.equal({ width: 120, height: 50, timeout: 2000 });
      expect(result).to.equal(Cliete);
    });

    it('should replace existing defaults', () => {
      Cliete.setDefault('width', 80);
      Cliete.setDefaults({ height: 30 });

      expect((Cliete as any).defaultOpts).to.deep.equal({ height: 30 });
    });
  });

  describe('Cliete.clearDefaults()', () => {
    afterEach(() => {
      Cliete.clearDefaults();
    });

    it('should be a static method', () => {
      expect(Cliete.clearDefaults).to.be.a('function');
    });

    it('should clear all defaults', () => {
      Cliete.setDefaults({ width: 120, height: 50, cwd: '/tmp', timeout: 1000 });

      Cliete.clearDefaults();

      expect((Cliete as any).defaultOpts).to.deep.equal({});
    });

    it('should reset to empty object after setting defaults', () => {
      Cliete.setDefault('width', 100);
      expect((Cliete as any).defaultOpts.width).to.equal(100);

      Cliete.clearDefaults();
      expect((Cliete as any).defaultOpts.width).to.be.undefined;
      expect((Cliete as any).defaultOpts).to.deep.equal({});
    });
  });

  describe('integration behavior', () => {
    it('should support method chaining', () => {
      const result = cliete.type('hello').and;

      expect(result).to.equal(cliete);
    });

    it('should track multiple promises', () => {
      cliete.type('first');
      cliete.type('second');

      expect(mockKeyboard.type).to.have.been.calledTwice;
    });

    it('should support fluent interface', () => {
      const keyStroke = cliete.press;
      const typeResult = cliete.type('test');

      expect(keyStroke).to.be.instanceOf(KeyStroke);
      expect(typeResult.and).to.equal(cliete);
    });
  });
});
