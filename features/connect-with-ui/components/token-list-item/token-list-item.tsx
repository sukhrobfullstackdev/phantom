import React from 'react';
import { Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import { ethers } from 'ethers';
import { TokenFormatter } from '../token-formatter';
import styles from './token-list-item.less';
import { ERC20TokenIcon } from '~/shared/svg/magic-connect';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { TrackingButton } from '../tracking-button';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { NavigationCard } from '../navigation-card';
import { store } from '~/app/store';
import { setSendFundsRouteParams } from '~/app/store/user/user.actions';
import { AnalyticsActionType } from '~/app/libs/analytics';
import { ethDecimalsToUnit } from '../../utils/transaction-type-utils';
import { isFlowWalletType } from '~/app/libs/network';

interface TokenListItemPropsProps {
  balance: string;
  symbol: string;
  decimals: number;
  isTokenSelectionPage?: boolean;
  logo: string | undefined;
  name: string;
}

export const TokenListItemOverload = ({
  name,
  logo,
  balance,
  symbol,
  decimals,
  contractAddress,
  isTokenSelectionPage,
  isSendFlowUsdc,
}) => {
  const { navigateTo } = useControllerContext();

  const loadTokenParamsForWalletSendFundsPage = () => {
    store.dispatch(
      setSendFundsRouteParams({
        symbol,
        decimals,
        contractAddress,
        balance,
        logo,
        isSendFlowUsdc,
      }),
    );
    navigateTo('wallet-send-funds', eventData);
  };

  return isTokenSelectionPage ? (
    <NavigationCard onClick={loadTokenParamsForWalletSendFundsPage}>
      <TrackingButton actionName={AnalyticsActionType.TokenSelected}>
        <TokenListItem
          name={name}
          logo={logo}
          decimals={decimals}
          balance={balance}
          symbol={symbol}
          isTokenSelectionPage={isTokenSelectionPage}
        />
      </TrackingButton>
    </NavigationCard>
  ) : (
    <TokenListItem
      name={name}
      logo={logo}
      decimals={decimals}
      balance={balance}
      symbol={symbol}
      isTokenSelectionPage={isTokenSelectionPage}
    />
  );
};

export const TokenListItem = ({
  name,
  logo,
  balance,
  decimals,
  symbol,
  isTokenSelectionPage,
}: TokenListItemPropsProps) => {
  return (
    <Flex.Row justifyContent="space-between" className={isTokenSelectionPage ? '' : styles.container}>
      <Flex.Row alignItems="center">
        {logo ? (
          <img src={logo} height={30} width={30} alt={`${symbol} logo`} style={{ borderRadius: '50%' }} />
        ) : (
          <Icon type={ERC20TokenIcon} size={30} />
        )}
        <Spacer size={8} orientation="horizontal" />
        <Typography.BodyMedium style={{ textAlign: 'left' }} weight="500">
          {name || symbol || ''}
        </Typography.BodyMedium>
      </Flex.Row>
      <Flex.Row alignItems="center" style={{ textAlign: 'right' }}>
        <Typography.BodySmall weight="400" className={styles.tokenBalance}>
          <TokenFormatter
            value={Number(
              isFlowWalletType() ? balance : ethers.utils.formatUnits(balance, ethDecimalsToUnit[decimals] || 'ether'),
            )}
            token={symbol || ''}
          />
        </Typography.BodySmall>
      </Flex.Row>
    </Flex.Row>
  );
};

TokenListItem.defaultProps = {
  isTokenSelectionPage: false,
};
