import { createAction } from 'typesafe-actions';
import * as actionTypes from '~/features/recency-check/store/recency.actionTypes';

/* Recency Check */
export const initRecencyCheck = createAction(actionTypes.INIT_RECENCY_CHECK, () => {})();

export const setDestinationAfterVerified = createAction(
  actionTypes.SET_DESTINATION_AFTER_VERIFIED,
  (nextPage: string) => nextPage,
)();
export const setNeedPrimaryFactorVerification = createAction(
  actionTypes.SET_NEED_PRIMARY_FACTOR_VERIFICATION,
  (flag: boolean) => flag,
)();
export const setPrimaryFactorCredential = createAction(
  actionTypes.SET_PRIMARY_FACTOR_CREDENTIAL,
  (credential: string) => credential,
)();

export const setAttemptID = createAction(actionTypes.SET_ATTEMPT_ID, (attemptID: string) => attemptID)();
