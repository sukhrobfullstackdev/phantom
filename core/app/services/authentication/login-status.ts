import { HttpService } from '../http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { createJwtWithIframeKP, setDpopHeader } from '~/app/libs/webcrypto/dpop-utils';
import { signIframeUA } from '~/app/libs/webcrypto/ua-sig';

interface LoginStatusBody {
  email: string;
  rom: string; // Temporary login token
  login_flow_context?: string;
}

type LoginStatusResponse = MagicAPIResponse<{
  auth_user_id: string;
  auth_user_session_token: string;
  refresh_token?: string;
}>;

export type LoginStatusOptions = {
  email: string;
  requestOriginMessage: string;
  jwt?: string;
  loginFlowContext?: string;
};

export async function loginStatus({ email, requestOriginMessage, jwt, loginFlowContext }: LoginStatusOptions) {
  const endpoint = '/v1/auth/user/login/email/status';

  const body: LoginStatusBody = {
    email,
    rom: requestOriginMessage,
    login_flow_context: loginFlowContext,
  };

  const headers = {
    headers: {
      ...setDpopHeader(await createJwtWithIframeKP(jwt)),
      'ua-sig': await signIframeUA(),
    },
  };

  const res = await HttpService.magic.post<LoginStatusBody, LoginStatusResponse>(endpoint, body, headers);

  return res;
}
