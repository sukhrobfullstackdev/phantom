/* eslint-disable prefer-promise-reject-errors */
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService } from '~/app/services/http';

/**
 * Step 1: Create Factor (CRUD Router)
 * POST /v1/auth/user/factor
 * {
 * 	"auth_user_id": "1234",
 * 	"type": "phone_number",
 * 	"value": "+15558675309", // new phone number
 * }
 *
 * -> HTTP RESPONSE 200 : Returns
 * { "factor_id": "xyz" }
 */
interface CreateAuthUserFactorBody {
  auth_user_id: string;
  type: string;
  value: string;
  is_authentication_enabled: true;
}

type CreateAuthUserFactorResponse = MagicAPIResponse<{
  id: string;
}>;

export function createAuthUserFactor(auth_user_id: string, type: string, value: string) {
  const endpoint = `/v1/auth/user/factor`;

  const body: CreateAuthUserFactorBody = {
    auth_user_id,
    type,
    value,
    is_authentication_enabled: true,
  };

  return HttpService.magic.post<CreateAuthUserFactorBody, CreateAuthUserFactorResponse>(endpoint, body);
}

/**
 * Step 2: Issue Challenge + Send Sms
 * POST /v1/auth/user/phone/update/challenge
 * {
 * 	"auth_user_id": "1234",
 * 	"factor_id": "xyz",
 * }
 *
 * -> HTTP RESPONSE 200 : Returns
 * { "attempt_id": "abc" }
 */
interface PhoneUpdateChallengeBody {
  auth_user_id: string;
  factor_id: string;
}

type PhoneUpdateChallengeResponse = MagicAPIResponse<{
  attempt_id: string;
}>;

export function phoneUpdateChallenge(auth_user_id: string, factor_id: string) {
  const endpoint = `/v1/auth/user/phone/update/challenge`;

  const body: PhoneUpdateChallengeBody = {
    auth_user_id,
    factor_id,
  };
  return HttpService.magic.post<PhoneUpdateChallengeBody, PhoneUpdateChallengeResponse>(endpoint, body);
}

/**
 * Step 3: Verify Challenge
 * POST /v1/auth/user/phone/update/verify
 * {
 * 	"auth_user_id": "1234",
 * 	"attempt_id": "abc",
 * 	"code": "6789"
 * }
 *
 * -> HTTP RESPONSE 200
 */
interface PhoneUpdateVerifyBody {
  auth_user_id: string;
  attempt_id: string;
  response: string;
}

type PhoneUpdateVerifyResponse = MagicAPIResponse;

export function phoneUpdateVerify(auth_user_id: string, attempt_id: string, response: string) {
  const endpoint = `/v1/auth/user/phone/update/verify`;

  const body: PhoneUpdateVerifyBody = {
    auth_user_id,
    attempt_id,
    response,
  };
  return HttpService.magic.post<PhoneUpdateVerifyBody, PhoneUpdateVerifyResponse>(endpoint, body);
}
