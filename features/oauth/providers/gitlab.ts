import { OAuthProviderConfig } from '~/features/oauth/types/oauth-configuration-types';

export const gitlab: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://gitlab.com/oauth/authorize',
    defaultScopes: ['openid', 'profile', 'email'],
    defaultParams: { response_type: 'code' },
  },

  accessToken: {
    endpoint: 'https://gitlab.com/oauth/token',
    contentType: 'application/json',
    defaultParams: { grant_type: 'authorization_code' },
  },

  userInfo: [{ endpoint: 'https://gitlab.com/oauth/userinfo' }],
};
