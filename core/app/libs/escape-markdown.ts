interface Skipables {
  asterisks?: boolean;
  hashes?: boolean;
  slashes?: boolean;
  parens?: boolean;
  squareBrackets?: boolean;
  angleBrackets?: boolean;
  underscores?: boolean;
}

/**
 * [
 *   tests for character presence,
 *   replacement/escape text,
 *   character type
 * ]
 */
type ReplacementsDefinition = Array<[RegExp, string, keyof Skipables]>;

const replacements: ReplacementsDefinition = [
  [/\*/g, '\\*', 'asterisks'],
  [/#/g, '\\#', 'hashes'],
  [/\//g, '\\/', 'slashes'],
  [/\(/g, '\\(', 'parens'],
  [/\)/g, '\\)', 'parens'],
  [/\[/g, '\\[', 'squareBrackets'],
  [/\]/g, '\\]', 'squareBrackets'],
  [/</g, '&lt;', 'angleBrackets'],
  [/>/g, '&gt;', 'angleBrackets'],
  [/_/g, '\\_', 'underscores'],
];

/**
 * Escapes markdown characters in the given `str`,
 * skipping character types indicated by `skips`.
 *
 * Based on https://github.com/kemitchell/markdown-escape.js (MIT License)
 *
 * Chose to copy implementation rather than maintain dependency because:
 *   1. It's small
 *   2. Wanted TypeScript
 */
/* istanbul ignore next */
export function escapeMarkdown(str: string, skips: Skipables = {}) {
  return replacements.reduce((string, replacement) => {
    const name = replacement[2];
    return name && skips[name] ? string : string.replace(replacement[0], replacement[1]);
  }, str);
}
