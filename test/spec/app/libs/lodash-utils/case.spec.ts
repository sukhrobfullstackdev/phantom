import { camelCase, capitalize, lowerCase, upperCase } from '~/app/libs/lodash-utils';

describe('camelCase', () => {
  it('should convert space-separated words to camel case', () => {
    expect(camelCase('Test my Function')).toBe('testMyFunction');
  });

  it('should convert dash-separated words to camel case', () => {
    expect(camelCase('Magic-Link')).toBe('magicLink');
  });

  it('should convert underscores to camel case', () => {
    expect(camelCase('test__my__Function')).toBe('testMyFunction');
  });

  it('should handle multiple separators', () => {
    expect(camelCase('Mixed_Case-and spaces')).toBe('mixedCaseAndSpaces');
  });

  it('should handle leading and trailing spaces', () => {
    expect(camelCase('   extra spaces ')).toBe('extraSpaces');
  });

  it('should return an empty string if the input is empty', () => {
    expect(camelCase('')).toBe('');
  });

  it('should handle numeric characters', () => {
    expect(camelCase('123 456')).toBe('123456');
  });

  it('should return the same string if no change is needed', () => {
    expect(camelCase('noChangeNeeded')).toBe('noChangeNeeded');
  });

  it('converts a simple sentence', () => {
    expect(camelCase('hello world')).toBe('helloWorld');
  });

  it('handles special characters and underscores', () => {
    expect(camelCase('hello-world_foo bar')).toBe('helloWorldFooBar');
  });

  it('handles empty input', () => {
    expect(camelCase('')).toBe('');
  });

  it('handles single-word input', () => {
    expect(camelCase('single')).toBe('single');
  });

  it('handles input with leading/trailing spaces', () => {
    expect(camelCase('  leading and trailing  ')).toBe('leadingAndTrailing');
  });
});

describe('capitalize', () => {
  it('should capitalize the first letter of a lowercase string', () => {
    expect(capitalize('hello')).toBe('Hello');
  });

  it('should capitalize the first letter and lowercase the rest of the string', () => {
    expect(capitalize('hELLO')).toBe('Hello');
  });

  it('should handle an empty string', () => {
    expect(capitalize('')).toBe('');
  });

  it('should handle a string with only one character', () => {
    expect(capitalize('a')).toBe('A');
  });

  it('should handle a string with only one uppercase character', () => {
    expect(capitalize('A')).toBe('A');
  });

  it('should handle a string with special characters', () => {
    expect(capitalize('!hello')).toBe('!hello');
  });

  it('should handle a string with numbers', () => {
    expect(capitalize('1hello')).toBe('1hello');
  });
});

describe('lowerCase', () => {
  it('should convert words with uppercase letters to lowercase', () => {
    expect(lowerCase('HELLO')).toBe('hello');
  });

  it('should convert camelCase words to lowercase with a space', () => {
    expect(lowerCase('helloWorld')).toBe('hello world');
  });

  it('should convert words with symbols to lowercase with spaces', () => {
    expect(lowerCase('___hello-World___')).toBe('hello world');
  });

  it('should convert words with numbers to lowercase with spaces', () => {
    expect(lowerCase('___hello-World___123')).toBe('hello world 123');
  });

  it('should convert alternating words and numbers to lowercase with spaces', () => {
    expect(lowerCase('_123hello456World---789_')).toBe('123 hello 456 world 789');
  });

  it('should handle an empty string', () => {
    expect(lowerCase('')).toBe('');
  });
});

describe('uppercase', () => {
  it('should convert words with lowercase letters to uppercase', () => {
    expect(upperCase('hello')).toBe('HELLO');
  });

  it('should convert camelCase words to uppercase with a space', () => {
    expect(upperCase('helloWorld')).toBe('HELLO WORLD');
  });

  it('should convert words with symbols to uppercase with spaces', () => {
    expect(upperCase('___hello-World___')).toBe('HELLO WORLD');
  });

  it('should convert words with numbers to uppercase with spaces', () => {
    expect(upperCase('___hello-World___123')).toBe('HELLO WORLD 123');
  });

  it('should convert alternating words and numbers to uppercase with spaces', () => {
    expect(upperCase('_123hello456World---789_')).toBe('123 HELLO 456 WORLD 789');
  });

  it('should handle an empty string', () => {
    expect(upperCase('')).toBe('');
  });
});
