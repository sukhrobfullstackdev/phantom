import { OAuthProviderConfig } from '~/features/oauth/types/oauth-configuration-types';

export const google: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    defaultScopes: ['openid', 'email', 'profile'],
    defaultParams: { response_type: 'code', access_type: 'offline' },
  },

  accessToken: {
    endpoint: 'https://oauth2.googleapis.com/token',
    contentType: 'application/json',
    defaultParams: { grant_type: 'authorization_code' },
  },

  getPayloadForUserCreateService: accessTokenRes => {
    const json = JSON.stringify(accessTokenRes);
    return json;
  },

  userInfo: [{ endpoint: 'https://openidconnect.googleapis.com/v1/userinfo' }],
};
