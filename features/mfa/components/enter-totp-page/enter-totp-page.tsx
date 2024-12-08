import React, { useEffect, useState } from 'react';
import { Icon, Spacer } from '@magiclabs/ui';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { usePinCode } from '~/app/ui/components/widgets/pin-code-input/usePinCode';
import { i18n } from '~/app/libs/i18n';
import styles from './totp-page.less';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button/';
import { LockIcon } from '~/shared/svg/mfa';
import { useEnrollMfa } from '../../hooks/mfaHooks';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { INCORRECT_TWO_FA_CODE, TWO_FA_ALREADY_ENABLED } from '../../services/mfa/errorCodes';

export const EnterTotpPage = ({ returnToRoute }) => {
  const { navigateTo } = useControllerContext();
  const { theme } = useTheme();
  const { finishMfaEnroll, isLoading, error } = useEnrollMfa();
  const [errorMsg, setErrorMsg] = useState('');

  const submitTotpCode = async (code: string) => {
    if (await finishMfaEnroll(code)) {
      navigateTo('mfa-recovery-codes');
    }
  };

  const onPinChange = () => {
    setErrorMsg('');
  };

  const { PinCodeInput, pinCodeInputProps, clearPinCodeInput, focusForm } = usePinCode({
    onComplete: submitTotpCode,
    onChange: onPinChange,
  });

  useEffect(() => focusForm(), []);

  useEffect(() => {
    if (error?.code) {
      clearPinCodeInput();
      setTimeout(() => focusForm(), 0); // wait for after render

      switch (error?.code) {
        case INCORRECT_TWO_FA_CODE:
          setErrorMsg(i18n.mfa.enter_totp_invalid_code.toString());
          break;
        case TWO_FA_ALREADY_ENABLED:
          setErrorMsg(i18n.mfa.two_fa_already_enabled.toString());
          break;
        default:
          break;
      }
    }
  }, [error]);

  return (
    <>
      {!isLoading && (
        <ModalHeader
          leftAction={<BackActionButton onClick={() => navigateTo('mfa-enroll-code')} />}
          rightAction={!returnToRoute ? <CancelActionButton /> : null}
        />
      )}
      <div className={styles.totpPage}>
        <Icon type={LockIcon} size={{ width: 40, height: 44 }} color={theme.color.primary.base.toString()} />
        <Spacer size={22} orientation="vertical" />
        <h1 className={styles.body}>{i18n.mfa.enter_totp_body.toString()}</h1>
        <Spacer size={40} orientation="vertical" />
        {isLoading ? <LoadingSpinner /> : <PinCodeInput {...pinCodeInputProps} />}
        {errorMsg && (
          <>
            <Spacer size={16} orientation="vertical" />
            <div className={styles.errorMsg}>{errorMsg}</div>
          </>
        )}
      </div>
    </>
  );
};
