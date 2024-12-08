import assert from 'assert';
import { trim } from '~/app/libs/lodash-utils';

describe('trim function', () => {
  it('should remove whitespace by default', () => {
    assert.strictEqual(trim(' abc '), 'abc');
    assert.strictEqual(trim('  foo  '), 'foo');
    assert.strictEqual(trim('\tbar\t'), 'bar');
  });

  it('should remove specific characters when provided', () => {
    assert.strictEqual(trim('-_-abc-_-', '_-'), 'abc');
    assert.strictEqual(trim('***test***', '*'), 'test');
  });

  it('should work with map function', () => {
    assert.deepStrictEqual(
      [' foo ', ' bar '].map(s => trim(s)),
      ['foo', 'bar'],
    );
  });

  it('should handle empty string', () => {
    assert.strictEqual(trim(''), '');
  });

  it('should handle undefined', () => {
    assert.strictEqual(trim(undefined), '');
  });

  it('should handle null', () => {
    assert.strictEqual(trim(null), '');
  });

  it('should handle string with only trim characters', () => {
    assert.strictEqual(trim('   '), '');
    assert.strictEqual(trim('***', '*'), '');
  });

  it('should not trim characters from the middle of the string', () => {
    assert.strictEqual(trim('a b c'), 'a b c');
    assert.strictEqual(trim('a*b*c', '*'), 'a*b*c');
  });

  it('should handle special characters properly', () => {
    assert.strictEqual(trim('$$abc$$', '$'), 'abc');
    assert.strictEqual(trim('^abc^', '\\^'), 'abc');
  });

  it('should return the original string if no trimming is needed', () => {
    assert.strictEqual(trim('abc'), 'abc');
  });
});
