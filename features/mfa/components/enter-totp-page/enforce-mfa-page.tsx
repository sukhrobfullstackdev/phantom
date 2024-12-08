import React, { useEffect, useState } from 'react';
import { Icon, Spacer } from '@magiclabs/ui';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { usePinCode } from '~/app/ui/components/widgets/pin-code-input/usePinCode';
import { i18n } from '~/app/libs/i18n';
import styles from './totp-page.less';
import { LockIcon } from '~/shared/svg/mfa';
import { useEnforceMfa } from '../../hooks/mfaHooks';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { INCORRECT_TWO_FA_CODE } from '../../services/mfa/errorCodes';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { isMfaErrorCode, MfaVerifySuccessData } from '../../services/mfa/mfa';
import { SuccessCheckmark } from '~/shared/svg/magic-connect';

export type EnforceMfaPageProps = {
  onMfaComplete:
    | ((result: MfaVerifySuccessData) => void | undefined)
    | ((result: MfaVerifySuccessData) => Promise<any>);
  flowContext: string;
  nonMfaErrorRoute?: string; // catch all in case of error
};

export const EnforceMfaPage = ({ onMfaComplete, flowContext, nonMfaErrorRoute }: EnforceMfaPageProps) => {
  const { theme } = useTheme();
  const { navigateTo } = useControllerContext();
  const { mfaVerifyTotp, isLoading, error } = useEnforceMfa(flowContext);
  const [errorMsg, setErrorMsg] = useState('');
  const [isTotpSuccess, setIsTotpSuccess] = useState(false);

  const submitTotpCode = async (code: string) => {
    const result = await mfaVerifyTotp(code);
    if (result) {
      setIsTotpSuccess(true);
      setTimeout(() => onMfaComplete(result), 1500);
    }
  };

  const onPinChange = () => {
    setErrorMsg('');
  };

  const { PinCodeInput, pinCodeInputProps, clearPinCodeInput, focusForm } = usePinCode({
    onComplete: submitTotpCode,
    onChange: onPinChange,
  });

  useEffect(() => {
    setTimeout(() => focusForm(), 0); // wait for after render
  }, []);

  useEffect(() => {
    if (error?.code === INCORRECT_TWO_FA_CODE) {
      clearPinCodeInput();
      setIsTotpSuccess(false);
      setErrorMsg(i18n.mfa.enter_totp_invalid_code.toString());
      setTimeout(() => focusForm(), 0); // wait for after render
    } else if (error && !isMfaErrorCode(error.code) && nonMfaErrorRoute) {
      navigateTo(nonMfaErrorRoute);
    }
  }, [error]);

  let content = (
    <>
      <PinCodeInput {...pinCodeInputProps} />
      {errorMsg && (
        <>
          <Spacer size={16} orientation="vertical" />
          <div className={styles.errorMsg}>{errorMsg}</div>
        </>
      )}
      <Spacer size={24} orientation="vertical" />
      <button className={styles.mfaLinkButton} onClick={() => navigateTo('enter-recovery-code')}>
        {i18n.mfa.lost_code_button.toString()}
      </button>
    </>
  );
  if (isLoading) content = <LoadingSpinner />;
  if (isTotpSuccess) content = <Icon aria-label={i18n.generic.loading.toString()} type={SuccessCheckmark} />;

  return (
    <>
      <div className={styles.totpPage}>
        <Icon type={LockIcon} size={{ width: 40, height: 44 }} color={theme.color.primary.base.toString()} />
        <Spacer size={22} orientation="vertical" />
        <h1 className={styles.body}>{i18n.mfa.enter_totp_body.toString()}</h1>
        <Spacer size={40} orientation="vertical" />
        {content}
      </div>
    </>
  );
};
