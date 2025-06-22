import { expect } from 'chai';
import extractAll from './extractAll.js';

describe('extractAll', () => {
  describe('RegExp patterns with global flag', () => {
    it('should extract all error codes and remove them from text', () => {
      const [extracted, modified] = extractAll('Errors: E001, E002, E003 found', /E\d+/g);

      expect(extracted).to.deep.equal(['E001', 'E002', 'E003']);
      expect(modified).to.equal('Errors: , ,  found');
    });

    it('should extract all file paths', () => {
      const [extracted, modified] = extractAll('Files: /path/file1.txt and /path/file2.txt', /\/\S+\.txt/g);

      expect(extracted).to.deep.equal(['/path/file1.txt', '/path/file2.txt']);
      expect(modified).to.equal('Files:  and ');
    });

    it('should return empty array when no matches found', () => {
      const [extracted, modified] = extractAll('Hello world', /\d+/g);

      expect(extracted).to.deep.equal([]);
      expect(modified).to.equal('Hello world');
    });
  });

  describe('RegExp patterns without global flag', () => {
    it('should extract all matches without global flag', () => {
      const [extracted, modified] = extractAll('E001, E002, E003', /E\d+/);

      expect(extracted).to.deep.equal(['E001', 'E002', 'E003']);
      expect(modified).to.equal(', , ');
    });
  });

  describe('string patterns', () => {
    it('should extract all occurrences of literal string', () => {
      const [extracted, modified] = extractAll('test and test again', 'test');

      expect(extracted).to.deep.equal(['test', 'test']);
      expect(modified).to.equal(' and  again');
    });

    it('should return empty array when string not found', () => {
      const [extracted, modified] = extractAll('Hello world', 'xyz');

      expect(extracted).to.deep.equal([]);
      expect(modified).to.equal('Hello world');
    });
  });

  describe('edge cases', () => {
    it('should handle empty input text', () => {
      const [extracted, modified] = extractAll('', /\d+/g);

      expect(extracted).to.deep.equal([]);
      expect(modified).to.equal('');
    });

    it('should handle single match', () => {
      const [extracted, modified] = extractAll('Only E001 here', /E\d+/g);

      expect(extracted).to.deep.equal(['E001']);
      expect(modified).to.equal('Only  here');
    });

    it('should handle consecutive matches', () => {
      const [extracted, modified] = extractAll('E001E002E003', /E\d+/g);

      expect(extracted).to.deep.equal(['E001', 'E002', 'E003']);
      expect(modified).to.equal('');
    });
  });
});
