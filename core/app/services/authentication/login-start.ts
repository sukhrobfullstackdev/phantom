import { HttpService } from '../http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { MfaInfoData } from './mfa-types';
import { createJwtWithIframeKP, setDpopHeader } from '~/app/libs/webcrypto/dpop-utils';
import { signIframeUA } from '~/app/libs/webcrypto/ua-sig';

interface LoginStartBody {
  email: string;
  request_origin_message: string;
  redirect_url?: string;
  app_name?: string;
  asset_uri?: string;
  overrides?: {
    variation?: string;
  };
}

type LoginStartResponse = MagicAPIResponse<
  {
    one_time_passcode: string;
  } & MfaInfoData
>;
interface UserVoiceCustomThemeConfig {
  appName?: string | null;
  logoURL?: string | null;
}

export async function loginStart(
  email: string,
  requestOriginMessage: string,
  redirectURL?: string,
  jwt?: string,
  customTheme?: UserVoiceCustomThemeConfig,
  overrides?: {
    variation?: string;
  },
) {
  const endpoint = `v2/auth/user/login/email/start`;

  const body: LoginStartBody = {
    email,
    request_origin_message: requestOriginMessage,
    redirect_url: redirectURL,
    app_name: customTheme?.appName ?? undefined,
    asset_uri: customTheme?.logoURL ?? undefined,
    ...(overrides && { overrides }),
  };

  const headers = {
    headers: {
      ...setDpopHeader(await createJwtWithIframeKP(jwt)),
      'ua-sig': await signIframeUA(),
    },
  };

  const res = await HttpService.magic.post<LoginStartBody, LoginStartResponse>(endpoint, body, headers);

  return res;
}
