import React, { useEffect, useState } from 'react';
import { Flex, Spacer, Icon } from '@magiclabs/ui';
import { useTheme } from '../../../../hooks/use-theme';
import { ThemeLogo } from '../../../widgets/theme-logo';
import { i18n } from '~/app/libs/i18n';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import { AuthenticationService } from '~/app/services/authentication';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { Endpoint } from '~/server/routes/endpoint';
import { useControllerContext } from '~/app/ui/hooks/use-controller';

import styles from './auth-security-otp-challenge.less';
import { usePinCode } from '../../../widgets/pin-code-input/usePinCode';
import { LoadingSpinner } from '../../../widgets/loading-spinner';
import { INCORRECT_VERIFICATION_CODE } from '~/features/update-phone-number/services/update-phone-number-error-codes';
import { MAX_ATTEMPTS_EXCEEDED } from '~/features/email-otp/services/email-otp/errorCodes';
import { SuccessCheckmark, SuccessCheckmarkDarkmode } from '~/shared/svg/magic-connect';

export const AuthSecurityOtpChallenge: React.FC = () => {
  const { theme } = useTheme();
  const [isValidating, setIsValidating] = useState(false);
  const [isValidationSuccess, setIsValidationSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { navigateTo } = useControllerContext();

  useEffect(() => {
    trackAction(AnalyticsActionType.ConfirmPageShown, { status: 'otp-challenge' });
  }, []);

  const { PinCodeInput, pinCodeInputProps, clearPinCodeInput, focusForm } = usePinCode({
    pinLength: 3,
    onComplete: async securityOtp => {
      try {
        const { tlt: tempLoginToken, e: env } = getOptionsFromEndpoint(Endpoint.Client.ConfirmV1);
        setIsValidating(true);
        if (await AuthenticationService.loginVerify(tempLoginToken, env, securityOtp)) {
          setIsValidationSuccess(true);
          setTimeout(() => {
            navigateTo('auth-success');
          }, 2000);
        }
        setIsValidating(false);
      } catch (err: any) {
        setIsValidating(false);
        if (err.code === INCORRECT_VERIFICATION_CODE) {
          setErrorMsg(i18n.login_sms.invalid_code_info_message.toString());
          clearPinCodeInput();
        } else if (err.code === MAX_ATTEMPTS_EXCEEDED) {
          navigateTo('auth-security-otp-expired');
        }
      }
    },
    onChange: () => setErrorMsg(''),
  });

  useEffect(() => {
    focusForm();
  }, []);

  const renderSuccessCheckmark = () => {
    return theme.isDarkTheme ? SuccessCheckmarkDarkmode : SuccessCheckmark;
  };

  return (
    <Flex.Column horizontal="center" className={styles.AuthSecurityOtpChallenge} aria-live="assertive">
      <>
        <ThemeLogo height={69} style={{ opacity: isValidating ? '0.3' : '1' }} />
        <Spacer size={24} orientation="vertical" />
      </>
      <p className="fontDescription fontCentered" style={{ opacity: isValidating ? '0.3' : '1' }}>
        {i18n.login.enter_the_security_code_displayed_by.toMarkdown({ appName: theme.appName })}
      </p>
      <Spacer size={32} orientation="vertical" />
      {isValidating && <LoadingSpinner small />}
      {!isValidating && !isValidationSuccess && (
        <div className={styles.PincodeInputWrapper} style={{ width: '75%' }}>
          <PinCodeInput {...pinCodeInputProps} id={styles.otpInput || ''} />
          {errorMsg && (
            <>
              <Spacer size={12} orientation="vertical" />
              <div className={`${styles.statusMessage} ${styles.statusMessageError}`}>{errorMsg}</div>
            </>
          )}
        </div>
      )}
      {isValidationSuccess && <Icon aria-label={i18n.generic.success.toString()} type={renderSuccessCheckmark()} />}{' '}
    </Flex.Column>
  );
};

AuthSecurityOtpChallenge.displayName = 'AuthSecurityOtpChallenge';
