import { LoginMethodType } from '~/app/constants/flags';

import {
  setUserID,
  setClientID,
  setUserEmail,
  setUST,
  initAuthState,
  setDelegatedWalletInfo,
  setUserKeys,
  setLoginType,
} from '~/app/store/auth/auth.actions';

test('setUserID', async () => {
  const action = setUserID('user_id');
  expect(action).toEqual({ type: 'auth/SET_USER_ID', payload: 'user_id' });
});

test('setClientID', async () => {
  const action = setClientID('client_id');
  expect(action).toEqual({ type: 'auth/SET_CLIENT_ID', payload: 'client_id' });
});

test('setUserEmail', async () => {
  const action = setUserEmail('hello@magic.link');
  expect(action).toEqual({ type: 'auth/SET_USER_EMAIL', payload: 'hello@magic.link' });
});

test('setUST', async () => {
  const action = setUST('user_session_token');
  expect(action).toEqual({ type: 'auth/SET_UST', payload: 'user_session_token' });
});

test('initAuthState', async () => {
  const action = initAuthState();
  expect(action).toEqual({ type: 'auth/INIT_AUTH_STATE' });
});

test('setDelegatedWalletInfo', async () => {
  const action = setDelegatedWalletInfo({} as any);
  expect(action).toEqual({ type: 'auth/SET_DELEGATED_WALLET_INFO', payload: {} as any });
});

test('setUserKeys', async () => {
  const action = setUserKeys({} as any);
  expect(action).toEqual({ type: 'auth/SET_USER_KEYS', payload: {} as any });
});

test('setLoginType', async () => {
  const action = setLoginType(LoginMethodType.OAuth2);
  expect(action).toEqual({ type: 'auth/SET_LOGIN_TYPE', payload: LoginMethodType.OAuth2 });
});
