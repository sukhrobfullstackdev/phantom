import { getParsedQueryParams } from '~/app/libs/query-params';
import { AbstractOAuthFieldConfig, AbstractOAuthFieldValues } from '../types/oauth-configuration-types';

export function parseOAuthFields<T extends AbstractOAuthFieldConfig>(
  query: string,
  fieldsConfig: T,
): AbstractOAuthFieldValues<T> {
  const parsedQuery: any = getParsedQueryParams(query);
  const result: Record<string, unknown> = {};

  Object.keys(fieldsConfig).forEach(key => {
    const fieldKey = fieldsConfig[key];
    const value = parsedQuery[fieldKey];
    result[key] = value;
  });

  return result as AbstractOAuthFieldValues<T>;
}
