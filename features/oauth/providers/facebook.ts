import { OAuthProviderConfig } from '~/features/oauth/types/oauth-configuration-types';

export const facebook: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://www.facebook.com/v8.0/dialog/oauth',
    defaultScopes: ['email'],
    defaultParams: { response_type: 'code' },
  },

  accessToken: {
    endpoint: 'https://graph.facebook.com/v8.0/oauth/access_token',
    contentType: 'application/json',
    defaultParams: { grant_type: 'authorization_code' },
  },

  userInfo: [
    {
      endpoint:
        'https://graph.facebook.com/me?fields=id,name,first_name,middle_name,last_name,email,address,link,picture',
      formatResponse: userInfo => ({ ...userInfo, email_verified: true }),
      remapOpenIDConnectFields: [
        ['id', 'sub'],
        ['first_name', 'given_name'],
        ['last_name', 'family_name'],
        ['address', 'address.formatted'],
        ['link', 'profile'],
      ],
    },
  ],
};
