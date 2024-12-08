import { OAuthProviderConfig } from '~/features/oauth/types/oauth-configuration-types';

interface GitHubEmailNode {
  email: string;
  verified: boolean;
  primary: boolean;
  visibility: string;
}

export const github: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://github.com/login/oauth/authorize',
    defaultScopes: ['read:user', 'user:email'],
  },

  accessToken: {
    endpoint: 'https://github.com/login/oauth/access_token',
    contentType: 'application/json',
    defaultParams: { grant_type: 'authorization_code' },
  },

  userInfo: [
    {
      endpoint: 'https://api.github.com/user',
      remapOpenIDConnectFields: [
        ['id', 'sub'],
        ['avatar_url', 'picture'],
        ['html_url', 'profile'],
      ],
    },

    {
      endpoint: 'https://api.github.com/user/emails',
      formatResponse: (data: GitHubEmailNode[]) => {
        const node = data.find(item => item.primary);
        return node ? { email: node.email, email_verified: node.verified } : {};
      },
    },
  ],
};
