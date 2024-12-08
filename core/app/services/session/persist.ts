import { HttpService } from '../http';
import { MagicAPIResponse } from '~/shared/types/magic-api-response';
import { Endpoint } from '~/server/routes/endpoint';

interface SessionPersistBody {
  auth_user_id: string;
  request_origin_message: string; // Temporary login token
}

type SessionPersistResponse = MagicAPIResponse<{}>;

export function sessionPersist(authUserID: string, requestOriginMessage: string) {
  const body: SessionPersistBody = {
    auth_user_id: authUserID,
    request_origin_message: requestOriginMessage,
  };

  return HttpService.authRelayer.post<SessionPersistBody, SessionPersistResponse>(Endpoint.Session.Persist, body);
}
