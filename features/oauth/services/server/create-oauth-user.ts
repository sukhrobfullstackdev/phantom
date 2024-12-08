import { Request } from 'express';
import { MfaInfoData } from '~/app/services/authentication/mfa-types';
import { getReferrerFromHeaders } from '~/server/libs/get-referrer-from-headers';
import { HttpService, withXForwardedFor } from '~/server/services/http';
import { pickBy } from '~/shared/libs/object-helpers';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

interface CreateOAuthUserBody {
  oauth_access_token: string;
  oauth_refresh_token: string;
  oauth_app_id: string; // OAuth client DB reference
  oauth_provider_payload?: {
    provider_name: string;
    payload: any;
  };
  magic_challenge: string;
}

type CreateOAuthUserResponse = MagicAPIResponse<
  {
    auth_user_refresh_token: string;
    auth_user_csrf: string;
    refresh_token_period_in_days: number;
    magic_oauth_request_id: string;
    encrypted_access_token: string;
  } & MfaInfoData
>;

export function createOAuthUser(
  config: {
    accessToken: string;
    refreshToken: string;
    oauthAppDbRef: string;
    oauthProviderPayload?: { provider: string; payload: any };
  },
  req: Request,
) {
  const endpoint = `/internal/oauth/user/create/v1`;

  const body: CreateOAuthUserBody = {
    oauth_access_token: config.accessToken,
    oauth_refresh_token: config.refreshToken,
    oauth_app_id: config.oauthAppDbRef,
    oauth_provider_payload: config.oauthProviderPayload
      ? { provider_name: config.oauthProviderPayload.provider, payload: config.oauthProviderPayload.payload }
      : undefined,
    magic_challenge: req.ext.signedCookies._oaservermeta?.magic_challenge!,
  };

  return HttpService.internalMagic.post<CreateOAuthUserBody, CreateOAuthUserResponse>(endpoint, body, {
    headers: pickBy(
      withXForwardedFor(
        {
          'x-magic-api-key': req.ext.signedCookies._oaservermeta?.magic_api_key,
          'x-magic-trace-id': req.headers['x-magic-trace-id'],
          'accept-language': req.headers['accept-language'],
          'x-magic-referrer': getReferrerFromHeaders(req, req.ext.signedCookies._oaservermeta?.platform),
          'x-magic-bundle-id': req.ext.signedCookies._oaservermeta?.bundleId,
        },
        req,
      ),
    ),
  });
}
