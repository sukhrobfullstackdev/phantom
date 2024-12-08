/* eslint-disable prefer-promise-reject-errors */
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { HttpService } from '~/app/services/http';
import { AuthUserFactorResponseType } from '~/features/recency-check/services/verifyPrimaryFactorService';

/**
 * Step 1: create a new primary email factor
 * @param auth_user_id
 * @param factor_id
 * @param credential
 */
interface CreateAuthUserFactorForNewEmailBody {
  auth_user_id: string;
  type: 'email_address';
  value: string;
  is_authenticated_enabled: true;
}

type CreateAuthUserFactorForNewEmailResponse = MagicAPIResponse<AuthUserFactorResponseType>;

export function createAuthUserFactorForNewEmail(auth_user_id: string, value: string) {
  const endpoint = `/v1/auth/user/factor`;

  const body: CreateAuthUserFactorForNewEmailBody = {
    auth_user_id,
    type: 'email_address',
    value,
    is_authenticated_enabled: true,
  };
  return HttpService.magic.post<CreateAuthUserFactorForNewEmailBody, CreateAuthUserFactorForNewEmailResponse>(
    endpoint,
    body,
  );
}

/**
 * Step 2: Issue Challenge + Send Sms
 * POST /v1/auth/user/email/update/challenge
 * {
 * 	"auth_user_id": "1234",
 * 	"factor_id": "xyz",
 * }
 *
 * -> HTTP RESPONSE 200 : Returns
 * { "attempt_id": "abc" }
 */
interface EmailUpdateChallengeBody {
  auth_user_id: string;
  factor_id: string;
  credential: string;
}

type EmailUpdateChallengeResponse = MagicAPIResponse<{
  attempt_id: string;
}>;

export function emailUpdateChallenge(auth_user_id: string, factor_id: string, credential: string) {
  const endpoint = `/v1/auth/user/email/update/challenge`;

  const body: EmailUpdateChallengeBody = {
    auth_user_id,
    factor_id,
    credential,
  };
  return HttpService.magic.post<EmailUpdateChallengeBody, EmailUpdateChallengeResponse>(endpoint, body);
}

/**
 * Step 3: Verify Challenge
 * POST /v1/auth/user/email/update/verify
 * {
 * 	"auth_user_id": "1234",
 * 	"attempt_id": "abc",
 * 	"code": "6789"
 * }
 *
 * -> HTTP RESPONSE 200
 */
interface EmailUpdateVerifyBody {
  auth_user_id: string;
  attempt_id: string;
  response: string;
}

type EmailUpdateVerifyResponse = MagicAPIResponse<{
  factor_id: string;
}>;

export function emailUpdateVerify(auth_user_id: string, attempt_id: string, response: string) {
  const endpoint = `/v1/auth/user/email/update/verify`;

  const body: EmailUpdateVerifyBody = {
    auth_user_id,
    attempt_id,
    response,
  };
  return HttpService.magic.post<EmailUpdateVerifyBody, EmailUpdateVerifyResponse>(endpoint, body);
}
