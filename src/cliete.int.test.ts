import { execSync } from 'node:child_process';
import { expect } from 'chai';
import Cliete from './index.js';
import { sleep } from './utils/time.js';

describe('Cliete integration tests', () => {
  describe('Default Options', () => {
    afterEach(() => {
      Cliete.clearDefaults();
    });

    it('should use default dimensions when set', async () => {
      Cliete.setDefault('width', 60);
      Cliete.setDefault('height', 20);

      const I = await Cliete.openTerminal('echo "test"');
      await I.wait.for.the.process.to.exit;
    });

    it('should override defaults with provided options', async () => {
      Cliete.setDefault('width', 60);
      Cliete.setDefault('height', 20);

      const I = await Cliete.openTerminal('echo "test"', { width: 80, height: 25 });
      await I.wait.for.the.process.to.exit;
    });

    it('should use built-in defaults after clearDefaults', async () => {
      Cliete.setDefault('width', 100);
      Cliete.setDefault('height', 50);

      Cliete.clearDefaults();

      const I = await Cliete.openTerminal('echo "test"');
      await I.wait.for.the.process.to.exit;
    });

    it('should skip waitForUpdate when timeout is null', async () => {
      Cliete.setDefault('timeout', null);

      const I = await Cliete.openTerminal('echo');
      await I.wait.for.the.process.to.exit;
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
      await I.type('.exit').and.press.enter.and.wait.for.the.process.to.exit;
    });

    it('should work with default options set', async () => {
      Cliete.setDefault('width', 50);
      Cliete.setDefault('height', 25);

      const I = await Cliete.openTerminal('node');

      await I.wait.until.I.see(`Welcome to Node.js ${nodeVersion}.`, 'Type ".help" for more information.', '>');
      await I.type('.exit').and.press.enter.and.wait.for.the.process.to.exit;
    });

    it('should throw an assertion error when we want a non-zero exit code and the process exits cleanly', async () => {
      const I = await Cliete.openTerminal('node --version');

      try {
        await I.wait.for.the.process.to.exit.with.nonZero.exit.code;
        throw new Error('Process exited with a non zero exit code, we need the process to exit cleanly.');
      } catch (err: unknown) {
        expect((err as Error).message).to.equal(
          `Expected process to exit with non-zero code but instead exited with exit code of '0'`,
        );
      }
    });

    it('should NOT throw an assertion error when we want a zero exit code and the process exits cleanly', async () => {
      const I = await Cliete.openTerminal('node --version');

      try {
        await I.wait.for.the.process.to.exit.with.exit.code.zero;
      } catch {
        throw new Error('Process exited with a non zero exit code, we need the process to exit cleanly.');
      }
    });

    it('should throw and assertion error when the process exits with an unexpected error code', async () => {
      const I = await Cliete.openTerminal('node not-a-valid-node-sub-command');

      try {
        await I.wait.for.the.process.to.exit.with.exit.code.of(2);
        throw new Error('Process exited cleanly, we need the process to exit with a non-zero exit code');
      } catch (err: unknown) {
        expect((err as Error).message).to.equal(`Expected process to exit with '2' but instead exited with '1'`);
      }
    });

    it('should throw and assertion error when the process exits with a nonZero exit code and we were expecting a clean exit', async () => {
      const I = await Cliete.openTerminal('node not-a-valid-node-sub-command');

      try {
        await I.wait.for.the.process.to.exit.with.exit.code.zero;
        throw new Error('Process exited cleanly, we need the process to exit with a non-zero exit code');
      } catch (err: unknown) {
        expect((err as Error).message).to.equal(`Expected process to exit with '0' but instead exited with '1'`);
      }
    });

    it('should throw an error if the process does not exit within a custom timeout', async () => {
      const I = await Cliete.openTerminal('node');

      // Process is currently being kept-alive awaiting user input, it will not exit on it's own.
      await I.wait.until.I.see(`Welcome to Node.js ${nodeVersion}.`, 'Type ".help" for more information.', '>');

      // Start a timed assertion.
      const processExitPromise = I.wait.until.the.process.exits.with.timeout.of(2000);

      // In pressing ctrl+c twice exits the repl session
      sleep(3000).then(() => I.press.ctrlC.twice);

      try {
        await processExitPromise;
      } catch (error: unknown) {
        const errMessage = (error as Error).message;
        if (!errMessage.includes('Timeout')) throw new Error(errMessage);
      }

      // test should fail if we get here and timer is still running (we've exited too early)
    });

    it('should NOT throw an error if the process does exit within a custom timeout', async () => {
      const I = await Cliete.openTerminal('node');

      // Process is currently being kept-alive awaiting user input, it will not exit on it's own.
      await I.wait.until.I.see(`Welcome to Node.js ${nodeVersion}.`, 'Type ".help" for more information.', '>');

      // Start a timed assertion.
      const processExitPromise = I.wait.until.the.process.exits.with.timeout.of(2000);

      // In pressing ctrl+c twice exits the repl session
      sleep(1000).then(() => I.press.ctrlC.twice);

      try {
        await processExitPromise;
      } catch (error: unknown) {
        if ((error as Error).message.includes('Timeout'))
          throw new Error('Process failed to exit within the timeout of 3000ms');
      }
    });

    it('should show the full error without truncation on timeout assertions', async () => {
      Cliete.setDefault('width', 50);
      Cliete.setDefault('height', 25);

      const I = await Cliete.openTerminal('node');

      const err = await I.wait.until.I.see("These are not the droids you're looking for").catch(err => err);
      expect(err.message).to.equal(
        `Timeout of 6000ms reached waiting to see\nexpected 'Welcome to Node.js ${nodeVersion}.\nType ".help" for more information.\n>' to equal 'These are not the droids you're looking for'`,
      );
    });

    it('should show the full error without truncation on base assertion see', async () => {
      Cliete.setDefault('width', 50);
      Cliete.setDefault('height', 25);

      const I = await Cliete.openTerminal('node');

      const err = await I.see("These are not the droids you're looking for").catch(err => err);
      expect(err.message).to.equal(
        `expected 'Welcome to Node.js ${nodeVersion}.\nType ".help" for more information.' to equal 'These are not the droids you\'re looking for'`,
      );
    });

    it('should show the full error without truncation on base assertion spot', async () => {
      Cliete.setDefault('width', 50);
      Cliete.setDefault('height', 25);

      const I = await Cliete.openTerminal('node');

      const err = await I.spot('droids').catch(err => err);
      expect(err.message).to.equal(
        `expected 'Welcome to Node.js ${nodeVersion}.\nType ".help" for more information.' to include 'droids'`,
      );
    });

    describe('Until Action Repetition', () => {
      it('should repeat press action until condition is met', async () => {
        const I = await Cliete.openTerminal('node');

        // Wait for initial prompt
        await I.wait.until.I.see(`Welcome to Node.js ${nodeVersion}.`, 'Type ".help" for more information.', '>');

        // Type a command that creates multiple lines of output
        await I.type('console.log("').and.type('A').until.I.spot('AAAAA');
        await I.type('");').and.wait.until.I.spot('console.log("AAAAA");');

        // Wait for output to appear
        await I.press.enter.and.wait.until.I.spot('AAAAA\nundefined\n>');

        await I.type('.exit').and.press.enter.and.wait.for.the.process.to.exit;
      });

      it('should not repeat action when wait is used', async () => {
        const I = await Cliete.openTerminal('node');

        // Wait for initial prompt
        await I.wait.until.I.see(`Welcome to Node.js ${nodeVersion}.`, 'Type ".help" for more information.', '>');

        // Type a command that creates multiple lines of output
        await I.type('console.log("').and.type('A').and.wait.until.I.spot('console.log("A');
        await I.type('");').and.wait.until.I.spot('console.log("A");');

        // Wait for output to appear
        await I.press.enter.and.wait.until.I.spot('A\nundefined\n>');

        await I.type('.exit').and.press.enter.and.wait.for.the.process.to.exit;
      });

      it('should work with type action until condition met', async () => {
        const I = await Cliete.openTerminal('node');

        await I.wait.until.I.see(`Welcome to Node.js ${nodeVersion}.`, 'Type ".help" for more information.', '>');

        // This would be unusual but should work - type repeatedly until we see specific output
        // Using a simple expression that will eventually show the result
        await I.type('1').until.I.spot('1');
        await I.press.backspace.and.type('.exit').and.press.enter.and.wait.for.the.process.to.exit.with.exit.code.zero;
      });
    });
  });
});
