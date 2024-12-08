import { store } from '~/app/store';
import { JsonRpcRequestPayload } from 'magic-sdk';
import { poller } from '~/shared/libs/poller';
import { ControlFlowErrorCode, resolveErrorCode, sdkErrorFactories } from '~/app/libs/exceptions';
import { useState } from 'react';
import { DeviceVerificationService } from '~/features/device-verification/service';
import { rejectPayload } from '~/app/rpc/utils';
import { setIsDeviceRecognized } from '~/app/store/auth/auth.actions';
import { UIThreadThunks } from '~/app/store/ui-thread/ui-thread.thunks';
import { loginWithEmailOtpStore } from '~/features/email-otp/store';

// Todo combine this poller with magic link poller
export const useDeviceVerification = () => {
  const [stopPoller, setStopPoller] = useState(false);
  const [isDeviceVerified, setIsDeviceVerified] = useState(false);
  const [isDeviceLinkExpired, setIsDeviceLinkExpired] = useState(false);
  const verifyDevice = () => {
    const { payload } = store.getState().UIThread;
    const { deviceVerifyLink } = store.getState().Auth;
    const { showUI } = loginWithEmailOtpStore.getState();
    const originalPayloadID = payload?.id;

    return poller<void>({
      delay: 5000,
      interval: 2000,
      expiresIn: 1000 * 60 * 20, // twenty minutes

      onInterval: async (resolve, reject) => {
        try {
          // Fail fast if the user cancelled login.
          if (originalPayloadID && store.getState().UIThread.payload?.id !== originalPayloadID) return reject();
          // Allow poller to be stopped externally
          if (stopPoller) return reject();

          // if approved, kick this out of the auth flow and restart
          const { status } = (await DeviceVerificationService.deviceVerify(deviceVerifyLink)).data;
          if (status === 'approved') {
            setIsDeviceVerified(true);
            store.dispatch(setIsDeviceRecognized(true));
            if (!showUI) {
              await store.dispatch(UIThreadThunks.releaseLockAndHideUI({}, false));
            }
            resolve();
          } else if (status === 'rejected') {
            reject();
            rejectPayload(payload, sdkErrorFactories.client.userDeniedAccountAccess());
          }

          // for status === 'pending', we do nothing, just let it sit till expired
        } catch (e) {
          if (
            [
              ControlFlowErrorCode.OverMAUQuota,
              ControlFlowErrorCode.AnomalousRequestDetected,
              ControlFlowErrorCode.UnsupportedEthereumNetwork,
            ].includes(resolveErrorCode(e) as ControlFlowErrorCode)
          ) {
            reject(e);
          }
        }
      },

      onExpire: async (resolve, reject) => {
        setIsDeviceLinkExpired(true);
        reject(ControlFlowErrorCode.DeviceVerificationLinkExpired);
      },
    });
  };

  return { isDeviceLinkExpired, isDeviceVerified, verifyDevice, stopDevicePoller: () => setStopPoller(true) };
};
