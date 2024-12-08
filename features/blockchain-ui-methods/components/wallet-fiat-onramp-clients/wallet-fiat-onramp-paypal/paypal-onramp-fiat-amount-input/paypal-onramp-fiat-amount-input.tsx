import React from 'react';
import styles from './paypal-onramp-fiat-amount-input.less';
import { Spacer, Flex } from '@magiclabs/ui';

interface PaypalFiatOnrampFiatAmountInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errorMsg: string;
  isDarkTheme: boolean;
  disabled: boolean;
}

export const PaypalFiatOnrampFiatAmountInput: React.FC<PaypalFiatOnrampFiatAmountInputProps> = ({
  value,
  onChange,
  errorMsg,
  isDarkTheme,
  disabled,
}) => {
  return (
    <>
      <div
        className={`${styles.PaypalFiatOnrampAmountInput} ${
          isDarkTheme ? styles.AmountInputDark : styles.AmountInputLight
        } ${errorMsg ? styles.OnrampAmountInputHasError : ''} ${disabled ? styles.Disabled : ''}`}
      >
        <div className={styles.AmountLabel}>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>$</div>
          <input
            disabled={disabled}
            value={value}
            onChange={onChange}
            type="number"
            style={{
              color: isDarkTheme ? 'var(--white)' : 'var(--ink100)',
              background: 'inherit',
            }}
          />
        </div>
        <div style={{ color: 'var(--ink70)' }}>USD</div>
      </div>
      {errorMsg && (
        <Flex
          style={{
            color: 'var(--redDarker)',
            fontWeight: '400',
            justifySelf: 'flex-start',
            fontSize: '14px',
            marginTop: '8px',
          }}
        >
          {errorMsg}
        </Flex>
      )}
    </>
  );
};
