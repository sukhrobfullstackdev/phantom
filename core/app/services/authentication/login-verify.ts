import { HttpService } from '../http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
// import { mockApiReject } from '~/app/libs/api-response-helper';

interface LoginVerifyBody {
  tlt: string; // Temporary login token
  one_time_passcode?: string;
}

type LoginVerifyResponse = MagicAPIResponse;

export function loginVerify(tempLoginToken?: string, env: 'testnet' | 'mainnet' = 'testnet', otp?: string) {
  const endpoint = `v2/auth/user/login/verify?e=${env}`;

  const body: LoginVerifyBody = {
    tlt: tempLoginToken ?? '',
    one_time_passcode: otp,
  };

  // return mockApiReject('ANOMALOUS_REQUEST_DETECTED', 'something');
  return HttpService.magic.post<LoginVerifyBody, LoginVerifyResponse>(endpoint, body);
}
