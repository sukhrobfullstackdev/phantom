import React, { useContext, useEffect } from 'react';
import { Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { AppName } from '~/features/connect-with-ui/components/app-name';
import { connectStore } from '~/features/connect-with-ui/store';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { store } from '~/app/store';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { RpcIntermediaryEventService } from '~/app/services/rpc-intermediary-event';
import { resolvePayload } from '~/app/rpc/utils';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { MagicGradientIcon } from '~/shared/svg/magic-connect';
import { ChainInfoContext } from '~/features/connect-with-ui/hooks/chainInfoContext';
import { setThirdPartyWallet } from '~/features/connect-with-ui/store/connect.actions';
import { handleThirdPartyWalletConnected } from '~/features/connect-with-ui/utils/handle-third-party-wallet-connected';
import styles from './third-party-wallet-pending-page.less';

export const ThirdPartyWalletPendingPage = () => {
  const { navigateTo } = useControllerContext();
  const payload = useUIThreadPayload();
  const walletProvider = connectStore.hooks.useSelector(state => state.selectedThirdPartyWallet);
  const chainInfo = useContext(ChainInfoContext);

  const triggerWalletConnection = () => {
    if (payload && walletProvider) {
      store.dispatch(
        SystemThunks.emitJsonRpcEvent({
          payload,
          event: 'wallet_selected',
          params: [{ wallet: walletProvider.walletProvider.toLocaleLowerCase() }],
        }),
      );
    }
  };

  const listenForWalletConnected = () => {
    if (payload && walletProvider) {
      RpcIntermediaryEventService.on('wallet_connected' as any, payload, async (args: any) => {
        connectStore.dispatch(setThirdPartyWallet(walletProvider.walletProvider));
        await handleThirdPartyWalletConnected(args[0], chainInfo?.chainId || 1, walletProvider.walletProvider);
        await resolvePayload(payload, args);
      });
    }
  };

  const listenForWalletRejected = () => {
    if (payload && walletProvider) {
      RpcIntermediaryEventService.on('wallet_rejected' as any, payload, async (args: any) => {
        navigateTo('third-party-wallet-failed-page', eventData);
      });
    }
  };

  useEffect(() => {
    listenForWalletConnected();
    listenForWalletRejected();
    triggerWalletConnection();
  }, []);

  const nameFormatted = {
    METAMASK: 'MetaMask',
    WALLET_CONNECT: 'WalletConnect',
    COINBASE_WALLET: 'Coinbase Wallet',
  };

  const Ellipses = () => {
    return <div className={styles.dotFlashing} />;
  };

  return (
    <div>
      <ModalHeader
        leftAction={<BackActionButton onClick={() => navigateTo('third-party-wallet-connection-page', eventData)} />}
        rightAction={<CancelActionButton />}
        header={
          <Typography.BodySmall weight="400" className={styles.text} tagOverride="span">
            Sign in to <AppName />
          </Typography.BodySmall>
        }
      />
      {walletProvider && (
        <>
          <Spacer size={40} orientation="vertical" />
          <Flex.Row alignItems="center" justifyContent="center">
            <ThemeLogo height={48} width={48} />
            <Spacer size={16} orientation="horizontal" />
            <Ellipses />
            <Spacer size={16} orientation="horizontal" />
            <Icon type={MagicGradientIcon} size={60} />
            <Spacer size={16} orientation="horizontal" />
            <Ellipses />
            <Spacer size={16} orientation="horizontal" />
            <Icon type={walletProvider?.icon} size={48} />
          </Flex.Row>
          <Spacer size={35} orientation="vertical" />
          <div style={{ textAlign: 'center' }}>
            <Typography.BodyLarge>Requesting Connection</Typography.BodyLarge>
            <Spacer size={5} orientation="vertical" />
            <Typography.BodyMedium weight="400" className={styles.text}>
              Confirm connection in {nameFormatted[walletProvider?.walletProvider]}
            </Typography.BodyMedium>
          </div>
        </>
      )}
      <Spacer size={10} orientation="vertical" />
    </div>
  );
};
