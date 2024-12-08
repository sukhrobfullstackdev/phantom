import React, { useContext } from 'react';
import { Flex, Spacer, Typography } from '@magiclabs/ui';
import { ethers } from 'ethers';
import { getFiatValue } from '~/features/connect-with-ui/utils/bn-math';
import { CurrencyFormatter } from '~/features/connect-with-ui/components/currency-formatter';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import { TokenFormatter } from '~/features/connect-with-ui/components/token-formatter';
import { NetworkFeeTooltip } from '~/features/connect-with-ui/components/network-fee-tooltip';
import styles from './construct-transaction-network-fee.less';

export const ConstructTransactionNetworkFee = ({ networkFeeInWei, isInputFormatFiat, price }) => {
  const chainInfo = useContext(MultiChainInfoContext);
  return (
    <>
      {networkFeeInWei ? (
        <Flex.Row justifyContent="space-between" alignItems="center" className={styles.networkFeeContainer}>
          <Flex.Row justifyContent="flex-start" alignItems="center">
            <Typography.BodySmall weight="500">Network fee (estimated)</Typography.BodySmall>
            <Spacer size={4} orientation="horizontal" />
            <NetworkFeeTooltip />
          </Flex.Row>
          <Typography.BodySmall weight="400">
            {isInputFormatFiat ? (
              <CurrencyFormatter value={getFiatValue(networkFeeInWei, price || '0')} />
            ) : (
              <TokenFormatter value={Number(ethers.utils.formatUnits(networkFeeInWei))} token={chainInfo?.currency} />
            )}
          </Typography.BodySmall>
        </Flex.Row>
      ) : null}
    </>
  );
};
