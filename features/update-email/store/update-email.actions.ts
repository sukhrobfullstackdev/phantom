import { createAction } from 'typesafe-actions';
import * as actionTypes from './update-email.actionTypes';

export const setUpdateEmailStep = createAction(
  actionTypes.SET_UPDATE_EMAIL_STEP,
  (updateEmailStep?: string) => updateEmailStep,
)();

export const setUpdateEmailJwt = createAction(
  actionTypes.SET_UPDATE_EMAIL_JWT,
  (updateEmailJwt?: string) => updateEmailJwt,
)();

export const setUpdateEmailRequestId = createAction(
  actionTypes.SET_UPDATE_REQUEST_ID,
  (updateEmailRequestId?: string) => updateEmailRequestId,
)();

export const setUpdateEmailFactorId = createAction(
  actionTypes.SET_UPDATE_EMAIL_FACTOR_ID,
  (updateEmailRequestId?: string) => updateEmailRequestId,
)();

export const setToBeUpdatedEmail = createAction(actionTypes.SET_UPDATED_EMAIL, (updateEmail?: string) => updateEmail)();

export const setAttemptID = createAction(actionTypes.SET_ATTEMPT_ID, (attemptID: string) => attemptID)();

export const initUpdateEmailState = createAction(actionTypes.INIT_UPDATE_EMAIL_STATE)();
