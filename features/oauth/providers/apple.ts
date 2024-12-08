import { OAuthProviderConfig } from '~/features/oauth/types/oauth-configuration-types';

export const apple: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://appleid.apple.com/auth/authorize',
    defaultScopes: ['openid', 'email', 'name'],
    defaultParams: { response_type: 'code', response_mode: 'form_post' },
  },

  accessToken: {
    endpoint: 'https://appleid.apple.com/auth/token',
    contentType: 'application/x-www-form-urlencoded',
    defaultParams: { grant_type: 'authorization_code' },
  },

  getPayloadForUserCreateService: accessTokenRes => {
    let user = {} as any;
    if (accessTokenRes.user) {
      user = JSON.parse(accessTokenRes.user);
    }
    const json = JSON.stringify({
      id_token: accessTokenRes.idToken,
      user: {
        given_name: user?.name?.firstName,
        family_name: user?.name?.lastName,
      },
    });
    return json;
  },

  userInfo: [{ endpoint: 'INTERNAL' }],

  useMagicServerCallback: true,
};
