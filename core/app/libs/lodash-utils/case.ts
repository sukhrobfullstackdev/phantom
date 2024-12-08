/**
 * Replace symbols and camel-case with spaces
 * @param str  The string to normalize
 * @returns  The normalized string
 */
export default function normalize(str: string): string {
  return str
    .replace(/([^a-zA-Z0-9]+|\s+)/g, ' ')
    .replace(/([A-Z][a-z])/g, ' $1')
    .replace(/([a-z](?=\d)|\d(?=[a-z]))/g, '$1 ')
    .replace(/\s\s+/g, ' ')
    .trim();
}

/**
 * Camel-case a string
 * @param str  The string to camel-case
 * @returns  The camel-cased string
 */
export function camelCase(str: string): string {
  // If the input string is already in camel case, return it
  if (/^[a-z][a-zA-Z0-9]*$/.test(str)) {
    return str;
  }

  // Trim leading and trailing spaces and then split the input by non-word characters or underscores
  const words = str.trim().split(/[\s\W_]+/);

  const camelCasedWords = words.map((word, index) => {
    // Convert the first word to lowercase only if it's not an empty string
    if (index === 0 && word !== '') {
      return word.toLowerCase();
    }
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  const camelCasedString = camelCasedWords.join('');

  return camelCasedString;
}

/**
 * Capitalize the first letter of a string
 * @param str  The string to capitalize
 * @returns  The capitalized string
 */
export function capitalize(str: string): string {
  return `${str.charAt(0).toUpperCase()}${str.slice(1).toLowerCase()}`;
}

/**
 * Normalize and lowercase string
 * @param str  The string to lowercase
 * @returns  The lowercase string
 */
export function lowerCase(str: string): string {
  return normalize(str).toLowerCase();
}

/**
 * Normalize and uppercase string
 * @param str  The string to uppercase
 * @returns  The uppercase string
 */
export function upperCase(str: string): string {
  return normalize(str).toUpperCase();
}
