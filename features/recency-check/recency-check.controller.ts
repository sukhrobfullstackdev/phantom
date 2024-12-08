import { recencyStore } from '~/features/recency-check/store';
import { DeepLinkPage, JsonRpcRequestPayload, RecencyCheckEventEmit, RecencyCheckEventOnReceived } from 'magic-sdk';
import { UpdateEmailParams } from '~/features/update-email/update-email.controller';
import { store } from '~/app/store';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { RpcIntermediaryEventService } from '~/app/services/rpc-intermediary-event';
import { isServiceError, sdkErrorFactories } from '~/app/libs/exceptions';
import { RecencyCheckService } from '~/features/recency-check/services';
import {
  setAttemptID,
  setNeedPrimaryFactorVerification,
  setPrimaryFactorCredential,
} from '~/features/recency-check/store/recency.actions';
import { RecencyThunks } from '~/features/recency-check/store/recency.thunks';
import { RpcMiddleware } from '~/app/rpc/types';
import { RecoveryMethodType } from '~/features/recovery/constants/flags';
import {
  INCORRECT_VERIFICATION_CODE,
  VERIFICATION_CODE_EXPIRED,
} from '~/features/login-with-sms/services/sms/errorCodes';

export type RecencyCheckMiddleware = RpcMiddleware<[{}], {}>;
export const recencyCheck: RecencyCheckMiddleware = async (ctx, next) => {
  // probeRecency Check
  await recencyStore.dispatch(RecencyThunks.probeRecency(DeepLinkPage.UpdateEmail));

  const { payload } = ctx;
  const [{ showUI = true }] = payload.params as UpdateEmailParams;

  const { userID, userEmail } = store.getState().Auth;
  const { needPrimaryFactorVerification } = recencyStore.getState();

  if (showUI || !needPrimaryFactorVerification) {
    // Recency Check UI will happen within the page
    next();
    return;
  }

  // Whitelabel Recency Check Needed
  SystemThunks.emitJsonRpcEvent({
    payload,
    event: RecencyCheckEventOnReceived.PrimaryAuthFactorNeedsVerification,
  });

  await sendEmailOtpWhitelabel(payload);

  /**
   *  Attach Events Listener
   */
  RpcIntermediaryEventService.on(RecencyCheckEventEmit.Cancel, payload, async () => {
    RpcIntermediaryEventService.remove(payload);
    return store.dispatch(
      SystemThunks.resolveJsonRpcResponse({ payload, error: sdkErrorFactories.magic.requestCancelled() }),
    );
  });

  RpcIntermediaryEventService.on(RecencyCheckEventEmit.Retry, payload, async () => {
    try {
      await RecencyCheckService.probeRecencyCheck(userID, userEmail);
      recencyStore.dispatch(setNeedPrimaryFactorVerification(false));
    } catch (e) {
      recencyStore.dispatch(setNeedPrimaryFactorVerification(true));
      await sendEmailOtpWhitelabel(payload);
    }
  });

  RpcIntermediaryEventService.on(RecencyCheckEventEmit.VerifyEmailOtp, payload, async otp => {
    const verifiedSuccess = await verifyEmailOtpWhitelabel(otp, payload);

    if (verifiedSuccess) {
      next();
    }
  });
};

const sendEmailOtpWhitelabel = async (payload: JsonRpcRequestPayload): Promise<boolean> => {
  const { userID, userEmail } = store.getState().Auth;

  try {
    const { id } = (
      await RecencyCheckService.primaryFactorStart({
        auth_user_id: userID,
        value: userEmail,
        type: RecoveryMethodType.EmailAddress,
      })
    ).data;

    const { attempt_id } = (await RecencyCheckService.primaryFactorChallenge(id, userID)).data;

    recencyStore.dispatch(setAttemptID(attempt_id));
    await store.dispatch(
      SystemThunks.emitJsonRpcEvent({
        payload,
        event: RecencyCheckEventOnReceived.EmailSent,
      }),
    );
    return true;
  } catch (e) {
    await store.dispatch(
      SystemThunks.emitJsonRpcEvent({
        payload,
        event: RecencyCheckEventOnReceived.EmailNotDeliverable,
      }),
    );
  }
  return false;
};

const verifyEmailOtpWhitelabel = async (otc: string, payload: JsonRpcRequestPayload): Promise<boolean> => {
  const { userID } = store.getState().Auth;
  const { attemptID } = recencyStore.getState();

  try {
    const { credential } = (await RecencyCheckService.primaryFactorVerify(attemptID, otc, userID)).data;
    recencyStore.dispatch(setPrimaryFactorCredential(credential));

    await store.dispatch(
      SystemThunks.emitJsonRpcEvent({
        payload,
        event: RecencyCheckEventOnReceived.PrimaryAuthFactorVerified,
      }),
    );
    return true;
  } catch (e) {
    if (isServiceError(e) && e.code === INCORRECT_VERIFICATION_CODE) {
      await store.dispatch(
        SystemThunks.emitJsonRpcEvent({
          payload,
          event: RecencyCheckEventOnReceived.InvalidEmailOtp,
        }),
      );
    } else if (isServiceError(e) && e.code === VERIFICATION_CODE_EXPIRED) {
      await store.dispatch(
        SystemThunks.emitJsonRpcEvent({
          payload,
          event: RecencyCheckEventOnReceived.EmailExpired,
        }),
      );
    } else {
      await store.dispatch(
        SystemThunks.resolveJsonRpcResponse({ payload, error: sdkErrorFactories.rpc.internalError() }),
      );
    }
  }
  return false;
};
