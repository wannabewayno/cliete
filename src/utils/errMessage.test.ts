import { expect } from 'chai';
import errMessage from './errMessage.js';

describe('errMessage', () => {
  it('should return empty string when function throws no error', () => {
    const result = errMessage(() => {
      return 'success';
    });

    expect(result).to.equal('');
  });

  it('should return formatted error message when function throws an error', () => {
    const result = errMessage(() => {
      throw new Error('Something went wrong\\nwith multiple lines');
    });

    expect(result).to.equal('Something went wrong\nwith multiple lines');
  });
});
