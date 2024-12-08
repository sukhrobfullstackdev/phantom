import { HttpService } from '../http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { Endpoint } from '~/server/routes/endpoint';

type SessionRefreshResponse = MagicAPIResponse<{
  auth_user_session_token: string;
  auth_user_id: string;
  email: string;
  phone_number: string;
}>;

export function sessionRefresh() {
  return HttpService.authRelayer.get<SessionRefreshResponse>(Endpoint.Session.Refresh);
}
