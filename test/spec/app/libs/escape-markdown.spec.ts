import { escapeMarkdown } from '~/app/libs/escape-markdown';

test('Returns escaped astericks', () => {
  expect(escapeMarkdown('hello * world')).toBe('hello \\* world');
});

test('Returns escaped hashes', () => {
  expect(escapeMarkdown('# hello world')).toBe('\\# hello world');
});

test('Returns escaped slashes', () => {
  expect(escapeMarkdown('hello world /')).toBe('hello world \\/');
});

test('Returns escaped opening parens', () => {
  expect(escapeMarkdown('hello (( world')).toBe('hello \\(\\( world');
});

test('Returns escaped closing parens', () => {
  expect(escapeMarkdown('hello ) world')).toBe('hello \\) world');
});

test('Returns escaped opening square brackets', () => {
  expect(escapeMarkdown('[[ hello world')).toBe('\\[\\[ hello world');
});

test('Returns escaped closing square brackets', () => {
  expect(escapeMarkdown('hello world ]]')).toBe('hello world \\]\\]');
});

test('Returns escaped opening angle brackets', () => {
  expect(escapeMarkdown('hello < world')).toBe('hello &lt; world');
});

test('Returns escaped closing angle brackets', () => {
  expect(escapeMarkdown('hello > world')).toBe('hello &gt; world');
});

test('Returns escaped underscores', () => {
  expect(escapeMarkdown('hello _ world')).toBe('hello \\_ world');
});
