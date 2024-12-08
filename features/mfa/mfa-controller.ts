import { mfaStore } from './store';
import { RpcMiddleware } from '~/app/rpc/types';
import { setEnableFlowMfaData, setRecoveryCodes } from './store/mfa.actions';

type mfaFlowParams = [];
type mfaFlowContext = {};
type mfaFlowMiddleware = RpcMiddleware<mfaFlowParams, mfaFlowContext>;

export const marshalMfaParams: mfaFlowMiddleware = async (ctx, next) => {
  await mfaStore.ready;
  mfaStore.dispatch(setEnableFlowMfaData(undefined));
  mfaStore.dispatch(setRecoveryCodes([]));
  next();
};
