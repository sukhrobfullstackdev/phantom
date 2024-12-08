import { store } from '~/app/store';
import { poller } from '~/shared/libs/poller';
import { setIsDeviceRecognized } from '~/app/store/auth/auth.actions';
import { ControlFlowErrorCode, resolveErrorCode, sdkErrorFactories } from '~/app/libs/exceptions';
import { sendEmailOtpWhiteLabel } from '~/features/email-otp/email-otp-whitelabel.controller';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { DeviceVerificationEventOnReceived, JsonRpcRequestPayload } from 'magic-sdk';
import { DeviceVerificationService } from '~/features/device-verification/service';
import { rejectPayload } from '~/app/rpc/utils';
import { ThunkActionWrapper } from '~/app/store/types';

export function verifyDeviceWhitelabel(
  email: string,
  whiteLabelRom: string,
  payload: JsonRpcRequestPayload,
): ThunkActionWrapper<Promise<void>> {
  return async (dispatch, getState) => {
    const { deviceVerifyLink } = getState().Auth;
    const originalPayloadID = getState().UIThread.payload?.id;

    return poller<void>({
      delay: 5000,
      interval: 2000,
      expiresIn: 1000 * 60 * 20, // twenty minutes

      onInterval: async (resolve, reject) => {
        try {
          // Fail fast if the user cancelled login.
          if (originalPayloadID && getState().UIThread.payload?.id !== originalPayloadID) return reject();

          // if approved, kick this out of the auth flow and restart
          const { status } = (await DeviceVerificationService.deviceVerify(deviceVerifyLink)).data;
          if (status === 'approved') {
            dispatch(
              SystemThunks.emitJsonRpcEvent({
                payload,
                event: DeviceVerificationEventOnReceived.DeviceApproved,
              }),
            );
            dispatch(setIsDeviceRecognized(true));
            await sendEmailOtpWhiteLabel();
            resolve();
          } else if (status === 'rejected') {
            rejectPayload(payload, sdkErrorFactories.client.userDeniedAccountAccess());
            reject();
          }

          // for status === 'pending', we do nothing, just let it sit till expired
        } catch (e) {
          switch (resolveErrorCode(e)) {
            case ControlFlowErrorCode.OverMAUQuota:
              rejectPayload(payload, sdkErrorFactories.client.overMAUQuota('over MAU quota'));
              break;
            case ControlFlowErrorCode.AnomalousRequestDetected:
              rejectPayload(
                payload,
                sdkErrorFactories.client.anomalousRequestDetected("We've detected unusual activity."),
              );
              break;
            case ControlFlowErrorCode.UnsupportedEthereumNetwork:
              rejectPayload(payload, sdkErrorFactories.rpc.invalidParamsError('Unsupported ethereum network'));
              break;
            default:
          }
          reject();
        }
      },

      onExpire: async (resolve, reject) => {
        store.dispatch(
          SystemThunks.emitJsonRpcEvent({
            payload,
            event: DeviceVerificationEventOnReceived.DeviceVerificationLinkExpired,
          }),
        );
        reject();
      },
    });
  };
}
