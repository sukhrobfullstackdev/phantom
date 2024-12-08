import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { JsonRpcRequestPayload } from 'magic-sdk';
import { useHash, usePrevious } from 'usable-react';
import { useDispatch, useSelector } from './redux-hooks';
import { hideOverlay, showOverlay } from '../../store/system/system.actions';
import {
  ControlFlowError,
  ControlFlowErrorCode,
  isControlFlowError,
  isSDKError,
  isServiceError,
  SDKError,
  ServiceError,
} from '../../libs/exceptions';
import { getPayloadEventEmitter, PayloadEvents } from '~/app/rpc/utils';
import { UIThreadThunks } from '../../store/ui-thread/ui-thread.thunks';
import { useControllerContext } from './use-controller';
import { setReturnRoutePageId, setUIThreadError } from '~/app/store/ui-thread/ui-thread.actions';

interface UIThreadActionsContext {
  /**
   * A `boolean` indicating if the UI thread is ready to display.
   */
  showUI: boolean;

  /**
   * A memoized callback that dispatches the `showOverlay` event.
   */
  showOverlay: () => void;

  /**
   * A memoized callback that dispatches the `hideOverlay` event.
   */
  hideOverlay: () => void;
}

const UIThreadActionsContext = createContext({ showUI: false, showOverlay: () => {}, hideOverlay: () => {} });

export const UIThreadActionsProvider: React.FC = props => {
  const { children } = props;

  const [showUI, setShowUI] = useState(false);
  const payload = useSelector(state => state.UIThread.payload);
  const dispatch = useDispatch();

  useEffect(() => {
    if (payload) {
      dispatch(showOverlay());
      setShowUI(true);
    } else {
      setShowUI(false);
    }
  }, [payload]);

  const memoizedShowOverlay = useCallback(() => {
    dispatch(showOverlay());
  }, []);

  const memoizedHideOverlay = useCallback(() => {
    dispatch(hideOverlay());
  }, []);

  const ctx = {
    showUI,
    showOverlay: memoizedShowOverlay,
    hideOverlay: memoizedHideOverlay,
  };

  return <UIThreadActionsContext.Provider value={ctx}>{children}</UIThreadActionsContext.Provider>;
};

/**
 * Provides memoized actions to hide/show the `<iframe>` overlay.
 */
export function useUIThreadActions() {
  return useContext(UIThreadActionsContext);
}

/**
 * Returns the current JSON RPC payload being processed in the UI thread.
 */
export function useUIThreadPayload() {
  const payload = useSelector(state => state.UIThread.payload);
  return payload;
}

export function useUIThreadResponse() {
  return useSelector(state => state.UIThread.response);
}

/**
 * Returns the React render function associated to the current JSON RPC payload
 * being processed in the UI thread.
 */
export function useUIThreadRenderFn() {
  const render = useSelector(state => state.UIThread.render);
  return render;
}

export function useEventOrigin() {
  return useSelector(state => state.System.eventOrigin);
}

/**
 * Returns the previous JSON RPC payload processed in the UI thread.
 */
export function usePreviousUIThreadPayload() {
  const payload = useSelector(state => state.UIThread.payload);
  const prevPayloadFromState = usePrevious(payload);
  const prevPayloadEnsured = useRef<JsonRpcRequestPayload | undefined>();

  useUIThreadResolved(() => {
    prevPayloadEnsured.current = prevPayloadFromState;
  });

  return prevPayloadEnsured.current;
}

/**
 * Execute a React Hooks effect if a UI Thread payload has started processing.
 */
export function useUIThreadOpened(effect: React.EffectCallback, deps: React.DependencyList = []) {
  const payload = useSelector(state => state.UIThread.payload);
  const prevPayload = usePrevious(payload);

  useEffect(() => {
    return !prevPayload && payload ? effect() : undefined;
  }, [payload, ...deps]);
}

/**
 * Execute a React Hooks effect if the UI Thread payload has finished processing
 * the current payload.
 */
export function useUIThreadResolved(effect: React.EffectCallback, deps: React.DependencyList = []) {
  const payload = useSelector(state => state.UIThread.payload);
  const prevPayload = usePrevious(payload);

  useEffect(() => {
    return prevPayload && !payload ? effect() : undefined;
  }, [payload, ...deps]);
}

/**
 * Returns the current, active `ControlFlowErrorCode` from Redux state.
 */
export function useActiveControlFlowErrorCode() {
  return useSelector(state => state.UIThread.error?.code);
}

/**
 * Returns the error message for the active `ControlFlowError` in Redux state.
 */
export function useActiveControlFlowErrorMessage() {
  return useSelector(state => state.UIThread.error?.displayMessage ?? '');
}

/**
 * Returns `true` if any values given in `...codes` matches
 * the active `ControlFlowError` according to Redux state.
 */
export function useAssertActiveControlFlowError(...codes: (ControlFlowErrorCode | undefined)[]) {
  return useSelector(state => codes.includes(state.UIThread.error?.code));
}

/**
 * Creates a callback for dispatching event logic
 * associated with the current UI Thread payload.
 */
export function useEmitUIThreadEvent(event: PayloadEvents) {
  const payload = useUIThreadPayload();

  const emit = useCallback(async () => {
    if (payload) {
      getPayloadEventEmitter(payload).emit(event);
    }
  }, [payload]);

  return emit;
}

/**
 * Returns a memoized callback which, when invoked, closes the current UI thread
 * and resolves/rejects the underlying JSON RPC payload with the result or
 * error value given to the hook.
 */
export function useCloseUIThread<T>(result: T, forceQuit?: boolean): () => Promise<void>;
export function useCloseUIThread(error: ServiceError, forceQuit?: boolean): () => Promise<void>;
export function useCloseUIThread(error: SDKError, forceQuit?: boolean): () => Promise<void>;
export function useCloseUIThread(error: ControlFlowError, forceQuit?: boolean): () => Promise<void>;
export function useCloseUIThread<T>(
  errorOrResult: ServiceError | SDKError | ControlFlowError | T,
  forceQuit = false,
): () => Promise<void> {
  const dispatch = useDispatch();
  const errorOrResultHash = useHash(errorOrResult);
  const returnRoutePageId = useSelector(state => state.UIThread.returnRoutePageId);
  const { navigateTo, resetToDefaultPage } = useControllerContext();

  return useCallback(async () => {
    if (returnRoutePageId) {
      dispatch(setUIThreadError(undefined));
      dispatch(setReturnRoutePageId(''));
      navigateTo(returnRoutePageId);
    } else if (isServiceError(errorOrResult)) {
      await dispatch(UIThreadThunks.releaseLockAndHideUI({ error: errorOrResult.getControlFlowError().getSDKError() }));
      resetToDefaultPage();
    } else if (isControlFlowError(errorOrResult)) {
      await dispatch(UIThreadThunks.releaseLockAndHideUI({ error: errorOrResult.getSDKError() }));
      resetToDefaultPage();
    } else if (isSDKError(errorOrResult)) {
      await dispatch(UIThreadThunks.releaseLockAndHideUI({ error: errorOrResult }));
      resetToDefaultPage();
    } else {
      await dispatch(UIThreadThunks.releaseLockAndHideUI({ result: errorOrResult }));
      resetToDefaultPage();
    }
    if (forceQuit) {
      dispatch(hideOverlay());
    }
  }, [dispatch, errorOrResultHash, returnRoutePageId, navigateTo, resetToDefaultPage]);
}
