import { trim } from '~/app/libs/lodash-utils';
import { RpcMiddleware } from '~/app/rpc/types';

// Actions & Thunks
import { initUpdateEmailState, setToBeUpdatedEmail } from '~/features/update-email/store/update-email.actions';
import { updateEmailStore } from './store';
import { setDeepLink } from '~/features/recovery/store/recovery.actions';
import { recoveryStore } from '~/features/recovery/store';

export type UpdateEmailParams = [{ email: string; showUI: boolean }];
export type UpdateEmailContext = { emailNormalized: string };
export type UpdateEmailMiddleware = RpcMiddleware<UpdateEmailParams, UpdateEmailContext>;

/**
 * Marshall the parameters required for the update email flow.
 */
export const marshallUpdateEmailParamsV2: UpdateEmailMiddleware = async (ctx, next) => {
  await updateEmailStore.ready;

  const { payload } = ctx;

  const [{ email: emailRaw }] = payload.params as UpdateEmailParams;

  // Hacky way to add x button to the modal
  recoveryStore.dispatch(setDeepLink(true));
  updateEmailStore.dispatch(initUpdateEmailState());
  const emailNormalized = trim(emailRaw);
  updateEmailStore.dispatch(setToBeUpdatedEmail(emailNormalized));

  next();
};
