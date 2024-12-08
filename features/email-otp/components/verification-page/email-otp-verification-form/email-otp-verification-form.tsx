import React, { useEffect, useState } from 'react';
import { Spacer } from '@magiclabs/ui';
import { i18n } from '~/app/libs/i18n';
import { usePinCode } from '~/app/ui/components/widgets/pin-code-input/usePinCode';
import { INCORRECT_VERIFICATION_CODE, LOGIN_THROTTLED } from '../../../services/email-otp/errorCodes';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import styles from './email-otp-verification-form.less';
import { store } from '~/app/store';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { JsonRpcRequestPayload, RecoverAccountEmit, RecoverAccountOnReceived } from 'magic-sdk';
import { RpcIntermediaryEventService } from '~/app/services/rpc-intermediary-event';

type EmailOtpVerificationFormProps = {
  onOtpVerified: () => void;
  verifyEmailOtp: (otp: string) => Promise<Boolean>;
  error: string;
};

export const EmailOtpVerificationForm = ({ onOtpVerified, verifyEmailOtp, error }: EmailOtpVerificationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const payload = store.getState()?.ActivePayload?.activePayload;
  const verifyOtcCode = async (otc: string) => {
    setIsLoading(true);
    if (await verifyEmailOtp(otc)) {
      onOtpVerified();
    }
    setIsLoading(false);
  }
  const { PinCodeInput, pinCodeInputProps, clearPinCodeInput, focusForm } = usePinCode({
    onComplete: verifyOtcCode,
    onChange: () => setErrorMsg(''),
  });
  useEffect(() => {
    store.dispatch(SystemThunks.emitJsonRpcEvent({
      payload: payload as JsonRpcRequestPayload<any>,
      event: RecoverAccountOnReceived.EnterNewEmailOtp,
    }));
    RpcIntermediaryEventService.on(RecoverAccountEmit.SendNewEmailOtpCode, payload as JsonRpcRequestPayload<any>, (otp: string) => {
      verifyOtcCode(otp);
     });
  }, []);
  useEffect(() => {
    if (error === INCORRECT_VERIFICATION_CODE) {
      setErrorMsg(i18n.login_sms.invalid_code_info_message.toString());
      clearPinCodeInput();
      const handle = setTimeout(() => focusForm(), 0); // so we wait for render to get focus
      return () => clearTimeout(handle);
    }
    if (error === LOGIN_THROTTLED) {
      setErrorMsg('Too many login attempts. Please try again later.');
    }
  }, [error]);

  if (isLoading) {
    return <LoadingSpinner small />;
  }

  return (
    <>
      <PinCodeInput {...pinCodeInputProps} autoFocus originName="email" id={styles.otpInput || ''} />
      {errorMsg && (
        <>
          <Spacer size={12} orientation="vertical" />
          <div className={`${styles.statusMessage} ${styles.statusMessageError}`}>{errorMsg}</div>
        </>
      )}
    </>
  );
};
