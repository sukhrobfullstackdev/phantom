import { setDpopHeader } from '~/app/libs/webcrypto/dpop-utils';
import { HttpService } from '~/app/services/http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { OpenIDConnectUserInfo } from '../../types/open-id-connect';
import { MfaFactors } from '~/app/services/authentication/mfa-types';

interface VerifyOauthInput {
  appID: string;
  authorizationCode: string;
  codeVerifier: string;
  redirectURI: string;
  jwt?: string;
}

interface VerifyOauthBody {
  oauth_app_id: string;
  authorization_code: string;
  code_verifier: string;
  redirect_uri: string;
}

type VerifyOauthResponse = MagicAPIResponse<{
  auth_user_id: string;
  auth_user_session_token: string;
  refresh_token?: string;
  login_flow_context?: string;
  factors_required?: MfaFactors;
  oauth_access_token?: string;
  user_info: OpenIDConnectUserInfo<'snake_case'>;
}>;

export function verifyOauth({ appID, authorizationCode, codeVerifier, redirectURI, jwt }: VerifyOauthInput) {
  const endpoint = `/v1/auth/user/login/oauth/verify`;

  const body: VerifyOauthBody = {
    oauth_app_id: appID,
    authorization_code: authorizationCode,
    code_verifier: codeVerifier,
    redirect_uri: redirectURI,
  };

  return HttpService.magic.post<VerifyOauthBody, VerifyOauthResponse>(endpoint, body, {
    headers: {
      ...setDpopHeader(jwt),
    },
  });
}
