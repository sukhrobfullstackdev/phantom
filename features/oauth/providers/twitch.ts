import { OAuthProviderConfig } from '~/features/oauth/types/oauth-configuration-types';

export const twitch: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://id.twitch.tv/oauth2/authorize',
    defaultScopes: ['openid', 'user:read:email'],
    defaultParams: {
      response_type: 'code',
      claims: JSON.stringify({
        userinfo: {
          email: null,
          email_verified: null,
          picture: null,
          preferred_username: null,
        },
      }),
    },
  },

  accessToken: {
    endpoint: 'https://id.twitch.tv/oauth2/token',
    contentType: 'application/json',
    defaultParams: { grant_type: 'authorization_code' },
  },

  userInfo: [{ endpoint: 'https://id.twitch.tv/oauth2/userinfo' }],
};
