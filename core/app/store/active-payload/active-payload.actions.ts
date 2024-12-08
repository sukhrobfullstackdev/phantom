import { createAction } from 'typesafe-actions';
import * as actionTypes from './active-payload.actionsTypes';
import { JsonRpcRequestPayload } from 'magic-sdk';

export const setActivePayload = createAction(
  actionTypes.SET_ACTIVE_PAYLOAD,
  (activePayload?: Partial<JsonRpcRequestPayload<any>>) => activePayload,
)();

export const resetActivePayload = createAction(actionTypes.RESET_ACTIVE_PAYLOAD, () => {})();
