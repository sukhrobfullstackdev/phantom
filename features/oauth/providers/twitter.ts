import { OAuthProviderConfig } from '~/features/oauth/types/oauth-configuration-types';

interface TwitterAPIError {
  errors: Array<{ code: number; message: string }>;
}

export const legacyTwitter: OAuthProviderConfig = {
  oauthVersion: 1,

  authorization: {
    endpoint: 'https://api.twitter.com/oauth/authorize',
    defaultScopes: ['r_emailaddress', 'r_liteprofile'],
    defaultParams: { response_type: 'code' },
  },

  requestToken: {
    endpoint: 'https://api.twitter.com/oauth/request_token',
  },

  accessToken: {
    endpoint: 'https://api.twitter.com/oauth/access_token',
  },

  signatureMethod: 'HMAC-SHA1',

  formatOAuth1Error: (sourceError?: TwitterAPIError) => {
    return {
      error: String(sourceError?.errors?.[0]?.code),
      errorDescription: sourceError?.errors?.[0]?.message,
    };
  },

  userInfo: [
    {
      endpoint: 'https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true',
      formatResponse: data => {
        return {
          sub: data.id_str,
          name: data.name,
          locale: data.location,
          preferred_username: data.screen_name,
          profile: data.profile_image_url_https,
          email: data.email,
          email_verified: true,
        };
      },
    },
  ],
};

export const twitter: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://twitter.com/i/oauth2/authorize',
    defaultScopes: ['users.read', 'tweet.read'],
    defaultParams: { response_type: 'code' },
  },
};
