import { RpcMiddleware } from '../types';

// Actions & Thunks
import { UIThreadThunks } from '~/app/store/ui-thread/ui-thread.thunks';

type StartUIWithParamsMiddleware = RpcMiddleware<[{ showUI: boolean }]>;
type EnsureUIMiddleware = RpcMiddleware;

/**
 * If the contextual payload has a truthy `showUI` parameter,
 * open the UI thread and continue.
 */
const showUIBasedOnParams: StartUIWithParamsMiddleware = async (ctx, next) => {
  const { payload, dispatch, render } = ctx;
  const [{ showUI: shouldShow }] = payload.params!;

  if (shouldShow) {
    await dispatch(UIThreadThunks.acquireLockAndShowUI(payload, render));
  }

  next();
};

/**
 * Open the UI thread and continue, regardless of the payload parameters.
 */
const ensureUI: EnsureUIMiddleware = async (ctx, next) => {
  const { payload, dispatch, render } = ctx;
  await dispatch(UIThreadThunks.acquireLockAndShowUI(payload, render));
  next();
};

export const showUI = Object.assign(showUIBasedOnParams, { force: ensureUI });

/**
 * A predicate for determining if the atomic lock is needed.
 */
export const uiAtomicLockPredicate = payload => {
  const [{ showUI: shouldShow }] = payload.params!;
  return shouldShow;
};
