import React, { useEffect, useState } from 'react';
import { Flex, Icon, MonochromeIcons, Spacer, Typography } from '@magiclabs/ui';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { Network } from '~/features/connect-with-ui/components/network';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { connectStore } from '~/features/connect-with-ui/store';
import { SelectableWallet } from '~/features/connect-with-ui/components/selectable-wallet';
import { connectLogout } from '~/features/connect-with-ui/store/connect.thunks';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { WalletInfoDrawer } from './wallet-info-drawer';
import { ButtonWithLogoutHover } from './button-with-logout-hover';
import { setWalletConnectionsInfo } from '~/features/connect-with-ui/store/connect.actions';
import styles from './wallet-selection-page.less';

export const WalletSelectionPage = () => {
  const { navigateTo } = useControllerContext();
  const { theme } = useTheme();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [shouldPauseCycle, setShouldPauseCycle] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>();
  const walletConnectionsInfo = connectStore.hooks.useSelector(state => state.walletConnectionsInfo);
  const connectWallet = walletConnectionsInfo?.connectWallets[0];
  const hasAuthWallets = walletConnectionsInfo?.authWallets && walletConnectionsInfo?.authWallets?.length > 0;
  const [duplicateClientDetails, setDuplicateClientDetails] = useState([]);

  const alphabeticallySortedWallets = () => {
    return walletConnectionsInfo?.authWallets.sort((a, b) =>
      a.client_details.app_name.localeCompare(b.client_details.app_name),
    );
  };

  const sortedWallets = alphabeticallySortedWallets();

  const checkForMultipleWalletsForSameAuthApp = () => {
    if (sortedWallets) {
      const results: any = [];
      for (let i = 0; i < sortedWallets.length - 1; i++) {
        if (sortedWallets[i + 1].client_details.client_id === sortedWallets[i].client_details.client_id) {
          results.push(sortedWallets[i].client_details.client_id);
        }
      }
      setDuplicateClientDetails(results);
    }
  };

  useEffect(() => {
    checkForMultipleWalletsForSameAuthApp();
    // Clear wallet connections on unmount
    return () => {
      connectStore.dispatch(setWalletConnectionsInfo(undefined));
    };
  }, []);

  const handleToggleWalletInfoDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleLogout = () => {
    connectStore.dispatch(connectLogout());
    navigateTo('login-prompt');
  };

  const getLoginLabel = authWallet => {
    let label;
    duplicateClientDetails.forEach(clientId => {
      if (authWallet.client_details.client_id === clientId) {
        label = authWallet.login_method;
      }
    });
    return label;
  };

  return (
    <div>
      <ModalHeader
        rightAction={<CancelActionButton onClick={handleLogout} />}
        header={<Network />}
        leftAction={<ButtonWithLogoutHover />}
      />
      <Spacer size={30} orientation="vertical" />
      <BasePage>
        <div style={{ textAlign: 'left' }}>
          <ThemeLogo height={40} style={{ borderRadius: '50%' }} />
          <Spacer size={10} orientation="vertical" />
          <Flex.Row alignItems="center">
            <Typography.BodyLarge className={styles.chooseWalletHeader} weight="700">
              Choose a wallet
            </Typography.BodyLarge>
            <Spacer size={10} orientation="horizontal" />
            <Icon
              size={18}
              type={MonochromeIcons.QuestionFilled}
              color="#B6B4BA"
              onClick={handleToggleWalletInfoDrawer}
              style={{ cursor: 'pointer' }}
            />
          </Flex.Row>
          <Spacer size={5} orientation="vertical" />
          <Typography.BodyMedium className={styles.text} weight="400">
            Select a wallet to use on {theme.appName}
          </Typography.BodyMedium>
        </div>
        <Spacer size={10} orientation="vertical" />
        <div data-aria-disabled={!!selectedWalletId} className={styles.walletsContainer}>
          {connectWallet && (
            <SelectableWallet
              wallet={connectWallet}
              isConnectWallet
              setSelectedWalletId={setSelectedWalletId}
              selectedWalletId={selectedWalletId}
              setShouldPauseCycle={setShouldPauseCycle}
              shouldPauseCycle={shouldPauseCycle}
            />
          )}
          {hasAuthWallets && (
            <>
              <Spacer size={10} orientation="vertical" />
              <Typography.BodySmall
                weight="500"
                className={`${styles.appWalletsText} ${selectedWalletId ? styles.disabled : ''}`}
              >
                App Wallets
              </Typography.BodySmall>
            </>
          )}
          <div className={styles.authWalletContainer}>
            {sortedWallets?.map(authWallet => {
              return (
                <div key={authWallet.wallet_id}>
                  <SelectableWallet
                    setSelectedWalletId={setSelectedWalletId}
                    wallet={authWallet}
                    selectedWalletId={selectedWalletId}
                    loginLabel={getLoginLabel(authWallet)}
                    setShouldPauseCycle={setShouldPauseCycle}
                    shouldPauseCycle={shouldPauseCycle}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </BasePage>
      <WalletInfoDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        handleToggleDrawer={handleToggleWalletInfoDrawer}
      />
    </div>
  );
};
