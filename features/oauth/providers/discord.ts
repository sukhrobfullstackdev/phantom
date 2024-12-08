import { OAuthProviderConfig } from '~/features/oauth/types/oauth-configuration-types';

interface DiscordUserResponse {
  id: string;
  username: string;
  discriminator: string;
}

export const discord: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://discord.com/api/oauth2/authorize',
    defaultScopes: ['identify', 'email'],
    defaultParams: { response_type: 'code' },
  },

  accessToken: {
    endpoint: 'https://discord.com/api/v8/oauth2/token',
    contentType: 'application/x-www-form-urlencoded',
    defaultParams: { grant_type: 'authorization_code' },
  },

  userInfo: [
    {
      endpoint: 'https://discord.com/api/users/@me',
      formatResponse: (data: DiscordUserResponse) => ({
        ...data,

        // Discord usernames are not unique, so the user is associated to a
        // `discriminator` value that, when paired with the `username`, is
        // guaranteed to be unique.
        preferred_username: data.username + data.discriminator,
      }),
      remapOpenIDConnectFields: [
        ['id', 'sub'],
        ['avatar', 'profile'],
        ['verified', 'email_verified'],
      ],
    },
  ],
};
