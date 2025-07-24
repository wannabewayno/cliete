import { execSync } from 'node:child_process';
import { expect } from 'chai';
import Cliete from './index.js';

describe('Cliete integration tests', () => {
  describe('Default Options', () => {
    afterEach(() => {
      Cliete.clearDefaults();
    });

    it('should use default dimensions when set', async () => {
      Cliete.setDefault('width', 60);
      Cliete.setDefault('height', 20);

      const I = await Cliete.openTerminal('echo "test"');
      await I.wait.for.the.process.to.exit();
    });

    it('should override defaults with provided options', async () => {
      Cliete.setDefault('width', 60);
      Cliete.setDefault('height', 20);

      const I = await Cliete.openTerminal('echo "test"', { width: 80, height: 25 });
      await I.wait.for.the.process.to.exit();
    });

    it('should use built-in defaults after clearDefaults', async () => {
      Cliete.setDefault('width', 100);
      Cliete.setDefault('height', 50);

      Cliete.clearDefaults();

      const I = await Cliete.openTerminal('echo "test"');
      await I.wait.for.the.process.to.exit();
    });

    it('should skip waitForUpdate when timeout is null', async () => {
      Cliete.setDefault('timeout', null);

      const I = await Cliete.openTerminal('echo');
      await I.wait.for.the.process.to.exit();
    });
  });

  describe('Node', () => {
    let nodeVersion: string;
    before(() => {
      nodeVersion = execSync('node --version').toString().trim();
    });

    afterEach(() => {
      Cliete.clearDefaults();
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

    it('should show the full error without truncation on timeout assertions', async () => {
      Cliete.setDefault('width', 50);
      Cliete.setDefault('height', 25);

      const I = await Cliete.openTerminal('node');

      const err = await I.wait.until.I.see("These are not the droids you're looking for").catch(err => err);
      expect(err.message).to.equal(
        `Timeout of 6000ms reached waiting to see\nexpected 'Welcome to Node.js ${nodeVersion}.\\nType ".help" for more information.\\n>' to equal 'These are not the droids you\\'re looking for'`,
      );
    });
  });
});
