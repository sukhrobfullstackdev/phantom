import { createAction } from 'typesafe-actions';
import * as actionTypes from './email-otp.actionTypes';
import { JsonRpcRequestPayload } from 'magic-sdk';

export const setOtpEmail = createAction(actionTypes.SET_OTP_EMAIL, (email: string) => email)();
export const setEmailOtpShowUI = createAction(actionTypes.SET_EMAIL_OTP_SHOW_UI, (showUI: boolean) => showUI)();
export const setEmailOTPWhitelabelROM = createAction(
  actionTypes.SET_EMAIL_OTP_WHITELABEL_ROM,
  (emailOTPWhitelabelROM: string) => emailOTPWhitelabelROM,
)();
export const setOtpEmailShowDeviceCheckUI = createAction(
  actionTypes.SET_EMAIL_OTP_SHOW_DEVICE_CHECK_UI,
  (deviceCheckUI: boolean) => deviceCheckUI,
)();
export const setLoginWithEmailOtpPayload = createAction(
  actionTypes.SET_LOGIN_WITH_EMAIL_OTP_PAYLOAD,
  (payload: JsonRpcRequestPayload) => payload,
)();
