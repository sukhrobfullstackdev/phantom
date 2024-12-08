import React, { useContext } from 'react';
import { Flex, Icon, Skeleton, Spacer, Typography } from '@magiclabs/ui';
import { TokenFormatter } from '../token-formatter';
import { CurrencyFormatter } from '../currency-formatter';
import styles from './native-token-list-item.less';
import { useGetNativeTokenBalance } from '../../hooks/useGetNativeTokenBalance';
import { useGetTokenPrice } from '../../hooks/useGetTokenPrice';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { TrackingButton } from '../tracking-button';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { NavigationCard } from '../navigation-card';
import LedgerBalance from '~/app/libs/ledger-balance';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import { AnalyticsActionType } from '~/app/libs/analytics';

interface NativeTokenListItemProps {
  isTokenSelectionPage?: boolean;
}

export const NativeTokenListItemOverload = ({ isTokenSelectionPage }) => {
  const { navigateTo } = useControllerContext();

  return isTokenSelectionPage ? (
    <NavigationCard onClick={() => navigateTo('wallet-send-funds', eventData)}>
      <TrackingButton actionName={AnalyticsActionType.TokenSelected}>
        <NativeTokenListItem isTokenSelectionPage={isTokenSelectionPage} />
      </TrackingButton>
    </NavigationCard>
  ) : (
    <NativeTokenListItem isTokenSelectionPage={isTokenSelectionPage} />
  );
};

export const NativeTokenListItem = ({ isTokenSelectionPage }: NativeTokenListItemProps) => {
  const balance: string | undefined = useGetNativeTokenBalance();
  const price: string | undefined = useGetTokenPrice();
  const chainInfo = useContext(MultiChainInfoContext);
  const { tokenIcon, name } = chainInfo;
  const ledgerBalance = new LedgerBalance();

  return (
    <Flex.Row justifyContent="space-between" className={isTokenSelectionPage ? '' : styles.container}>
      {chainInfo && (
        <Flex.Row alignItems="center">
          <Icon type={tokenIcon} size={32} />
          <Spacer size={8} orientation="horizontal" />
          <Typography.BodyMedium weight="500">{name}</Typography.BodyMedium>
        </Flex.Row>
      )}
      <div style={{ textAlign: 'right' }}>
        <Typography.BodySmall weight="500">
          {balance !== undefined && price !== undefined ? (
            <CurrencyFormatter value={ledgerBalance.calculateRate()(balance, price)} />
          ) : (
            <Skeleton shape="pill" height="20px" width="50px" />
          )}
        </Typography.BodySmall>
        <Typography.BodySmall weight="400" className={styles.tokenBalance}>
          {balance !== undefined ? (
            <TokenFormatter value={ledgerBalance.balanceToShow(balance)} token={chainInfo?.currency} />
          ) : (
            <Skeleton shape="pill" height="20px" width="50px" />
          )}
        </Typography.BodySmall>
      </div>
    </Flex.Row>
  );
};

NativeTokenListItem.defaultProps = {
  isTokenSelectionPage: false,
};
