import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect } from 'chai';

describe('E2E Tests', () => {
  let tempDir: string;
  let nodeVersion: string;

  before(() => {
    nodeVersion = execSync('node --version').toString().trim();
    tempDir = mkdtempSync(join(tmpdir(), 'cliete-e2e-'));

    // Create package.json
    writeFileSync(
      join(tempDir, 'package.json'),
      JSON.stringify({
        name: 'cliete-e2e-test',
        version: '1.0.0',
        type: 'module',
      }),
    );

    // Build and Link cliete locally
    execSync('npm run build && npm link', { cwd: process.cwd() });
    execSync('npm link cliete', { cwd: tempDir });
  });

  after(() => {
    rmSync(tempDir, { recursive: true, force: true });
    execSync('npm unlink -g cliete', { cwd: process.cwd(), stdio: 'ignore' });
  });

  it('should be able to import and run cliete', async () => {
    // Create test file
    const testCode = `
import Cliete from 'cliete';

const I = await Cliete.openTerminal('node --version', { width: 40, height: 10 });
await I.wait.until.I.spot('${nodeVersion}');
await I.wait.for.the.process.to.exit.with.exit.code.zero;
console.log('E2E test passed!');
`;

    writeFileSync(join(tempDir, 'test.js'), testCode);

    const output = execSync('node test.js', {
      cwd: tempDir,
      encoding: 'utf8',
      timeout: 10000,
    });

    expect(output).to.include('E2E test passed!');
  });
});
