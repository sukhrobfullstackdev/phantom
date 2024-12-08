import React from 'react';
import { CallToAction, Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { AppName } from '~/features/connect-with-ui/components/app-name';
import { ErrorIcon } from '~/shared/svg/magic-connect';
import { connectStore } from '~/features/connect-with-ui/store';
import { SubText } from '~/features/connect-with-ui/components/sub-text';
import { isMobileUserAgent } from '~/app/libs/platform';
import styles from './third-party-wallet-connection-failed-page.less';

export const ThirdPartyWalletConnectionFailedPage = () => {
  const { navigateTo } = useControllerContext();
  const { selectedThirdPartyWallet, thirdPartyWalletEnv } = connectStore.hooks.useSelector(state => state);
  const shouldReturnToQrCodePage =
    selectedThirdPartyWallet?.walletProvider === 'WALLET_CONNECT' ||
    (!isMobileUserAgent() &&
      !thirdPartyWalletEnv?.isMetaMaskInstalled &&
      selectedThirdPartyWallet?.walletProvider === 'METAMASK') ||
    (!isMobileUserAgent() &&
      !thirdPartyWalletEnv?.isCoinbaseWalletInstalled &&
      selectedThirdPartyWallet?.walletProvider === 'COINBASE_WALLET');

  const backRoute = shouldReturnToQrCodePage ? 'third-party-wallet-qr-code-page' : 'third-party-wallet-pending-page';

  return (
    <div>
      <ModalHeader
        leftAction={<BackActionButton onClick={() => navigateTo('third-party-wallet-connection-page', eventData)} />}
        rightAction={<CancelActionButton />}
        header={
          <Typography.BodySmall className={styles.text} weight="400" tagOverride="span">
            Sign in to <AppName />
          </Typography.BodySmall>
        }
      />
      <Spacer size={30} orientation="vertical" />
      <Flex.Column alignItems="center">
        <Icon type={ErrorIcon} size={50} />
        <Spacer size={25} orientation="vertical" />
        <Typography.H4>Connection Request Denied</Typography.H4>
        <Spacer size={5} orientation="vertical" />
        <SubText>
          <Typography.BodyMedium weight="400">The request was declined by the wallet</Typography.BodyMedium>
        </SubText>
        <Spacer size={45} orientation="vertical" />
        <CallToAction style={{ width: '100%' }} onClick={() => navigateTo(backRoute, eventData)}>
          Try again
        </CallToAction>
      </Flex.Column>
    </div>
  );
};
