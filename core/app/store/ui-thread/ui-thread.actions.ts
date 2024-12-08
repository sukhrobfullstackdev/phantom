import { JsonRpcRequestPayload } from 'magic-sdk';
import { createAction } from 'typesafe-actions';

import * as actionTypes from './ui-thread.actionTypes';
import { ControlFlowError } from '../../libs/exceptions';

/**
 * Set the currently active JSON RPC payload being processed by the UI thread.
 */
export const setUIThreadPayload = createAction(
  actionTypes.SET_UI_THREAD_PAYLOAD,
  (payload?: JsonRpcRequestPayload) => payload,
)();

/**
 * Set a global error UI thread error.
 */
export const setUIThreadError = createAction(
  actionTypes.SET_UI_THREAD_ERROR,
  (payload?: ControlFlowError) => payload,
)();

/**
 * Set a React render function for the UI thread.
 */
export const setUIThreadRenderFn = createAction(
  actionTypes.SET_UI_THREAD_RENDER_FN,
  (render?: React.FC<any>) => render,
)();

export const setReturnRoutePageId = createAction(actionTypes.SET_RETURN_ROUTE_PAGE_ID, (route: string) => route)();

export const setUIThreadResponse = createAction(actionTypes.SET_UI_THREAD_RESPONSE, (response: any) => response)();
