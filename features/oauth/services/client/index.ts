import { getAccessToken } from './get-access-token';
import { getUserInfo } from './get-user-info';
import { getOauthApp } from './get-oauth-app';
import { sendCredential } from './send-credential';
import { sendError } from './send-error';
import { verifyOauth } from './verify';

export const OAuthService = {
  getAccessToken,
  verifyOauth,
  getUserInfo,
  getOauthApp,
  sendCredential,
  sendError,
};
