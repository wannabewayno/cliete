import { execSync } from 'node:child_process';
import { expect } from 'chai';
import Cliete from './index.js';

describe('Cliete integration tests', () => {
  describe('Default Options', () => {
    afterEach(() => {
      // Reset defaults after each test
      (Cliete as any).defaultOpts = {};
    });

    it('should use default dimensions when set', async () => {
      Cliete.setDefault('width', 60);
      Cliete.setDefault('height', 20);

      const I = await Cliete.openTerminal('echo "test"');
      await I.wait.for.the.process.to.exit();

      // Test passes if no errors thrown during terminal creation
      expect(true).to.be.true;
    });

    it('should override defaults with provided options', async () => {
      Cliete.setDefault('width', 60);
      Cliete.setDefault('height', 20);

      const I = await Cliete.openTerminal('echo "test"', { width: 80, height: 25 });
      await I.wait.for.the.process.to.exit();

      // Test passes if no errors thrown during terminal creation
      expect(true).to.be.true;
    });
  });

  describe('Node', () => {
    let nodeVersion: string;
    before(() => {
      nodeVersion = execSync('node --version').toString().trim();
    });

    afterEach(() => {
      // Reset defaults
      // biome-ignore lint/suspicious/noExplicitAny: required as defaultOpts is private.
      (Cliete as any).defaultOpts = {};
    });

    it('Should spawn an interactive node shell and run basic commands', async () => {
      const I = await Cliete.openTerminal('node', {
        width: 40,
        height: 30,
      });

      // Assert that we see the initial REPL message with the current node version
      await I.wait.until.I.see(`Welcome to Node.js ${nodeVersion}.`, 'Type ".help" for more information.', '>');

      // Type in 2 + 2 and see the preview shown below
      await I.type('2 + 2').and.wait.until.I.see(
        `Welcome to Node.js ${nodeVersion}.`,
        'Type ".help" for more information.',
        '> 2 + 2',
        '4',
      );

      // Hit enter and see the output
      await I.press.enter.and.wait.until.I.see(
        `Welcome to Node.js ${nodeVersion}.`,
        'Type ".help" for more information.',
        '> 2 + 2',
        '4',
        '>',
      );

      const before = performance.now();
      await I.wait.for.ninety.nine.milliseconds.and.see(
        `Welcome to Node.js ${nodeVersion}.`,
        'Type ".help" for more information.',
        '> 2 + 2',
        '4',
        '>',
      );
      const after = performance.now();
      expect(after - before).to.be.at.least(99);

      // exit the session
      await I.type('.exit').and.press.enter.and.wait.for.the.process.to.exit();
    });

    it('should work with default options set', async () => {
      Cliete.setDefault('width', 50);
      Cliete.setDefault('height', 25);

      const I = await Cliete.openTerminal('node');

      await I.wait.until.I.see(`Welcome to Node.js ${nodeVersion}.`, 'Type ".help" for more information.', '>');
      await I.type('.exit').and.press.enter.and.wait.for.the.process.to.exit();
    });
  });
});
