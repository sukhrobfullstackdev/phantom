import { Spacer } from '@magiclabs/ui';
import React from 'react';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { PayWithPaypalCta } from '~/features/blockchain-ui-methods/components/wallet-fiat-onramp-clients/wallet-fiat-onramp-paypal/pay-with-paypal-cta';
import { PaypalFiatOnrampFiatAmountInput } from '~/features/blockchain-ui-methods/components/wallet-fiat-onramp-clients/wallet-fiat-onramp-paypal/paypal-onramp-fiat-amount-input';
import { WalletBalanceBanner } from '~/features/connect-with-ui/components/wallet-balance-banner';

interface PayPalComposePurchaseProps {
  fiatAmount: string;
  setFiatAmount: (value: React.SetStateAction<string>) => void;
  validationError: string;
  setValidationError: (value: React.SetStateAction<string>) => void;
  isLoading: boolean;
  isButtonDisabled: boolean;
  createOrder: () => void;
}

const PayPalComposePurchase = ({
  fiatAmount,
  setFiatAmount,
  validationError,
  setValidationError,
  isLoading,
  isButtonDisabled,
  createOrder,
}: PayPalComposePurchaseProps) => {
  const { theme } = useTheme();

  const handleClick = async () => {
    if (+fiatAmount < 5) {
      setValidationError('Minimum purchase amount is $5');
    } else if (+fiatAmount > 10000) {
      setValidationError('Maximum purchase amount is $10,000');
    } else {
      createOrder();
    }
  };

  return (
    <>
      <WalletBalanceBanner />
      <Spacer size={25} orientation="vertical" />
      <div style={{ alignSelf: 'flex-start', fontWeight: 500, fontSize: '14px', lineHeight: '24px' }}>You pay</div>
      <Spacer size={8} orientation="vertical" />
      <PaypalFiatOnrampFiatAmountInput
        value={fiatAmount}
        errorMsg={validationError}
        onChange={e => {
          setFiatAmount(e.target.value);
          setValidationError('');
        }}
        isDarkTheme={theme.isDarkTheme}
        disabled={isLoading} // input should only be disabled on loading, button is disabled on other cases
      />
      <Spacer size={43} orientation="vertical" />
      <PayWithPaypalCta isLoading={isLoading} disabled={isButtonDisabled} onClick={handleClick} />
    </>
  );
};

export default PayPalComposePurchase;
