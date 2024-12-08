import { ActionType, createReducer } from 'typesafe-actions';
import { JsonRpcRequestPayload } from 'magic-sdk';
import * as ActivePayloadActions from './active-payload.actions';

interface ActivePayloadState {
  activePayload?: Partial<JsonRpcRequestPayload<any>>;
}

type ActivePayloadAction = ActionType<typeof ActivePayloadActions>;

const initialState: ActivePayloadState = {
  activePayload: {},
};

export const ActivePayload = createReducer<ActivePayloadState, ActivePayloadAction>(initialState)
  .handleAction(ActivePayloadActions.setActivePayload, (state, action) => ({
    ...state,
    activePayload: action.payload,
  }))
  .handleAction(ActivePayloadActions.resetActivePayload, state => ({
    ...state,
    activePayload: {},
  }));
