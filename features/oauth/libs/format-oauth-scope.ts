import { isString, trim, uniq } from '~/app/libs/lodash-utils';

/**
 * Consumes OAuth scopes as either a string or array and normalizes the input.
 */
export function normalizeOAuthScope(scopes?: string): string;
export function normalizeOAuthScope(scopes: string[]): string[];
export function normalizeOAuthScope(scopes?: string | string[]): any {
  if (!scopes) return '';

  if (isString(scopes)) {
    return uniq(oauthScopeToArray(scopes as string)).join(' ');
  }

  return uniq((scopes as string[]).map(str => trim((str || '').toString()))).filter(Boolean);
}

/**
 * Consumes OAuth scopes as an array, then outputs as a string.
 */
export function oauthScopeToString(scopes: any[] = []) {
  return uniq((scopes as string[]).map(str => trim((str || '').toString())))
    .filter(Boolean)
    .join(' ');
}

/**
 * Consumes OAuth scopes as a string, then outputs an array.
 */
export function oauthScopeToArray(scopes?: string) {
  const scopesArr = scopes?.split(/\s+/).map(str => trim(str));
  return uniq(scopesArr as string[]).filter(Boolean) ?? [];
}
