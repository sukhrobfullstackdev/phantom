import { createAction } from 'typesafe-actions';
import * as actionTypes from './mfa.actionTypes';
import { MfaEnrollData } from './mfa.reducer';

export const setEnableFlowMfaData = createAction(
  actionTypes.SET_ENABLE_FLOW_MFA_DATA,
  (data?: MfaEnrollData) => data,
)();

export const setRecoveryCodes = createAction(actionTypes.SET_RECOVERY_CODES, (codes: Array<string>) => codes)();
