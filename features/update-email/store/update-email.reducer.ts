import { ActionType, createReducer } from 'typesafe-actions';
import { createPersistReducer } from '~/app/store/persistence';
import * as UpdateEmailActions from './update-email.actions';

interface UpdateEmailState {
  updateEmailStep?: string;
  updateEmailJwt?: string;
  updatedEmail?: string;
  updateEmailRequestId?: string;
  updateEmailFactorId?: string;
  attemptID?: string;
}

type UpdateEmailActions = ActionType<typeof UpdateEmailActions>;

const initialState: UpdateEmailState = {
  updateEmailStep: undefined,
  updateEmailJwt: undefined,
  updatedEmail: undefined,
  updateEmailRequestId: undefined,
  updateEmailFactorId: undefined,
  attemptID: undefined,
};

const UpdateEmailReducer = createReducer<UpdateEmailState, UpdateEmailActions>(initialState)
  .handleAction(UpdateEmailActions.setUpdateEmailStep, (state, action) => ({
    ...state,
    updateEmailStep: action.payload,
  }))
  .handleAction(UpdateEmailActions.setUpdateEmailJwt, (state, action) => ({
    ...state,
    updateEmailJwt: action.payload,
  }))
  .handleAction(UpdateEmailActions.setUpdateEmailRequestId, (state, action) => ({
    ...state,
    updateEmailRequestId: action.payload,
  }))
  .handleAction(UpdateEmailActions.setUpdateEmailFactorId, (state, action) => ({
    ...state,
    updateEmailFactorId: action.payload,
  }))
  .handleAction(UpdateEmailActions.setToBeUpdatedEmail, (state, action) => ({
    ...state,
    updatedEmail: action.payload,
  }))
  .handleAction(UpdateEmailActions.setAttemptID, (state, action) => ({
    ...state,
    attemptID: action.payload,
  }))
  .handleAction(UpdateEmailActions.initUpdateEmailState, () => ({ ...initialState }));

export const UpdateEmail = createPersistReducer('update_email', UpdateEmailReducer);
