import React, { useEffect, useState } from 'react';
import { Icon, Spacer } from '@magiclabs/ui';
import { useAsyncEffect } from 'usable-react';
import { i18n } from '~/app/libs/i18n';
import { useSetupSmsRecovery } from '../../hooks/setupSmsRecoveryHooks';
import styles from './recovery-sms-verification-page.less';
import { LoginWithSmsPage } from '~/features/login-with-sms/components/partials/login-with-sms-page';
import { SmsVerificationForm } from '~/features/login-with-sms/components/sms-verification-form/sms-verification-form';
import {
  INVALID_FACTOR_VERIFIER_CREDENTIALS,
  LOGIN_THROTTLED,
} from '~/features/login-with-sms/services/sms/errorCodes';
import { SecurityLockoutPage } from '~/features/login-with-sms/components/security-lockout-page';
import { rejectLoginLockoutLifted } from '~/features/login-with-sms/store/login-with-sms.thunks';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { recoveryStore } from '~/features/recovery/store';
import { SmsChatBubble } from '~/shared/svg/sms';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { CancelActionButton, BackActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { useEditSmsRecovery } from '~/features/recovery/hooks/editSmsRecoveryHooks';
import { NeedHelpTextLink } from '~/features/recovery/components/setup-recovery-sms-verification-page/need-help';
import { SuccessCheckmark } from '~/shared/svg/magic-connect';
import { ErrorMsg } from '~/app/ui/components/widgets/error-msg';

export interface RecoverySMSPageProps {
  navBackRoute: string;
  flow: 'setup' | 'edit';
}

export const RecoverySmsVerificationPage: React.FC<RecoverySMSPageProps> = ({ navBackRoute, flow }) => {
  const { navigateTo } = useControllerContext();
  const formattedPhoneNumber = recoveryStore.hooks.useSelector(state => state.phoneNumber) ?? '';
  const phoneNumberForLogin = recoveryStore.hooks.useSelector(state => state.phoneNumberForLogin || '');
  const selectedCountryCallingCode = recoveryStore.hooks.useSelector(state => state.selectedCountryCallingCode || '');
  const factorId = recoveryStore.hooks.useSelector(state => state.currentFactorId || '');
  const [errorMsg, setErrorMsg] = useState('');

  const [isOtcVerified, setIsOtcVerified] = useState(false);
  const [isThrottled, setIsThrottled] = useState(false);

  const isSetupRecoveryFlow = flow === 'setup';
  const isEditRecovery = flow === 'edit';

  const { verifySms, sendSmsOtc, isPhoneAddedOrEditedSuccessful, error } = isSetupRecoveryFlow
    ? useSetupSmsRecovery(phoneNumberForLogin)
    : useEditSmsRecovery(phoneNumberForLogin);

  useAsyncEffect(async () => {
    if (isPhoneAddedOrEditedSuccessful) {
      setIsOtcVerified(true);
      setTimeout(() => navigateTo(isSetupRecoveryFlow ? 'phone-number-added' : 'phone-number-edited'), 1000);
    }
  }, [isPhoneAddedOrEditedSuccessful]);

  const onLiftLockout = () => {
    recoveryStore.dispatch(rejectLoginLockoutLifted());
  };

  useEffect(() => {
    if (error === LOGIN_THROTTLED) {
      setIsThrottled(true);
    }
    if (error === INVALID_FACTOR_VERIFIER_CREDENTIALS) {
      setErrorMsg(i18n.recovery.invalid_credential.toString());
    }
  }, [error]);

  if (isThrottled) {
    return <SecurityLockoutPage onLiftLockout={onLiftLockout} />;
  }

  return (
    <>
      <ModalHeader
        leftAction={<BackActionButton onClick={() => navigateTo(navBackRoute)} />}
        rightAction={<CancelActionButton />}
      />
      <LoginWithSmsPage className={styles.verificationPageWrapper}>
        <Spacer size={32} orientation="vertical" />
        <Icon type={SmsChatBubble} size={44} />
        <Spacer size={24} orientation="vertical" />
        <div className={styles.sentMessageTitle}>
          {i18n.login_sms.enter_verification_code.toMarkdown()}
          <br />
          <strong>
            {selectedCountryCallingCode} {formattedPhoneNumber}
          </strong>
        </div>
        <Spacer size={40} orientation="vertical" />
        {!isOtcVerified && (
          <SmsVerificationForm
            {...{
              verifySms,
              sendSmsOtc,
              error,
              secondaryTextLink: <NeedHelpTextLink />,
            }}
          />
        )}
        {isOtcVerified && <Icon aria-label={i18n.generic.success.toString()} type={SuccessCheckmark} />}
        {errorMsg && <ErrorMsg errorMsg={errorMsg} paddingTop={0} />}
      </LoginWithSmsPage>
    </>
  );
};
