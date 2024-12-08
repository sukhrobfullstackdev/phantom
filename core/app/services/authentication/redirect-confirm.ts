import { HttpService } from '../http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

interface RedirectConfirmBody {
  tlt: string; // Temporary login token
  login_flow_context?: string;
}

type RedirectConfirmResponse = MagicAPIResponse<{
  auth_user_id: string;
  ephemeral_auth_user_session_token: string;
  email: string;
}>;

export function redirectConfirm(
  tempLoginToken?: string,
  login_flow_context?: string,
  env: 'testnet' | 'mainnet' = 'testnet',
) {
  const endpoint = `v1/auth/user/login/email/confirm?e=${env}`;

  const body: RedirectConfirmBody = {
    tlt: tempLoginToken ?? '',
    login_flow_context,
  };

  /* [MOCK DATA] */
  /* return Promise.resolve({
    data: {
      auth_user_id: '3LDeve5f56ouY_tN-jLJlop_hkLI1LLTNG8abaCD42E=',
      ephemeral_auth_user_session_token:
        '8a0d966afea745667dde3323217c0d5729bfe45ac6f9c956c539ace44efd96cf.TDqxMEto-e2QYOcEVKdhc5Nl79Y',
      email: 'david.he@magic.link',
    },
    error_code: '',
    message: '',
    status: 'ok',
  } as RedirectConfirmResponse); */

  return HttpService.magic.post<RedirectConfirmBody, RedirectConfirmResponse>(endpoint, body);
}
