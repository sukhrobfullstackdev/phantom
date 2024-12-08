/* eslint-disable prefer-promise-reject-errors */
import { HttpService } from '../http';

interface EmailUpdateStartBody {
  new_email: string;
  auth_user_id: string;
}

export function emailUpdateStart(newEmail: string, authUserId: string) {
  const endpoint = `/v1/auth/user/email/update`;

  const body: EmailUpdateStartBody = {
    new_email: newEmail,
    auth_user_id: authUserId,
  };

  return HttpService.magic.post<EmailUpdateStartBody, any>(endpoint, body);
}

export function emailUpdateStatus(authUserId: string) {
  const endpoint = `/v1/auth/user/email/update/status?auth_user_id=${authUserId}`;
  return HttpService.magic.get<any>(endpoint);
}

interface GenericEmailUpdateBody {
  token: string;
  request_id?: string;
}

export function confirmNewEmail(token: string, e: 'testnet' | 'mainnet') {
  const body: GenericEmailUpdateBody = {
    token,
  };
  const endpoint = `/v1/auth/user/email/update/new/confirm?e=${e}`;
  return HttpService.magic.post<GenericEmailUpdateBody>(endpoint, body);
}

export function confirmCurrentEmail(token: string, e: 'testnet' | 'mainnet') {
  const body: GenericEmailUpdateBody = {
    token,
  };
  const endpoint = `/v1/auth/user/email/update/old/confirm?e=${e}`;
  return HttpService.magic.post<GenericEmailUpdateBody>(endpoint, body);
}

export function resendConfirmEmail(token: string, request_id?: string, e?: 'testnet' | 'mainnet') {
  const body: GenericEmailUpdateBody = {
    token,
    request_id,
  };
  const endpoint = `/v1/auth/user/email/update/resend?e=${e}`;
  return HttpService.magic.post<GenericEmailUpdateBody>(endpoint, body);
}
