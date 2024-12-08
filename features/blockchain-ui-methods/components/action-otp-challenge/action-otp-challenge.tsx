import React, { useEffect, useState } from 'react';
import { usePinCode } from '~/app/ui/components/widgets/pin-code-input/usePinCode';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { Spacer, Icon } from '@magiclabs/ui';
import { i18n } from '~/app/libs/i18n';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner/loading-spinner';
import { SuccessCheckmark, SuccessCheckmarkDarkmode } from '~/shared/svg/magic-connect';
import { CurrencyFormatter } from '~/features/connect-with-ui/components/currency-formatter';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import styles from './action-otp-challenge.less';

const getRandomCode = (): string => String(Math.floor(100 + Math.random() * 900));
const getRandomIndex = (arr: string[]): number => Math.floor(Math.random() * arr.length);
const marginTop = ['-33%', '0%', '33%'];

interface ActionOtpChallengeProps {
  transactionAmount: number;
  onSuccess: () => void;
  onError: () => void;
}

export const ActionOtpChallenge: React.FC<ActionOtpChallengeProps> = ({ transactionAmount, onSuccess, onError }) => {
  const { theme } = useTheme();
  const [isValidating, setIsValidating] = useState(false);
  const [isValidationSuccess, setIsValidationSuccess] = useState(false);

  const [marginTopIndex, setMarginTopIndex] = useState(0);
  const [code, setCode] = useState('');

  useEffect(() => {
    const randomIndex = getRandomIndex(marginTop);
    setMarginTopIndex(randomIndex);

    const randomCode = getRandomCode();
    setCode(randomCode);

    trackAction(AnalyticsActionType.ActionOtpChallenge, { status: 'send-transaction-challenge' });
  }, []);

  const { PinCodeInput, pinCodeInputProps } = usePinCode({
    pinLength: 3,
    onComplete: async securityOtp => {
      try {
        setIsValidating(true);

        if (securityOtp === code) {
          setIsValidationSuccess(true);
          onSuccess();
        } else {
          throw new Error('codes do not match');
        }

        setIsValidating(false);
      } catch (e) {
        setIsValidating(false);
        onError();
      }
    },
  });

  const renderSuccessCheckmark = () => (theme.isDarkTheme ? SuccessCheckmarkDarkmode : SuccessCheckmark);

  return (
    <div className={styles.Overlay}>
      <div
        className={styles.ConfirmationContainer}
        style={{
          marginTop: marginTop[marginTopIndex],
          backgroundColor: theme.isDarkTheme ? 'var(--slate3)' : 'var(--ink10)',
        }}
      >
        <div className={styles.ConfirmationText}>
          Please enter the code <span className={styles.ConfirmationCode}>{code}</span> to confirm this transaction
          {!!transactionAmount && (
            <>
              {' '}
              for <CurrencyFormatter value={transactionAmount} />
            </>
          )}
        </div>
        <Spacer size={16} orientation="vertical" />
        {isValidating && <LoadingSpinner small />}
        {!isValidating && !isValidationSuccess && (
          <div className={styles.PinCodeInputWrapper}>
            <PinCodeInput {...pinCodeInputProps} />
          </div>
        )}
        {isValidationSuccess && <Icon aria-label={i18n.generic.success.toString()} type={renderSuccessCheckmark()} />}{' '}
      </div>
    </div>
  );
};
