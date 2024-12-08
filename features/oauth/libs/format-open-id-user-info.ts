import { camelCase, get, isString, isNil, set } from '~/app/libs/lodash-utils';
import { OpenIDConnectFields, OpenIDConnectUserInfo } from '../types/open-id-connect';
import { OAuthProviderConfig } from '../types/oauth-configuration-types';

type OAuthProviderUserInfoNode = OAuthProviderConfig['userInfo'][number];

/**
 * Applies any non-standard field associations registered in `remapConfig` to
 * the data structure provided in `sourceUserInfo`.
 */
function standardizeFields(
  sourceUserInfo: Record<string, any>,
  remapConfig: OAuthProviderUserInfoNode['remapOpenIDConnectFields'] = [],
) {
  const result: OpenIDConnectUserInfo<'snake_case' | 'camelCase'> = { ...sourceUserInfo };

  remapConfig.forEach(([getPath, setPath]) => {
    const value = get(sourceUserInfo, getPath);
    if (!isNil(value)) set(result, setPath, value);
  });

  return result;
}

/**
 * Formats the given `sourceUserInfo` with OpenID Connect-compatible fields in
 * either "snake_case" or "camelCase".
 */
export function formatOpenIDConnectUserInfo(
  sourceUserInfo: Record<string, any> = {},
  providerConfig: OAuthProviderUserInfoNode,
  fieldFormat: 'snake_case' | 'camelCase',
) {
  const { endpoint, remapOpenIDConnectFields, formatResponse } = providerConfig;
  const excludeFromSources = endpoint === 'INTERNAL' || !!providerConfig.excludeFromSources;

  const unmodifiedSourceUserInfo = { [endpoint]: { ...sourceUserInfo } };
  const result: OpenIDConnectUserInfo<typeof fieldFormat> = {};

  const formattedUserInfo = formatResponse ? formatResponse(sourceUserInfo) : sourceUserInfo;
  const standardizedUserInfo = standardizeFields(formattedUserInfo, remapOpenIDConnectFields);

  OpenIDConnectFields.forEach(path => {
    const pathSnakeCased = path.match(/([^[.\]])+/g) || [];
    const pathCamelCased = pathSnakeCased.map(part => camelCase(part));

    const getPath = fieldFormat === 'camelCase' ? pathSnakeCased : pathCamelCased;
    const setPath = fieldFormat === 'camelCase' ? pathCamelCased : pathSnakeCased;

    const value = get(standardizedUserInfo, getPath);

    if (!isNil(value) && !(value instanceof Object)) {
      const applyValue = <T>(val: T) => set(result, setPath, val);

      // FYI: `path` is always "snake_case" in this block
      switch (path) {
        case 'updated_at':
          // Format `updated_at` timestamp to Unix epoch (in seconds)
          applyValue(Math.floor(new Date(value).getTime() / 1000));
          break;

        case 'email_verified':
          // Ensure that `email_verified` is of type `boolean`
          applyValue(isString(value) ? value === 'true' : Boolean(value));
          break;

        default:
          // For all other fields, apply the value as-is
          applyValue(value);
      }
    }
  });

  if (!excludeFromSources) result.sources = unmodifiedSourceUserInfo;

  return result;
}
