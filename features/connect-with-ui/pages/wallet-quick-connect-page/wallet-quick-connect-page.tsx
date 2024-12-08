import React, { useContext, useEffect, useState } from 'react';
import { CallToAction, Flex, Icon, MonochromeIcons, Spacer, Typography } from '@magiclabs/ui';
import { ethers } from 'ethers';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { Network } from '~/features/connect-with-ui/components/network';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { resolvePayload } from '~/app/rpc/utils';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { connectStore } from '~/features/connect-with-ui/store';
import { useSelector } from '~/app/ui/hooks/redux-hooks';
import { connectLogout } from '~/features/connect-with-ui/store/connect.thunks';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { LoadingIcon, MagicGradientIcon } from '~/shared/svg/magic-connect';
import { CheckmarkIcon } from '~/shared/svg/settings';
import { selectWallet } from '~/features/connect-with-ui/utils/select-wallet';
import { AuthWalletType } from '~/features/connect-with-ui/utils/get-wallet-connections';
import { setWalletConnectionsInfo } from '~/features/connect-with-ui/store/connect.actions';
import { formatAppName } from '~/features/connect-with-ui/utils/format-app-name';
import { ButtonWithLogoutHover } from '../wallet-selection-page/button-with-logout-hover';
import { useGetNativeTokenBalance } from '~/features/connect-with-ui/hooks/useGetNativeTokenBalance';
import { TokenFormatter } from '~/features/connect-with-ui/components/token-formatter';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import { WalletAppLogo } from '~/features/connect-with-ui/components/wallet-app-logo';
import styles from './wallet-quick-connect-page.less';
import { store } from '~/app/store';
import { setActiveAuthWallet, setWalletQuickConnectRouteParams } from '~/app/store/user/user.actions';
import { emitIdToken } from '../../hooks/useLoginFormPages';
import { AuthThunks } from '~/app/store/auth/auth.thunks';
import { toChecksumAddress } from '~/app/libs/web3-utils';

export const WalletQuickConnectPage = () => {
  const payload = useUIThreadPayload();
  const { theme } = useTheme();
  const { Auth } = useSelector(state => state);
  const { navigateTo } = useControllerContext();
  const { quickConnectRouteParams: lastUsedWallet } = store.hooks.useSelector(state => state.User);
  const balanceInWei = useGetNativeTokenBalance(lastUsedWallet?.public_address);
  const balance = Number(ethers.utils.formatUnits(balanceInWei || '0')).toString();
  const [isSwitchWalletsDisabled, setIsSwitchWalletsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [connectButtonHover, setConnectButtonHover] = useState(false);
  const chainInfo = useContext(MultiChainInfoContext);
  const appName = formatAppName((lastUsedWallet as AuthWalletType).client_details?.app_name || 'Magic');
  const authAppAssetUri = (lastUsedWallet as AuthWalletType).client_details?.asset_uri;
  const authWalletTheme = (lastUsedWallet as AuthWalletType).client_details?.theme_color;
  const isConnect = !(lastUsedWallet as AuthWalletType).client_details?.app_name;
  const walletId = lastUsedWallet?.wallet_id;

  useEffect(() => {
    return () => {
      store.dispatch(setWalletQuickConnectRouteParams(undefined));
    };
  }, []);

  const handleLogout = () => {
    connectStore.dispatch(connectLogout());
    navigateTo('login-prompt');
  };

  const switchWallet = () => {
    navigateTo('wallet-selection-page');
  };

  const connectWallet = async () => {
    if (isLoading || isConfirmed || !payload) return;
    setIsSwitchWalletsDisabled(true);
    setIsLoading(true);
    const newActiveWallet = await selectWallet(Auth.userID, walletId, isConnect ? 'connect' : 'magic');
    setIsLoading(false);
    setIsConfirmed(true);
    if (newActiveWallet) {
      // Set connect store with auth wallet information
      if (!isConnect) {
        await store.dispatch(setActiveAuthWallet(lastUsedWallet as AuthWalletType));
        await store.dispatch(AuthThunks.populateUserCredentials());
      }
      await emitIdToken();
      // Clear wallet connections
      connectStore.dispatch(setWalletConnectionsInfo(undefined));
      setTimeout(() => {
        return resolvePayload(payload, [toChecksumAddress(newActiveWallet.public_address)]);
      }, 1200);
    }
  };

  return (
    <div>
      <ModalHeader
        rightAction={<CancelActionButton onClick={handleLogout} />}
        header={<Network />}
        leftAction={<ButtonWithLogoutHover />}
      />
      <Spacer size={30} orientation="vertical" />
      <Flex.Column justifyContent="center" alignItems="center">
        <ThemeLogo height={50} width={50} style={{ borderRadius: '50%' }} />
        <Spacer size={20} orientation="vertical" />
        <Typography.BodyLarge className={styles.connectToAppHeader} weight="700">
          Connect to {theme.appName}
        </Typography.BodyLarge>
        <Spacer size={5} orientation="vertical" />
        <Typography.BodyMedium weight="400" className={styles.text} style={{ textAlign: 'center' }}>
          Continue with last-used wallet?
        </Typography.BodyMedium>
        <Spacer size={32} orientation="vertical" />
        <Flex.Column className={styles.activeWalletCard}>
          <Flex.Row alignItems="center" style={{ marginRight: 'auto' }}>
            {isConnect ? (
              <Icon type={MagicGradientIcon} size={40} />
            ) : (
              <WalletAppLogo
                authWalletTheme={authWalletTheme}
                authAppAssetUri={authAppAssetUri}
                appName={appName}
                size={40}
              />
            )}
            <Spacer size={10} orientation="horizontal" />
            <Flex.Column style={{ textAlign: 'left' }}>
              <Typography.BodyMedium weight="500">{appName} Wallet</Typography.BodyMedium>
              <Spacer size={5} orientation="vertical" />
              <span className={styles.text}>
                {balance && <TokenFormatter value={Number(balance)} token={chainInfo?.currency} />}
              </span>
            </Flex.Column>
          </Flex.Row>
          <Spacer size={15} orientation="vertical" />
          <CallToAction
            size="sm"
            onClick={connectWallet}
            className={styles.connectWalletButton}
            onMouseEnter={() => setConnectButtonHover(true)}
            onMouseLeave={() => setConnectButtonHover(false)}
          >
            {!isLoading && !isConfirmed && (
              <Flex.Row alignItems="center">
                <span style={{ marginLeft: '20px' }}>Connect</span>
                {!connectButtonHover && <Spacer size={20} orientation="horizontal" />}
                {connectButtonHover && (
                  <>
                    <Spacer size={6} orientation="horizontal" />
                    <Icon type={MonochromeIcons.ArrowRight} size={14} />
                  </>
                )}
              </Flex.Row>
            )}
            {isLoading && !isConfirmed && <Icon className={styles.loadingSpinner} type={LoadingIcon} size={26} />}
            {isConfirmed && !isLoading && <Icon size={18} type={CheckmarkIcon} />}
          </CallToAction>
        </Flex.Column>
        <Spacer size={20} orientation="vertical" />
        <CallToAction
          size="sm"
          color="secondary"
          onClick={switchWallet}
          disabled={isSwitchWalletsDisabled}
          className={styles.switchWalletBtn}
        >
          Switch wallet
        </CallToAction>
      </Flex.Column>
    </div>
  );
};
