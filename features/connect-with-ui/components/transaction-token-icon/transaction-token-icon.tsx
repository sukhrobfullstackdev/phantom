import React from 'react';
import { Flex, Icon, Skeleton } from '@magiclabs/ui';
import { ERC20TokenIcon } from '~/shared/svg/magic-connect';
import { NativeTokenLogo } from '../native-token-logo';
import { ETH_TRANSFER, FLOW_USDC_TRANSFER, TOKEN_TRANSFER } from '../../utils/transaction-type-utils';

export const TransactionTokenIcon = ({ tokenOverride = '', logo, transactionType, size = 45 }) => {
  const ShowErc20TokenLogo = () => {
    if (logo) {
      return <img src={logo} height={45} width={45} alt="erc20 token logo" style={{ borderRadius: '50%' }} />;
    }
    return <Icon type={ERC20TokenIcon} size={size} />;
  };

  return (
    <Flex.Column horizontal="center">
      {!transactionType && <Skeleton shape="pill" height="48px" width={`${size + 3}px`} />}
      {transactionType === ETH_TRANSFER && <NativeTokenLogo tokenOverride={tokenOverride} size={size} />}
      {(transactionType === TOKEN_TRANSFER || transactionType === FLOW_USDC_TRANSFER) && <ShowErc20TokenLogo />}
    </Flex.Column>
  );
};
