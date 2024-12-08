import { createAction } from 'typesafe-actions';
import * as actionTypes from './login-with-sms.actionTypes';

export const setSmsExpiryTime = createAction(
  actionTypes.SET_SMS_VERIFY_EXPIRY_TIME,
  (smsExpiryTime?: number) => smsExpiryTime,
)();

export const setRetryGateTime = createAction(
  actionTypes.SET_RETRY_GATE_TIME,
  (smsExpiryTime?: number) => smsExpiryTime,
)();

export const setLoginWithSmsPhoneNumber = createAction(
  actionTypes.SET_LOGIN_WITH_SMS_PHONE_NUMBER,
  (phoneNumber?: string) => phoneNumber,
)();

export const setIsCloseButtonEnabled = createAction(
  actionTypes.SET_IS_CLOSE_BUTTON_ENABLED,
  (newState: boolean) => newState,
)();

export const setSmsRom = createAction(actionTypes.SET_SMS_ROM, (rom?: string) => rom)();
