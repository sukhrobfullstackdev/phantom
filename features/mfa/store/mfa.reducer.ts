import { ActionType, createReducer } from 'typesafe-actions';
import { createPersistReducer } from '~/app/store/persistence';
import * as MfaActions from './mfa.actions';

interface MfaState {
  mfaEnrollData?: MfaEnrollData;
  recoveryCodes?: Array<string>;
}

export type MfaEnrollData = {
  secret: string;
  info: string;
};

type MfaActions = ActionType<typeof MfaActions>;

const initialState: MfaState = {
  mfaEnrollData: undefined,
  recoveryCodes: undefined,
};

const MfaReducer = createReducer<MfaState, MfaActions>(initialState)
  .handleAction(MfaActions.setEnableFlowMfaData, (state, action) => ({
    ...state,
    mfaEnrollData: action.payload,
  }))
  .handleAction(MfaActions.setRecoveryCodes, (state, action) => ({
    ...state,
    recoveryCodes: action.payload,
  }));

export const Mfa = createPersistReducer('mfa', MfaReducer);
