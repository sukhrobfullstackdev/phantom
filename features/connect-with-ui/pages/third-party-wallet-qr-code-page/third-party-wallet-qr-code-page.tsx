import React, { useContext, useEffect, useState } from 'react';
import { QRCode } from 'react-qrcode-logo';
import { Spacer, TextButton, Typography } from '@magiclabs/ui';
import MetaMaskLogo from '~/shared/svg/third-party-wallet/metamask-logo.svg';
import WalletConnectLogo from '~/shared/svg/third-party-wallet/wallet-connect-logo.svg';
import CoinbaseWalletLogo from '~/shared/svg/third-party-wallet/coinbase-wallet-logo.svg';
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
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { SubText } from '~/features/connect-with-ui/components/sub-text/sub-text';
import { ChainInfoContext } from '~/features/connect-with-ui/hooks/chainInfoContext';
import { setThirdPartyWallet } from '~/features/connect-with-ui/store/connect.actions';
import { isMobileUserAgent } from '~/app/libs/platform';
import { handleThirdPartyWalletConnected } from '~/features/connect-with-ui/utils/handle-third-party-wallet-connected';
import styles from './third-party-wallet-qr-code-page.less';
import { CreateNewWalletDrawer } from '../../components/create-new-wallet-drawer';

export const ThirdPartyWalletQrCodePage = () => {
  const { navigateTo } = useControllerContext();
  const payload = useUIThreadPayload();
  const walletProvider = connectStore.hooks.useSelector(state => state.selectedThirdPartyWallet);
  const [uri, setUri] = useState();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const chainInfo = useContext(ChainInfoContext);

  const handleOpenDrawer = () => {
    setIsDrawerOpen(prev => !prev);
  };

  const dispatchUriEvent = ({ showModal, wallet }: { showModal: boolean; wallet: string }) => {
    if (payload && walletProvider) {
      store.dispatch(
        SystemThunks.emitJsonRpcEvent({
          payload,
          event: 'wallet_selected',
          params: [{ wallet, showModal }],
        }),
      );
    }
  };

  const listenForUriReady = () => {
    if (payload && walletProvider) {
      RpcIntermediaryEventService.on('uri' as any, payload, async (args: any) => {
        setUri(args);
      });
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

  const getLogoUrl = () => {
    let logoUrl;
    switch (walletProvider?.walletProvider) {
      case 'COINBASE_WALLET':
        logoUrl = CoinbaseWalletLogo;
        break;
      case 'METAMASK':
        logoUrl = MetaMaskLogo;
        break;
      case 'WALLET_CONNECT':
        logoUrl = WalletConnectLogo;
        break;
    }
    return logoUrl;
  };

  useEffect(() => {
    listenForUriReady();
    listenForWalletRejected();
    listenForWalletConnected();
    if (walletProvider?.walletProvider === 'COINBASE_WALLET') {
      dispatchUriEvent({ showModal: false, wallet: 'coinbase_wallet' });
    } else {
      dispatchUriEvent({ showModal: isMobileUserAgent(), wallet: 'wallet_connect' });
    }
  }, []);

  const nameFormatted = {
    METAMASK: 'MetaMask',
    WALLET_CONNECT: 'WalletConnect',
    COINBASE_WALLET: 'Coinbase Wallet',
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
      <Spacer size={30} orientation="vertical" />
      <div style={{ textAlign: 'center' }}>
        {uri ? (
          <div>
            <div className={styles.qrCodeWrapper}>
              <QRCode
                value={uri}
                qrStyle="dots"
                eyeRadius={7}
                size={260}
                removeQrCodeBehindLogo
                logoImage={getLogoUrl()}
                logoHeight={48}
                logoWidth={48}
              />
            </div>
            <Spacer size={10} orientation="vertical" />
            {walletProvider && (
              <Typography.H4>Connect with {nameFormatted[walletProvider.walletProvider]}</Typography.H4>
            )}
            <Spacer size={10} orientation="vertical" />
            <SubText>
              <Typography.BodyMedium weight="400" style={{ maxWidth: '80%', margin: 'auto' }}>
                Scan the QR code with your mobile wallet to connect
              </Typography.BodyMedium>
            </SubText>
            <Spacer size={20} orientation="vertical" />
            {walletProvider?.walletProvider === 'WALLET_CONNECT' ? (
              <TextButton
                size="sm"
                role="none"
                onClick={() => {
                  dispatchUriEvent({ showModal: true, wallet: 'wallet_connect' });
                }}
                onKeyPress={() => {
                  dispatchUriEvent({ showModal: true, wallet: 'wallet_connect' });
                }}
              >
                More ways to connect
              </TextButton>
            ) : (
              walletProvider && (
                <TextButton size="sm" onClick={handleOpenDrawer} onKeyPress={handleOpenDrawer}>
                  Don't have {nameFormatted[walletProvider.walletProvider]}?
                </TextButton>
              )
            )}
            {(walletProvider?.walletProvider === 'COINBASE_WALLET' ||
              walletProvider?.walletProvider === 'METAMASK') && (
              <CreateNewWalletDrawer
                isDrawerOpen={isDrawerOpen}
                setIsDrawerOpen={setIsDrawerOpen}
                handleOpenDrawer={handleOpenDrawer}
                wallet={walletProvider.walletProvider.toLocaleLowerCase()}
              />
            )}
          </div>
        ) : (
          <div>
            <Spacer size={20} orientation="vertical" />
            <LoadingSpinner />
            <Spacer size={20} orientation="vertical" />
          </div>
        )}
      </div>
    </div>
  );
};
