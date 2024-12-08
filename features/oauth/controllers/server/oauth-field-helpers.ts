import qs from 'qs';
import { isString } from '~/app/libs/lodash-utils';
import { AbstractOAuthFieldValues, AbstractOAuthFieldConfig } from '~/features/oauth/types/oauth-configuration-types';
import { oauthScopeToString } from '~/features/oauth/libs/format-oauth-scope';

/**
 * Generically parses a query string (or pre-parsed dictionary value) and
 * returns the requisite values conforming to the given `fieldsConfig` spec.
 */
export function parseOAuthFields<T extends AbstractOAuthFieldConfig>(
  source: string | {},
  fieldsConfig: T,
): AbstractOAuthFieldValues<T> {
  const parsedQuery: any = isString(source) ? qs.parse(source) : source;

  const result: any = {};

  Object.keys(fieldsConfig).forEach(key => {
    const fieldKey = fieldsConfig[key];
    const value = parsedQuery[fieldKey];
    result[key] = value;
  });

  return result as AbstractOAuthFieldValues<T>;
}

/**
 * Formats OAuth request fields as a dictionary of values conforming to the
 * given `fieldsConfig` spec.
 */
export function formatOAuthFields<T extends AbstractOAuthFieldConfig>(
  fieldsConfig: T,
  values: AbstractOAuthFieldValues<T>,
  defaultParams: Record<string, string> = {},
) {
  const result = {};

  Object.keys(fieldsConfig).forEach(key => {
    const fieldKey = fieldsConfig[key];
    const value = values[key];
    result[fieldKey] = Array.isArray(value) ? oauthScopeToString(value) : value;
  });

  return { ...result, ...defaultParams };
}
