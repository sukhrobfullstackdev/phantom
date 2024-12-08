import { ActionType, createReducer } from 'typesafe-actions';
import { getApiKey } from '~/app/libs/api-key';
import { createPersistReducer } from '~/app/store/persistence';
import * as LoginWithSmsActions from './login-with-sms.actions';

interface LoginWithSmsState {
  loginWithSmsState?: string;
  phoneNumber?: string;
  rom?: string;
  smsExpiryTime?: number;
  smsRetryGate?: number;
  isCloseButtonEnabled?: boolean;
}

type LoginWithSmsActions = ActionType<typeof LoginWithSmsActions>;

const initialState: LoginWithSmsState = {
  loginWithSmsState: undefined,
  phoneNumber: undefined,
  rom: undefined,
  smsExpiryTime: undefined,
  smsRetryGate: undefined,
  isCloseButtonEnabled: true,
};

const LoginWithSmsReducer = createReducer<LoginWithSmsState, LoginWithSmsActions>(initialState)
  .handleAction(LoginWithSmsActions.setSmsExpiryTime, (state, action) => ({
    ...state,
    smsExpiryTime: action.payload,
  }))
  .handleAction(LoginWithSmsActions.setLoginWithSmsPhoneNumber, (state, action) => ({
    ...state,
    phoneNumber: action.payload,
  }))
  .handleAction(LoginWithSmsActions.setRetryGateTime, (state, action) => ({
    ...state,
    smsRetryGate: action.payload,
  }))
  .handleAction(LoginWithSmsActions.setSmsRom, (state, action) => ({
    ...state,
    rom: action.payload,
  }))
  .handleAction(LoginWithSmsActions.setIsCloseButtonEnabled, (state, action) => ({
    ...state,
    isCloseButtonEnabled: action.payload,
  }));

const apiKey = getApiKey();
export const LoginWithSms = createPersistReducer('login_with_sms', LoginWithSmsReducer, {
  whitelist: ['phoneNumber'] as (keyof LoginWithSmsState)[],
  shouldPersist: !!apiKey,
});
