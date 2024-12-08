import React, { useEffect, useState } from 'react';
import { Flex, Spacer, useAnnouncer } from '@magiclabs/ui';
import { useAsyncEffect, useTimer, useTimerComplete } from 'usable-react';
import { i18n } from '~/app/libs/i18n';
import { usePinCode } from '~/app/ui/components/widgets/pin-code-input/usePinCode';
import {
  INCORRECT_VERIFICATION_CODE,
  MALFORMED_PHONE_NUMBER,
  VERIFICATION_CODE_EXPIRED,
} from '../../services/sms/errorCodes';
import { smsLoginStore } from '../../store';
import { rejectLoginInvalidPhone } from '../../store/login-with-sms.thunks';
import styles from './sms-verification-form.less';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { setIsCloseButtonEnabled } from '../../store/login-with-sms.actions';
import { RECOVERY_FACTOR_ALREADY_EXISTS } from '~/features/recovery/services/recovery/errorCodes';
import { CallToActionStateful } from '~/features/connect-with-ui/components/call-to-action-overload';
import { JsonRpcRequestPayload, RecoverAccountEmit, RecoverAccountOnReceived } from 'magic-sdk';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { store } from '~/app/store';
import { RpcIntermediaryEventService } from '~/app/services/rpc-intermediary-event';
import { hideOverlay } from '~/app/store/system/system.actions';

type SmsVerificationFormProps = {
  verifySms: (otc: string) => Promise<Boolean>;
  sendSmsOtc: () => Promise<Boolean>;
  error: string;
  secondaryTextLink?: JSX.Element;
};

export const SmsVerificationForm = ({ verifySms, sendSmsOtc, error, secondaryTextLink }: SmsVerificationFormProps) => {
  const smsOtcExpiryMs = smsLoginStore.hooks.useSelector(state => state.smsExpiryTime) || 30000;
  const [isOtcExpired, setIsOtcExpired] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMalformedPhone, setIsMalformedPhone] = useState(false);
  const announce = useAnnouncer();
  const payload = store.getState()?.ActivePayload?.activePayload;
  const handleOtcCode = async (otc: string) => {
    setIsLoading(true);
    if (!(await verifySms(otc))) {
      setErrorMsg(i18n.login_sms.invalid_code_info_message.toString());
      clearPinCodeInput();
      setTimeout(() => focusForm(), 100); // so we wait for render to get focus
    }
    setIsLoading(false);
  };

  const { PinCodeInput, pinCodeInputProps, clearPinCodeInput, focusForm } = usePinCode({
    onComplete: handleOtcCode,
    onChange: () => setErrorMsg(''),
  });

  const otcTimer = useTimer({ length: smsOtcExpiryMs || -1 });
  const { start, reset, getRemaining } = otcTimer;
  useTimerComplete(otcTimer, () => {
    setIsOtcExpired(true);
  });

  const sendNewSmsOtc = async () => {
    setIsLoading(true);
    if (!(await sendSmsOtc())) {
      setIsLoading(false);
      return;
    }
    setIsLoading(false);
    setIsOtcExpired(false);
    clearPinCodeInput();
    focusForm();
    reset();
    start();
    announce(
      i18n.login_sms.new_code_available.toString({
        seconds: `30 second`, // accessibility hack
      }),
    );
  };

  useAsyncEffect(async () => {
    await sendNewSmsOtc();
  if (payload?.params[0]?.showUI) hideOverlay();
  console.log('payload', payload);
  store.dispatch(SystemThunks.emitJsonRpcEvent({
      payload: payload as JsonRpcRequestPayload<any>,
      event: RecoverAccountOnReceived.EnterOtpCode,
    }));
    RpcIntermediaryEventService.on(RecoverAccountEmit.SendOtpCode, payload as JsonRpcRequestPayload<any>, async (otp: string) => { 
      await handleOtcCode(otp);
     });
  }, []);

  useEffect(() => {
    if (error === MALFORMED_PHONE_NUMBER) {
      setIsMalformedPhone(true);
    }
    if (error === INCORRECT_VERIFICATION_CODE || error === VERIFICATION_CODE_EXPIRED) {
      setErrorMsg(i18n.login_sms.invalid_code_info_message.toString());
      clearPinCodeInput();
      const handle = setTimeout(() => focusForm(), 0); // so we wait for render to get focus
      return () => clearTimeout(handle);
    }
  }, [error]);

  useEffect(() => {
    smsLoginStore.dispatch(setIsCloseButtonEnabled(!isLoading));
  }, [isLoading]);

  const showSendOtcButton = isOtcExpired;
  const showOtcExpireTimer = !isOtcExpired;

  if (isMalformedPhone) {
    return (
      <>
        <div className={`${styles.malformedPhoneMsg} ${styles.statusMessageError}`}>
          {error === MALFORMED_PHONE_NUMBER && i18n.login_sms.malformed_phone_number.toString()}
          {error === RECOVERY_FACTOR_ALREADY_EXISTS && i18n.recovery.recovery_factor_already_exists.toString()}
        </div>
        <Spacer size={40} orientation="vertical" />
        <CallToActionStateful onClick={() => smsLoginStore.dispatch(rejectLoginInvalidPhone())}>
          Close
        </CallToActionStateful>
      </>
    );
  }

  if (isLoading) {
    return <LoadingSpinner small />;
  }

  const resendSmsTextLink = (
    <>
      {showSendOtcButton && (
        <button onClick={sendNewSmsOtc} className={styles.statusMessage}>
          {i18n.login_sms.send_new_code.toMarkdown()}
        </button>
      )}
      {showOtcExpireTimer && (
        <div className={styles.statusMessage} aria-hidden="true">
          {!secondaryTextLink
            ? i18n.login_sms.new_code_available.toMarkdown({
                seconds: `${Math.floor(getRemaining() / 1000)}`,
              })
            : `Send now (${Math.floor(getRemaining() / 1000)}s)`}
        </div>
      )}
    </>
  );

  return (
    <>
      <PinCodeInput {...pinCodeInputProps} autoFocus originName="sms" id={styles.otcInput || ''} />
      {errorMsg && (
        <>
          <Spacer size={12} orientation="vertical" />
          <div className={`${styles.statusMessage} ${styles.statusMessageError}`}>{errorMsg}</div>
        </>
      )}
      <Spacer size={24} orientation="vertical" />
      {secondaryTextLink ? (
        <Flex.Row alignItems="center" justifyContent="space-between" className={styles.textLinks}>
          {resendSmsTextLink}
          {secondaryTextLink}
        </Flex.Row>
      ) : (
        resendSmsTextLink
      )}
    </>
  );
};

SmsVerificationForm.defaultProps = {
  secondaryTextLink: null,
};
