import React, { useEffect, useState } from 'react';
import { Icon, Spacer } from '@magiclabs/ui';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { usePinCode } from '~/app/ui/components/widgets/pin-code-input/usePinCode';
import { i18n } from '~/app/libs/i18n';
import styles from './totp-page.less';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button/';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { SuccessCheckmark } from '~/shared/svg/magic-connect';
import { useDisableMfa } from '../../hooks/mfaHooks';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { INCORRECT_TWO_FA_CODE } from '../../services/mfa/errorCodes';
import { mfaStore } from '../../store';
import { resolveMfaComplete } from '../../store/mfa.thunks';
import { LockIcon } from '~/shared/svg/mfa';

export const DisableTotpPage = ({ returnToRoute }) => {
  const { navigateTo } = useControllerContext();
  const { theme } = useTheme();
  const { disableTotp, isLoading, error } = useDisableMfa();
  const [errorMsg, setErrorMsg] = useState('');
  const [isTotpDisableSuccess, setisTotpDisableSuccess] = useState(false);

  const returnToOrClose = () => {
    if (returnToRoute) navigateTo(returnToRoute);
    else mfaStore.dispatch(resolveMfaComplete());
  };

  const submitTotpCode = async (code: string) => {
    if (await disableTotp(code)) {
      setisTotpDisableSuccess(true);
      setTimeout(() => returnToOrClose(), 2000);
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
      setisTotpDisableSuccess(false);
      setErrorMsg(i18n.mfa.enter_totp_invalid_code.toString());
      setTimeout(() => focusForm(), 0); // wait for after render
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
  if (isTotpDisableSuccess) content = <Icon aria-label={i18n.generic.loading.toString()} type={SuccessCheckmark} />;

  return (
    <div>
      {!isLoading && !isTotpDisableSuccess && (
        <ModalHeader
          leftAction={returnToRoute && <BackActionButton onClick={() => navigateTo(returnToRoute)} />}
          rightAction={!returnToRoute ? <CancelActionButton /> : <div />}
        />
      )}
      <div className={styles.totpPage}>
        <Icon type={LockIcon} size={{ width: 40, height: 44 }} color={theme.color.primary.base.toString()} />
        <Spacer size={22} orientation="vertical" />
        <h1 className={styles.body}>{i18n.mfa.enter_totp_body.toString()}</h1>
        <Spacer size={40} orientation="vertical" />
        {content}
      </div>
    </div>
  );
};
