import { OAuthProviderConfig } from '~/features/oauth/types/oauth-configuration-types';

export const microsoft: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    defaultScopes: ['openid', 'email', 'profile'],
    defaultParams: {
      response_type: 'code',
    },
  },

  accessToken: {
    endpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    contentType: 'application/x-www-form-urlencoded',
    defaultParams: { grant_type: 'authorization_code' },
  },

  userInfo: [{ endpoint: 'https://graph.microsoft.com/oidc/userinfo' }],
};
