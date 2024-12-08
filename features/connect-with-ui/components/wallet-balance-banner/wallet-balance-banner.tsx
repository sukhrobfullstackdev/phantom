import { Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import React, { useContext } from 'react';
import LedgerBalance from '~/app/libs/ledger-balance';
import { useGetNativeTokenBalance } from '~/features/connect-with-ui/hooks/useGetNativeTokenBalance';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import { TokenFormatter } from '../token-formatter';
import { formatAppName } from '../../utils/format-app-name';
import { store } from '~/app/store';
import { AuthWalletType } from '../../utils/get-wallet-connections';
import { MagicGradientIcon } from '~/shared/svg/magic-connect';
import { WalletAppLogo } from '../wallet-app-logo';
import styles from './wallet-balance-banner.less';

export const WalletBalanceBanner = () => {
  const balance: string | undefined = useGetNativeTokenBalance();
  const chainInfo = useContext(MultiChainInfoContext);
  const ledgerBalance = new LedgerBalance();
  const { activeAuthWallet } = store.hooks.useSelector(state => state.User);
  const isAuthWallet = !!activeAuthWallet;
  const appName = formatAppName(isAuthWallet ? activeAuthWallet?.client_details?.app_name || 'First App' : 'Magic');
  const authAppAssetUri = (activeAuthWallet as AuthWalletType)?.client_details?.asset_uri;
  const authWalletTheme = (activeAuthWallet as AuthWalletType)?.client_details?.theme_color;

  return (
    <div className={styles.container}>
      <Flex.Row alignItems="center">
        <Flex.Row alignItems="center">
          {activeAuthWallet ? (
            <WalletAppLogo
              authWalletTheme={authWalletTheme}
              authAppAssetUri={authAppAssetUri}
              appName={appName}
              size={24}
            />
          ) : (
            <Icon type={MagicGradientIcon} size={24} />
          )}
        </Flex.Row>
        <Spacer size={10} orientation="horizontal" />
        <Typography.BodyMedium weight="500" style={{ textAlign: 'left' }}>
          {appName} Wallet
        </Typography.BodyMedium>
      </Flex.Row>
      <div>
        <TokenFormatter value={ledgerBalance.balanceToShow(balance || '0')} token={chainInfo?.currency} />
      </div>
    </div>
  );
};
