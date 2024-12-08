import React from 'react';
import { Flex, HoverActivatedTooltip, Icon, MonochromeIcons, Spacer, Typography } from '@magiclabs/ui';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { AppName } from '~/features/connect-with-ui/components/app-name';
import { connectStore } from '~/features/connect-with-ui/store';
import { NavigationCard } from '~/features/connect-with-ui/components/navigation-card';
import { setSelectedThirdPartyWallet } from '~/features/connect-with-ui/store/connect.actions';
import { isMobileUserAgent } from '~/app/libs/platform';
import { ExternalLink } from '~/shared/svg/magic-connect';
import { useTheme } from '~/app/ui/hooks/use-theme';
import styles from './third-party-wallet-selection-page.less';

export const ThirdPartyWalletSelectionPage = () => {
  const { navigateTo } = useControllerContext();
  const providers = connectStore.hooks.useSelector(state => state.enabledThirdPartyWallets);
  const userEnv = connectStore.hooks.useSelector(state => state.thirdPartyWalletEnv);
  const isMobile = isMobileUserAgent();
  const theme = useTheme();
  const metamaskNotInstalled = !userEnv?.isMetaMaskInstalled && !isMobile;
  const coinbaseExtensionNotInstalled = !userEnv?.isCoinbaseWalletInstalled && !isMobile;
  const nameFormatted = {
    METAMASK: 'MetaMask',
    WALLET_CONNECT: 'WalletConnect',
    COINBASE_WALLET: 'Coinbase Wallet',
  };

  const decoratedProviderList = providers?.map(provider => {
    return {
      ...provider,
      formattedName: nameFormatted[provider.walletProvider],
      onClick: () => {
        connectStore.dispatch(setSelectedThirdPartyWallet(provider));
        // Temporary - redirect to install metamask url if metamask is not installed and not on mobile
        if (provider.walletProvider === 'METAMASK' && !isMobile && metamaskNotInstalled) {
          return window.open('https://metamask.app.link/dapp');
        }
        // Temporary - redirect to install coinbase url if coinbase is not installed and not on mobile
        if (provider.walletProvider === 'COINBASE_WALLET' && !isMobile && coinbaseExtensionNotInstalled) {
          return window.open(
            'https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad',
          );
        }
        // if (
        //   (provider.walletProvider === 'METAMASK' && metamaskNotInstalled) ||
        //   (provider.walletProvider === 'COINBASE_WALLET' && coinbaseExtensionNotInstalled) ||
        //   provider.walletProvider === 'WALLET_CONNECT'
        // ) {
        //   return navigateTo('third-party-wallet-qr-code-page', eventData);
        // }
        return navigateTo('third-party-wallet-pending-page', eventData);
      },
    };
  });

  const ConnectWalletToolTip = () => {
    return (
      <HoverActivatedTooltip placement="bottom" style={{ display: 'inline-flex' }}>
        <HoverActivatedTooltip.Anchor>
          <Icon size={16} type={MonochromeIcons.QuestionFilled} color="#B6B4BA" />
        </HoverActivatedTooltip.Anchor>
        <HoverActivatedTooltip.Content style={{ width: '180px' }}>
          <Typography.BodySmall weight="400">
            Connecting a wallet allows the site to read the contents of your wallet, like your public address and wallet
            assets.
          </Typography.BodySmall>
        </HoverActivatedTooltip.Content>
      </HoverActivatedTooltip>
    );
  };

  const renderThirdPartyWallets = () => {
    return decoratedProviderList?.map(provider => {
      return (
        <div key={provider.walletProvider}>
          <NavigationCard onClick={provider.onClick}>
            <Flex.Row alignItems="center" justifyContent="space-between">
              <Flex.Row alignItems="center">
                <Icon type={provider.icon} size={25} />
                <Spacer size={10} orientation="horizontal" />
                <Typography.BodyMedium weight="500">{provider.formattedName}</Typography.BodyMedium>
              </Flex.Row>
              <Flex.Row alignItems="center">
                <Typography.BodySmall className={styles.installedLabel}>
                  {provider.installed && !isMobile ? 'INSTALLED' : ''}
                </Typography.BodySmall>
                {!provider.installed && !isMobile ? (
                  <>
                    <Typography.BodySmall className={styles.installedLabel}>DOWNLOAD</Typography.BodySmall>
                    <Spacer size={5} orientation="horizontal" />
                    <Icon
                      prefix="Download"
                      type={ExternalLink}
                      color={theme.theme.isDarkTheme ? '#FFFFFFB8' : '#77767a'}
                    />
                  </>
                ) : (
                  ''
                )}
              </Flex.Row>
            </Flex.Row>
          </NavigationCard>
          <Spacer size={10} orientation="vertical" />
        </div>
      );
    });
  };

  return (
    <div>
      <ModalHeader
        leftAction={<BackActionButton onClick={() => navigateTo('login-prompt', eventData)} />}
        rightAction={<CancelActionButton />}
        header={
          <Typography.BodySmall weight="400" className={styles.text} tagOverride="span">
            Sign in to <AppName />
          </Typography.BodySmall>
        }
      />
      <Spacer size={40} orientation="vertical" />
      <Flex.Row alignItems="center">
        <Typography.BodyLarge>Connect a wallet</Typography.BodyLarge>
        <Spacer size={5} orientation="horizontal" />
        <ConnectWalletToolTip />
      </Flex.Row>
      <Spacer size={20} orientation="vertical" />
      {renderThirdPartyWallets()}
    </div>
  );
};
