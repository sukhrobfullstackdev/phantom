import { getOAuthApp } from './get-oauth-app';
import { createOAuthUser } from './create-oauth-user';
import { getOAuthUser } from './get-oauth-user';
import * as oauth1 from './oauth1';

export const OAuthService = {
  getApp: getOAuthApp,
  createUser: createOAuthUser,
  getUser: getOAuthUser,
  oauth1,
};
