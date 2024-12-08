import { RpcMiddleware } from '~/app/rpc/types';
import { rejectPayload } from '~/app/rpc/utils';
import { sdkErrorFactories } from '~/app/libs/exceptions';

// Actions & Thunks
type UpdatePhoneNumberParams = [];
type UpdatePhoneNumberMiddleware = RpcMiddleware<UpdatePhoneNumberParams>;

/**
 * Marshall the parameters required for the update sms flow.
 */
export const marshallUpdatePhoneNumberParams: UpdatePhoneNumberMiddleware = async (ctx, next) => {
  const { payload } = ctx;
  return rejectPayload(
    payload,
    sdkErrorFactories.rpc.methodNotFoundError('Method not enabled, please contact support.'),
  );
};
