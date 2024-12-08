import { getHeaders } from '~/app/libs/connect-utils';
import { createRandomString } from '~/app/libs/crypto';
import { MfaInfoData } from '~/app/services/authentication/mfa-types';
import { HttpService } from '~/app/services/http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { ThirdPartyWallet } from '../store/connect.reducer';

export type SupportedWalletTypes = 'ETH';

interface LoginWithWalletStartRequest {
  public_address: string;
  wallet_provider: ThirdPartyWallet;
  wallet_type: SupportedWalletTypes;
  chain_id: number;
}

interface LoginWithWalletStartResponse
  extends MagicAPIResponse<
    {
      auth_user_id: string;
      auth_user_session_token: string;
      refresh_token: string;
    } & MfaInfoData
  > {}

export type { LoginWithWalletStartResponse };

export function thirdPartyWalletLoginFlowStart(
  public_address: string,
  wallet_provider: ThirdPartyWallet,
  wallet_type: SupportedWalletTypes = 'ETH',
  chain_id: number,
) {
  const endpoint = `/v1/connect/user/login/3p_wallet/start`;

  const body: LoginWithWalletStartRequest = {
    public_address,
    wallet_provider,
    wallet_type,
    chain_id,
  };

  return HttpService.magic.post<LoginWithWalletStartRequest, LoginWithWalletStartResponse>(
    endpoint,
    body,
    getHeaders(),
  );
}

interface ThirdPartyWalletLoginFlowChallengeRequest {
  login_flow_context: string;
}

interface ThirdPartyWalletLoginFlowChallengeResponse
  extends MagicAPIResponse<
    {
      auth_user_id: string;
      auth_user_session_token: string;
      refresh_token: string;
    } & MfaInfoData
  > {}

export function thirdPartyWalletLoginFlowChallenge(login_flow_context: string) {
  const endpoint = `/v1/connect/user/login/3p_wallet/challenge`;

  const body: ThirdPartyWalletLoginFlowChallengeRequest = {
    login_flow_context,
  };

  return HttpService.magic.post<ThirdPartyWalletLoginFlowChallengeRequest, ThirdPartyWalletLoginFlowChallengeResponse>(
    endpoint,
    body,
    getHeaders(),
  );
}

interface ThirdPartyWalletLoginFlowVerifyRequest {
  login_flow_context: string;
  message: string;
  message_signature: string;
  request_origin_message: string;
}

interface ThirdPartyWalletLoginFlowVerifyResponse
  extends MagicAPIResponse<
    {
      auth_user_id: string;
      auth_user_session_token: string;
      refresh_token: string;
    } & MfaInfoData
  > {}

export function thirdPartyWalletLoginFlowVerify(
  login_flow_context: string,
  message: string,
  message_signature: string,
  request_origin_message = createRandomString(128),
) {
  const endpoint = `/v1/connect/user/login/3p_wallet/verify`;

  const body: ThirdPartyWalletLoginFlowVerifyRequest = {
    login_flow_context,
    message,
    message_signature,
    request_origin_message,
  };

  return HttpService.magic.post<ThirdPartyWalletLoginFlowVerifyRequest, ThirdPartyWalletLoginFlowVerifyResponse>(
    endpoint,
    body,
    getHeaders(),
  );
}
