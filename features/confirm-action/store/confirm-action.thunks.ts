import { ConfirmActionService } from '~/app/services/confirm-action';
import { ThunkActionWrapper } from '~/app/store/types';
import { poller } from '~/shared/libs/poller';
import { ConfirmActionInfo, ConfirmActionType } from '../types';
import { isMobileSDK } from '~/app/libs/platform';
import { setConfirmActionId } from '~/app/store/system/system.actions';

export const ConfirmActionErrorCodes = {
  USER_REJECTED_CONFIRMATION: 'USER_REJECTED_CONFIRMATION',
  CONFIRMATION_EXPIRED: 'CONFIRMATION_EXPIRED',
};

export function waitForActionConfirmed(): ThunkActionWrapper<Promise<void>> {
  return (dispatch, getState) => {
    const originalPayloadID = getState().UIThread.payload?.id;

    return poller<void>({
      delay: 4000,
      interval: 3000,
      expiresIn: 1000 * 60, // expires in 60 + 4 seconds
      onInterval: async (resolve, reject) => {
        if (originalPayloadID && getState().UIThread.payload?.id !== originalPayloadID)
          return reject(ConfirmActionErrorCodes.USER_REJECTED_CONFIRMATION);

        const { userID: authUserId } = getState().Auth;
        const { confirmActionId } = getState().System;

        const res = await ConfirmActionService.getConfirmStatus(authUserId, confirmActionId);
        if (res.data.status === 'APPROVED') {
          resolve();
        } else if (res.data.status === 'REJECTED') {
          reject(ConfirmActionErrorCodes.USER_REJECTED_CONFIRMATION);
        }
      },
      onExpire: async (resolve, reject) => {
        reject(ConfirmActionErrorCodes.CONFIRMATION_EXPIRED);
      },
    });
  };
}

export function beginActionConfirmation(
  actionType: ConfirmActionType,
  actionInfo: ConfirmActionInfo,
): ThunkActionWrapper<Promise<string>> {
  return async (dispatch, getState) => {
    const { userID: authUserId } = getState().Auth;

    const res = await ConfirmActionService.beginConfirm(authUserId, actionType, {
      ...actionInfo,
    });
    const confirmActionId = res.data.confirmation_id;
    const tct = res.data.temporary_confirmation_token;
    const confirmUrl = `${window.location.origin}/confirm-action?tct=${tct}${
      isMobileSDK() ? '&open_in_device_browser=true' : ''
    }`;
    dispatch(setConfirmActionId(confirmActionId));
    return Promise.resolve(confirmUrl);
  };
}
