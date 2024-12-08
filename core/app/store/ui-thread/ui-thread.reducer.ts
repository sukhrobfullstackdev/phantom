import { ActionType, createReducer } from 'typesafe-actions';
import { JsonRpcRequestPayload } from 'magic-sdk';
import * as UIThreadActions from './ui-thread.actions';
import { ControlFlowError } from '../../libs/exceptions';

interface UIThreadState {
  payload?: JsonRpcRequestPayload;
  error?: ControlFlowError;
  render?: React.FC<any>;
  returnRoutePageId?: string;
  response?: any;
}

type UIThreadActions = ActionType<typeof UIThreadActions>;

const initialState: UIThreadState = {
  payload: undefined,
  error: undefined,
  render: undefined,
  returnRoutePageId: undefined,
  response: undefined,
};

export const UIThread = createReducer<UIThreadState, UIThreadActions>(initialState)
  .handleAction(UIThreadActions.setUIThreadPayload, (state, action) => ({ ...state, payload: action.payload }))
  .handleAction(UIThreadActions.setUIThreadError, (state, action) => ({ ...state, error: action.payload }))
  .handleAction(UIThreadActions.setUIThreadRenderFn, (state, action) => ({ ...state, render: action.payload }))
  .handleAction(UIThreadActions.setReturnRoutePageId, (state, action) => ({
    ...state,
    returnRoutePageId: action.payload,
  }))
  .handleAction(UIThreadActions.setUIThreadResponse, (state, action) => ({ ...state, response: action.payload }));
