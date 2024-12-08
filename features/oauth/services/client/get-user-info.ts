import qs from 'qs';
import { HttpService } from '~/app/services/http';
import { OpenIDConnectUserInfo } from '~/features/oauth/types/open-id-connect';
import { pickBy } from '~/shared/libs/object-helpers';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

type OAuthGetUserInfoResponse = MagicAPIResponse<OpenIDConnectUserInfo<'camelCase'>>;

export function getUserInfo(provider: string, authorizationToken: string) {
  const endpoint = `/v1/oauth2/user/info/retrieve?${qs.stringify({ provider, field_format: 'camelCase' })}`;
  return HttpService.authRelayer.get<OAuthGetUserInfoResponse>(endpoint, {
    headers: pickBy({
      authorization: `Bearer ${authorizationToken}`,
    }),
  });
}
