import React, { useEffect, useState } from 'react';
import { Icon, Spacer, TextField } from '@magiclabs/ui';
import { i18n } from '~/app/libs/i18n';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { mfaStore } from '../../store';
import { resolveMfaComplete } from '../../store/mfa.thunks';
import styles from './recovery-code-page.less';
import { KeyIcon } from '~/shared/svg/mfa';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { BackActionButton } from '~/app/ui/components/widgets/modal-action-button/';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { isMfaErrorCode, MfaVerifySuccessData } from '../../services/mfa/mfa';
import { SuccessCheckmark } from '~/shared/svg/magic-connect';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';

export type EnterRecoveryCodePageProps = {
  recoverySuccessRoute?: string;
  nonMfaErrorRoute?: string; // catch all incase of network error
  navBackRoute: string;
  isLoading: boolean;
  error: any;
  onRecoverySuccess?: (result: MfaVerifySuccessData) => void;
  tryRecovery: (recovery_code: string) => Promise<Boolean | MfaVerifySuccessData>;
};

export const EnterRecoveryCodePage = ({
  recoverySuccessRoute,
  navBackRoute,
  nonMfaErrorRoute,
  isLoading,
  error,
  onRecoverySuccess,
  tryRecovery,
}: EnterRecoveryCodePageProps) => {
  const { navigateTo } = useControllerContext();
  const { theme } = useTheme();

  const returnToOrClose = () => {
    if (recoverySuccessRoute) navigateTo(recoverySuccessRoute);
    else mfaStore.dispatch(resolveMfaComplete());
  };

  const [recoveryCode, setRecoveryCode] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [displaySuccess, setDisplaySuccess] = useState(false);

  const onChangeRecoveryCode = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e?.target?.value;
    if (val.length > 8) {
      return;
    }
    setRecoveryCode(val);

    if (val.length === 8 && attemptsLeft > 0) {
      setAttemptsLeft(attemptsLeft - 1);
      const result = await tryRecovery(val);
      if (result) {
        setDisplaySuccess(true);
        setTimeout(
          () => (onRecoverySuccess ? onRecoverySuccess(result as MfaVerifySuccessData) : returnToOrClose()),
          1000,
        );
      }
    }
  };

  useEffect(() => {
    if (attemptsLeft <= 0) navigateTo('recovery-code-lockout');
  }, [attemptsLeft]);

  useEffect(() => {
    if (error && !isMfaErrorCode(error.code) && nonMfaErrorRoute) {
      navigateTo(nonMfaErrorRoute);
    }
  }, [error]);

  let errorMsg;
  if (error) {
    errorMsg = i18n.mfa.invalid_recovery_code_msg.toString();
  }
  if (attemptsLeft < 4) {
    errorMsg = i18n.mfa.max_attempt_warning_msg.toString({
      attempts: `${attemptsLeft}`,
    });
  }

  let content = (
    <>
      <TextField
        errorMessage={errorMsg}
        value={recoveryCode}
        onChange={onChangeRecoveryCode}
        maxLength={8}
        placeholder={i18n.mfa.recovery_code_input_placeholder.toString()}
      />
      <Spacer size={16} orientation="vertical" />
      <div className={styles.recoveryCodesWarning}>{i18n.mfa.use_recovery_code_warning.toString()}</div>
      <Spacer size={24} orientation="vertical" />
      <button className={styles.mfaLinkButton} onClick={() => navigateTo('lost-recovery-code')}>
        {i18n.mfa.lost_recovery_code.toString()}
      </button>
    </>
  );

  if (isLoading) {
    content = <LoadingSpinner />;
  }

  if (displaySuccess) {
    content = <Icon aria-label={i18n.generic.loading.toString()} type={SuccessCheckmark} />;
  }

  return (
    <div className={styles.recoveryCodePage}>
      {!isLoading && !displaySuccess && (
        <ModalHeader leftAction={<BackActionButton onClick={() => navigateTo(navBackRoute)} />} />
      )}
      <Icon type={KeyIcon} color={theme.color.primary.base.toString()} />
      <Spacer size={28} orientation="vertical" />
      <div className={styles.body}>{i18n.mfa.use_recovery_code_body.toString()}</div>
      <Spacer size={40} orientation="vertical" />
      {content}
    </div>
  );
};
