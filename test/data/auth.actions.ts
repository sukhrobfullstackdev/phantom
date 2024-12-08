export const loginWithMagicLinkActions = [
  { type: 'auth/INIT_AUTH_STATE' },
  { type: 'auth/SET_USER_EMAIL', payload: 'test@magic.link' },
  { type: 'auth/SET_MAGIC_LINK_LOGIN_TYPE', payload: 'ORIGINAL_CONTEXT' },
];

export const loginWithMagicLinkWithRedirectUriActions = [
  { type: 'auth/INIT_AUTH_STATE' },
  { type: 'auth/SET_USER_EMAIL', payload: 'test@magic.link' },
  { type: 'auth/SET_MAGIC_LINK_LOGIN_TYPE', payload: 'REDIRECT' },
];

export const loginWithCredentialActions = ({ mockEmail, mockAuthUserID, mockUST, mockRT }) => [
  { type: 'auth/INIT_AUTH_STATE' },
  { type: 'auth/SET_USER_EMAIL', payload: mockEmail },
  { type: 'auth/SET_USER_ID', payload: mockAuthUserID },
  { type: 'auth/SET_UST', payload: mockUST },
  { type: 'auth/SET_RT', payload: mockRT },
];

export const hydrateActiveUserFromCookiesActions = ({ mockEmail, mockAuthUserID, mockUST }) => [
  { type: 'auth/SET_USER_ID', payload: mockAuthUserID },
  { type: 'auth/SET_UST', payload: mockUST },
  { type: 'auth/SET_USER_EMAIL', payload: mockEmail },
  { type: 'auth/SET_USER_PHONE_NUMBER', payload: undefined },
];

export const hydrateActiveUserFromDPoPActions = ({ mockRefreshToken, mockAuthUserID, mockUST, mockEmail }) => [
  { type: 'auth/SET_USER_ID', payload: mockAuthUserID },
  { type: 'auth/SET_UST', payload: mockUST },
  { type: 'auth/SET_RT', payload: mockRefreshToken },
  { type: 'auth/SET_USER_EMAIL', payload: mockEmail },
  { type: 'auth/SET_USER_PHONE_NUMBER', payload: undefined },
];

export const logoutActions = [
  { type: 'auth/SET_CUSTOM_AUTHORIZATION_JWT' },
  { type: 'auth/INIT_AUTH_STATE' },
  {
    type: 'user/SET_PROFILE_PICTURE_URL',
  },
  {
    type: 'user/SET_AUTH_WALLET',
  },
];
