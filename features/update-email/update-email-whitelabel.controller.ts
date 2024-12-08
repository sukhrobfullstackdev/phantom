import { UpdateEmailMiddleware, UpdateEmailParams } from '~/features/update-email/update-email.controller';
import { RpcIntermediaryEventService } from '~/app/services/rpc-intermediary-event';
import { store } from '~/app/store';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { isServiceError, sdkErrorFactories } from '~/app/libs/exceptions';
import { JsonRpcRequestPayload, UpdateEmailEventEmit, UpdateEmailEventOnReceived } from 'magic-sdk';
import { updateEmailStore } from '~/features/update-email/store';
import { UpdateEmailAddressService } from '~/features/update-email/services';
import {
  initUpdateEmailState,
  setAttemptID,
  setToBeUpdatedEmail,
  setUpdateEmailFactorId,
} from '~/features/update-email/store/update-email.actions';
import { recencyStore } from '~/features/recency-check/store';
import { setUserEmail } from '~/app/store/auth/auth.actions';
import { INCORRECT_VERIFICATION_CODE } from '~/features/login-with-sms/services/sms/errorCodes';
import { ACCOUNT_ALREADY_EXISTS } from '../update-phone-number/services/update-phone-number-error-codes';

export const applyUpdateEmailWhitelabel: UpdateEmailMiddleware = async (ctx, next) => {
  await updateEmailStore.ready;
  const { payload } = ctx;
  const [{ showUI = true }] = payload.params as UpdateEmailParams;

  if (showUI) {
    next();
    return;
  }

  const initiateEmailVerification = async () => {
    const isSuccessful = await createAuthUserFactorForNewEmail(payload);
    if (isSuccessful) {
      await sendEmailOtpWhitelabel(payload);
    }
  };

  await initiateEmailVerification();

  /**
   *  Attach Events Listener
   */
  RpcIntermediaryEventService.on(UpdateEmailEventEmit.Cancel, payload, async () => {
    RpcIntermediaryEventService.remove(payload);
    return store.dispatch(
      SystemThunks.resolveJsonRpcResponse({ payload, error: sdkErrorFactories.magic.requestCancelled() }),
    );
  });

  RpcIntermediaryEventService.on(UpdateEmailEventEmit.RetryWithNewEmail, payload, async (newEmail?: string) => {
    if (newEmail) updateEmailStore.dispatch(setToBeUpdatedEmail(newEmail));
    await initiateEmailVerification();
  });

  RpcIntermediaryEventService.on(UpdateEmailEventEmit.VerifyEmailOtp, payload, async (otp: string) => {
    const verifiedSuccess = await verifyUpdateEmailOtp(otp, payload);
    if (verifiedSuccess) {
      store.dispatch(SystemThunks.resolveJsonRpcResponse({ payload, result: true }));
    } else {
      return;
    }
  });
};

const createAuthUserFactorForNewEmail = async (payload: JsonRpcRequestPayload): Promise<boolean> => {
  try {
    const { userID } = store.getState().Auth;
    const { updatedEmail } = updateEmailStore.getState();
    const { id } = (await UpdateEmailAddressService.createAuthUserFactorForNewEmail(userID, updatedEmail as string))
      .data;
    updateEmailStore.dispatch(setUpdateEmailFactorId(id));
    return true;
  } catch (e: any) {
    if (isServiceError(e) && e.code === ACCOUNT_ALREADY_EXISTS) {
      await store.dispatch(
        SystemThunks.emitJsonRpcEvent({
          payload,
          event: UpdateEmailEventOnReceived.EmailAlreadyExists,
        }),
      );
    } else {
      await store.dispatch(
        SystemThunks.emitJsonRpcEvent({
          payload,
          event: UpdateEmailEventOnReceived.InvalidEmail,
        }),
      );
    }
  }
  return false;
};

const sendEmailOtpWhitelabel = async (payload: JsonRpcRequestPayload): Promise<boolean> => {
  try {
    const { userID } = store.getState().Auth;
    const { primaryFactorCredential: credential } = recencyStore.getState();
    const { updateEmailFactorId } = updateEmailStore.getState();

    const { attempt_id } = (
      await UpdateEmailAddressService.emailUpdateChallenge(userID, updateEmailFactorId, credential)
    ).data;
    updateEmailStore.dispatch(setAttemptID(attempt_id));
    await store.dispatch(
      SystemThunks.emitJsonRpcEvent({
        payload,
        event: UpdateEmailEventOnReceived.EmailSent,
      }),
    );
    return true;
  } catch (e) {
    await store.dispatch(
      SystemThunks.emitJsonRpcEvent({
        payload,
        event: UpdateEmailEventOnReceived.EmailNotDeliverable,
      }),
    );
  }
  return false;
};

const verifyUpdateEmailOtp = async (otc: string, payload: JsonRpcRequestPayload): Promise<boolean> => {
  const { updatedEmail, attemptID } = updateEmailStore.getState();

  try {
    const { userID } = store.getState().Auth;

    await UpdateEmailAddressService.emailUpdateVerify(userID, attemptID, otc);
    // Update store email
    store.dispatch(setUserEmail(updatedEmail));
    await store.dispatch(
      SystemThunks.emitJsonRpcEvent({
        payload,
        event: UpdateEmailEventOnReceived.EmailUpdated,
      }),
    );
    updateEmailStore.dispatch(initUpdateEmailState());
    return true;
  } catch (e) {
    if (isServiceError(e) && e.code === INCORRECT_VERIFICATION_CODE) {
      await store.dispatch(
        SystemThunks.emitJsonRpcEvent({
          payload,
          event: UpdateEmailEventOnReceived.InvalidEmailOtp,
        }),
      );
    } else {
      SystemThunks.resolveJsonRpcResponse({ payload, error: sdkErrorFactories.rpc.internalError() });
    }
  }
  return false;
};
