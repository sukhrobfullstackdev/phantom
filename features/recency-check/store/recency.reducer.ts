import { ActionType, createReducer } from 'typesafe-actions';
import * as RecencyActions from './recency.actions';

interface RecencyState {
  destinationAfterVerified?: string;
  primaryFactorCredential?: string;
  needPrimaryFactorVerification: boolean;
  attemptID: string;
}

type RecoveryActions = ActionType<typeof RecencyActions>;

const initialState: RecencyState = {
  destinationAfterVerified: undefined,
  primaryFactorCredential: undefined,
  needPrimaryFactorVerification: false,
  attemptID: '',
};

export const RecencyReducer = createReducer<RecencyState, RecoveryActions>(initialState)
  .handleAction(RecencyActions.initRecencyCheck, (state, action) => ({
    ...initialState,
  }))
  .handleAction(RecencyActions.setDestinationAfterVerified, (state, action) => ({
    ...state,
    destinationAfterVerified: action.payload,
  }))
  .handleAction(RecencyActions.setNeedPrimaryFactorVerification, (state, action) => ({
    ...state,
    needPrimaryFactorVerification: action.payload,
  }))
  .handleAction(RecencyActions.setAttemptID, (state, action) => ({
    ...state,
    attemptID: action.payload,
  }))
  .handleAction(RecencyActions.setPrimaryFactorCredential, (state, action) => ({
    ...state,
    primaryFactorCredential: action.payload,
  }));
