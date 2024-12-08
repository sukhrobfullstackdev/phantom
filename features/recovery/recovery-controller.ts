import { recoveryStore } from './store';
import { RpcMiddleware } from '~/app/rpc/types';
import { initRecoveryState, setPrimaryFactorToRecover } from '~/features/recovery/store/recovery.actions';
import { checkIfUserIsLoggedIn, rejectNoRecoveryMethod } from '~/features/recovery/store/recovery.thunks';

type recoveryFlowParams = [{ email: string }];
type recoveryFlowContext = {};
type recoveryFlowMiddleware = RpcMiddleware<recoveryFlowParams, recoveryFlowContext>;

export const marshallRecoverAccountParams: recoveryFlowMiddleware = async (ctx, next) => {
  await recoveryStore.ready;
  recoveryStore.dispatch(initRecoveryState());
  recoveryStore.dispatch(setPrimaryFactorToRecover(ctx.payload.params?.[0].email.trim() ?? ''));
  await recoveryStore.dispatch(setPrimaryFactorToRecover(ctx.payload.params?.[0].email.trim() ?? ''));
  await recoveryStore.dispatch(rejectNoRecoveryMethod(ctx.payload.params?.[0].email.trim() ?? ''));
  await recoveryStore.dispatch(checkIfUserIsLoggedIn()); // comment it in whitelabel
  next();
};
