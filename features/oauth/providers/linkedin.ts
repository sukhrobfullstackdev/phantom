import { get } from '~/app/libs/lodash-utils';
import { OAuthProviderConfig } from '~/features/oauth/types/oauth-configuration-types';

export const linkedin: OAuthProviderConfig = {
  oauthVersion: 2,

  authorization: {
    endpoint: 'https://www.linkedin.com/oauth/v2/authorization',
    defaultScopes: ['r_emailaddress', 'r_liteprofile'],
    defaultParams: { response_type: 'code' },
  },

  accessToken: {
    endpoint: 'https://www.linkedin.com/oauth/v2/accessToken',
    contentType: 'application/x-www-form-urlencoded',
    defaultParams: { grant_type: 'authorization_code' },
  },

  userInfo: [
    {
      endpoint: 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
      formatResponse: data => ({
        email: get(data, 'elements[0].handle~.emailAddress'),
        email_verified: true,
      }),
    },
    {
      endpoint: 'https://api.linkedin.com/v2/me',
      remapOpenIDConnectFields: [
        ['id', 'sub'],
        ['localizedFirstName', 'given_name'],
        ['localizedLastName', 'family_name'],
      ],
    },
    {
      endpoint: 'https://api.linkedin.com/v2/me?projection=(profilePicture(displayImage~:playableStreams))',
      remapOpenIDConnectFields: [['profilePicture.displayImage~.elements[0].identifiers[0].identifier', 'profile']],
    },
  ],
};
