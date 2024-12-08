import { createAction } from 'typesafe-actions';
import * as actionTypes from './test-mode.actionType';

export const setTestModeUserEmail = createAction(actionTypes.SET_TEST_MODE_USER_EMAIL, (value: string) => value)();

export const setTestModeUserKeys = createAction(
  actionTypes.SET_TEST_MODE_USER_KEYS,
  (value: { publicAddress: string; privateAddress: string }) => value,
)();

export const setTestModeLoginStatus = createAction(
  actionTypes.SET_TEST_MODE_USER_LOGIN_STATUS,
  (value: boolean) => value,
)();

export const testModeLogout = createAction(actionTypes.TEST_MODE_LOGOUT)();
