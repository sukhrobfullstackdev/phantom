import { useEffect } from 'react';
import { useDispatch } from './redux-hooks';
import {
  startThemePreviewMessageChannel,
  stopThemePreviewMessageChannel,
  startJsonRpcMessageChannel,
  overlayGreenlight,
  stopJsonRpcMessageChannel,
} from '../../store/system/system.actions';

/**
 * Bootstraps theme preview event listeners inside the React lifecycle.
 */
export function useThemePreviewMessageChannel() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(startThemePreviewMessageChannel());
    return () => {
      dispatch(stopThemePreviewMessageChannel());
    };
  }, []);
}

/**
 * Bootstraps JSON RPC event listeners inside the React lifecycle.
 */
export function useJsonRpcMessageChannel() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(startJsonRpcMessageChannel());
    dispatch(overlayGreenlight());

    return () => {
      dispatch(stopJsonRpcMessageChannel());
    };
  }, []);
}
