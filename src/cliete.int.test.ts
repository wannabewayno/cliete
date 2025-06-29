import { execSync } from 'node:child_process';
import { expect } from 'chai';
import Cliete from './index.js';

describe('Cliete integration tests', () => {
  describe('Node', () => {
    let nodeVersion: string;
    before(() => {
      nodeVersion = execSync('node --version').toString().trim();
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
  });
});
