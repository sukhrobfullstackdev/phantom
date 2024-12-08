import { ActionType, createReducer } from 'typesafe-actions';
import { createPersistReducer } from '~/app/store/persistence';
import * as LoginWithEmailOtpActions from './email-otp.actions';
import { JsonRpcRequestPayload } from 'magic-sdk';

interface LoginWithEmailOtpState {
  email: string;
  showUI: boolean;
  deviceCheckUI: boolean;
  emailOTPWhitelabelROM: string;
  payload: JsonRpcRequestPayload;
}

type LoginWithEmailOtpActionType = ActionType<typeof LoginWithEmailOtpActions>;

const initialState: LoginWithEmailOtpState = {
  email: '',
  showUI: true,
  deviceCheckUI: true,
  emailOTPWhitelabelROM: '',
  payload: { id: 1, jsonrpc: '2.0', method: '', params: [] },
};

const LoginWithEmailOtpReducers = createReducer<LoginWithEmailOtpState, LoginWithEmailOtpActionType>(initialState)
  .handleAction(LoginWithEmailOtpActions.setOtpEmail, (state, action) => ({
    ...state,
    email: action.payload,
  }))
  .handleAction(LoginWithEmailOtpActions.setOtpEmailShowDeviceCheckUI, (state, action) => ({
    ...state,
    deviceCheckUI: action.payload,
  }))
  .handleAction(LoginWithEmailOtpActions.setEmailOtpShowUI, (state, action) => ({
    ...state,
    showUI: action.payload,
  }))
  .handleAction(LoginWithEmailOtpActions.setLoginWithEmailOtpPayload, (state, action) => ({
    ...state,
    payload: action.payload,
  }))
  .handleAction(LoginWithEmailOtpActions.setEmailOTPWhitelabelROM, (state, action) => ({
    ...state,
    emailOTPWhitelabelROM: action.payload,
  }));

export const LoginWithEmailOtpReducer = createPersistReducer('login_with_email_otp', LoginWithEmailOtpReducers, {
  whitelist: [] as (keyof LoginWithEmailOtpState)[],
});
