import { OAuthProviderConfig } from '~/features/oauth/types/oauth-configuration-types';
import { find } from '~/app/libs/lodash-utils';

export const bitbucket: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://bitbucket.org/site/oauth2/authorize',
    defaultScopes: [],
    defaultParams: { response_type: 'code' },
  },

  accessToken: {
    endpoint: 'https://bitbucket.org/site/oauth2/access_token',
    contentType: 'application/x-www-form-urlencoded',
    defaultParams: { grant_type: 'authorization_code' },
  },

  userInfo: [
    {
      endpoint: 'https://api.bitbucket.org/2.0/user',
      remapOpenIDConnectFields: [
        ['account_id', 'sub'],
        ['display_name', 'name'],
        ['nickname', 'nickname'],
        ['username', 'preferred_username'],
        ['links.avatar.href', 'profile'],
      ],
    },
    {
      endpoint: 'https://api.bitbucket.org/2.0/user/emails',
      formatResponse: data => {
        const value = find(data.values, item => item.is_primary === true);
        return {
          email: value.email,
          email_verified: value.is_confirmed,
        };
      },
    },
  ],
};
