import React from 'react';
import { Erc20TokenAmountAvailable } from './erc20-token-amount';
import { NativeTokenAmountAvailable } from './native-token-amount';
import { FlowUsdAmountAvailable } from './flow-usdc-token-amount';

interface WalletAmountAvailableProps {
  contractAddress?: string;
  symbol?: string;
  balance?: string;
  decimals?: number;
  logo?: string | undefined;
  isInputFormatFiat: boolean;
  isSendFlowUsdc?: boolean;
}

export const WalletAmountAvailable = ({
  contractAddress,
  symbol,
  decimals,
  logo,
  balance,
  isInputFormatFiat,
  isSendFlowUsdc,
}: WalletAmountAvailableProps) => {
  return (
    <div>
      {contractAddress && (
        <Erc20TokenAmountAvailable logo={logo} decimals={decimals} balance={balance} symbol={symbol} />
      )}
      {!contractAddress && !isSendFlowUsdc && <NativeTokenAmountAvailable isInputFormatFiat={isInputFormatFiat} />}
      {!contractAddress && isSendFlowUsdc && <FlowUsdAmountAvailable logo={logo} balance={balance} symbol={symbol} />}
    </div>
  );
};

WalletAmountAvailable.defaultProps = {
  contractAddress: '',
  symbol: '',
  balance: '',
};
