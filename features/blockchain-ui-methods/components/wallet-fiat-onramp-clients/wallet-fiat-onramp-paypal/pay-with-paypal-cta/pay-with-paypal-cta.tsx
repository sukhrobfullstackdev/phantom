import React from 'react';
import styles from '~/features/blockchain-ui-methods/components/wallet-fiat-onramp-clients/wallet-fiat-onramp-paypal/pay-with-paypal-cta/pay-with-paypal-cta.less';
import { PayPalLabel } from '~/features/blockchain-ui-methods/components/wallet-fiat-onramp-clients/wallet-fiat-onramp-paypal/cta-labels';
import { Spacer } from '@magiclabs/ui';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner/loading-spinner';

interface PayWithPaypalCtaProps {
  onClick: () => void;
  disabled: boolean;
  height: number;
  isLoading: boolean;
}

export const PayWithPaypalCta = (props: PayWithPaypalCtaProps) => {
  const { onClick, disabled, height, isLoading } = props;
  return (
    <div className={`${styles.PayWithPaypalCta} ${disabled ? styles.Disabled : ''}`}>
      <button disabled={disabled} onClick={onClick} style={{ height: `${height}px` }}>
        {isLoading ? (
          <LoadingSpinner color="black" size={22} strokeSize={2} />
        ) : (
          <>
            Pay with
            <Spacer size={4} orientation="horizontal" /> {PayPalLabel}
          </>
        )}
      </button>
    </div>
  );
};

PayWithPaypalCta.defaultProps = {
  onClick: () => {},
  isDarkTheme: false,
  disabled: false,
  height: 48,
};
