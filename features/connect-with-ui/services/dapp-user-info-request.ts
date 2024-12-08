import qs from 'qs';
import { getHeaders } from '~/app/libs/connect-utils';
import { HttpService } from '~/app/services/http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';

interface DappInfoRequestBody {
  auth_user_id: string;
  type: 'email';
  value: string;
  consent_granted: boolean;
}

type DappInfoRequestResponse = MagicAPIResponse;

export function saveDappInfoRequestEmail(auth_user_id: string, email: string) {
  const endpoint = `/v1/connect/user/profile/info/save`;

  const body: DappInfoRequestBody = {
    auth_user_id,
    type: 'email',
    value: email,
    consent_granted: true,
  };

  return HttpService.magic.post<DappInfoRequestBody, DappInfoRequestResponse>(endpoint, body, getHeaders());
}

type GetUserProfileResponse = MagicAPIResponse<{
  consent_granted: boolean;
  date_verified: number;
  value: string;
}>;

export function getUserProfile(auth_user_id: string) {
  const endpoint = `/v1/connect/user/profile/info?${qs.stringify({ auth_user_id, type: 'email' })}`;

  return HttpService.magic.get<GetUserProfileResponse>(endpoint, getHeaders());
}

interface UpdateUserProfileRequestBody {
  auth_user_id: string;
  type: 'email';
  value: string;
  consent_granted: boolean;
}

type UpdateUserProfileResponse = MagicAPIResponse<{}>;

interface UpdateUserProfileParams {
  auth_user_id: string;
  email: string;
  consent_granted: boolean;
  type: 'email';
}

export function updateUserProfile(payload: UpdateUserProfileParams) {
  const endpoint = '/v1/connect/user/profile/info/save';

  const body: DappInfoRequestBody = {
    auth_user_id: payload.auth_user_id,
    type: 'email',
    value: payload.email,
    consent_granted: payload.consent_granted,
  };

  return HttpService.magic.post<UpdateUserProfileRequestBody, UpdateUserProfileResponse>(endpoint, body, getHeaders());
}
interface VerifyUserProfileStartRequestBody {
  auth_user_id: string;
  email: string;
}

type VerifyUserProfileStartResponse = MagicAPIResponse<{
  utc_timestamp_ms: number;
  verify_flow_context: string;
}>;

export function verifyUserProfileFlowStart(auth_user_id: string, email: string) {
  const endpoint = 'v1/connect/user/profile/email/otp/verify/start';

  const body: VerifyUserProfileStartRequestBody = {
    auth_user_id,
    email,
  };

  return HttpService.magic.post<VerifyUserProfileStartRequestBody, VerifyUserProfileStartResponse>(
    endpoint,
    body,
    getHeaders(),
  );
}

interface VerifyUserProfileCompleteRequestBody {
  auth_user_id: string;
  verify_flow_context: string;
  one_time_code: string;
}

type VerifyUserProfileCompleteResponse = MagicAPIResponse<{}>;

export function verifyUserProfileFlowComplete(
  auth_user_id: string,
  verify_flow_context: string,
  one_time_code: string,
) {
  const endpoint = 'v1/connect/user/profile/email/otp/verify/complete';

  const body: VerifyUserProfileCompleteRequestBody = {
    auth_user_id,
    verify_flow_context,
    one_time_code,
  };

  return HttpService.magic.post<VerifyUserProfileCompleteRequestBody, VerifyUserProfileCompleteResponse>(
    endpoint,
    body,
    getHeaders(),
  );
}
