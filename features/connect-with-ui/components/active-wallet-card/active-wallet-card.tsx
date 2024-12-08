import React, { useEffect, useState } from 'react';
import { Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import { useClipboard } from 'usable-react';
import { store } from '~/app/store';
import { Address } from '../address';
import { CopyIcon, MagicGradientIcon } from '~/shared/svg/magic-connect';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { formatAppName } from '~/features/connect-with-ui/utils/format-app-name';
import { AuthWalletType } from '~/features/connect-with-ui/utils/get-wallet-connections';
import { WalletAppLogo } from '~/features/connect-with-ui/components/wallet-app-logo';
import styles from './active-wallet-card.less';
import { isGlobalAppScope } from '~/app/libs/connect-utils';

// note on MA / MC logic
// isAuthWallet -> MA with Interop
// !isGlobalAppScope() -> MA
// isGlobalAppScope() -> MC

const getWalletName = (
  isAuthWallet: boolean,
  appName: string | undefined,
  maWithInteropAppName: string | undefined,
): string => {
  // app is MC
  let updatedAppName = 'Magic';

  // app is MA || app is MA with interop
  const isMA = isAuthWallet || !isGlobalAppScope();

  if (isMA) {
    updatedAppName = maWithInteropAppName || appName || 'First App';
  }

  const formattedAppName = formatAppName(updatedAppName);
  const walletName = `${formattedAppName} Wallet`;
  return walletName;
};

export const ActiveWalletCard = () => {
  const { copy } = useClipboard();
  const { theme } = useTheme();
  const [wasCopied, setWasCopied] = useState(false);
  const [copyIconColor, setCopyIconColor] = useState(theme.isDarkTheme ? '#77767A' : '#B6B4BA');
  const walletAddress = store.hooks.useSelector(state => state.Auth.userKeys.publicAddress);
  const { activeAuthWallet } = store.hooks.useSelector(state => state.User);
  const textContent = wasCopied ? <span className={styles.copied}>Copied!</span> : <Address address={walletAddress} />;
  const isAuthWallet = !!activeAuthWallet;

  const maWithInteropAppName = activeAuthWallet?.client_details.app_name;

  const { appName } = store.getState().Theme.theme;
  const walletName = getWalletName(isAuthWallet, appName, maWithInteropAppName);

  const authAppAssetUri = (activeAuthWallet as AuthWalletType)?.client_details?.asset_uri;
  const authWalletTheme = (activeAuthWallet as AuthWalletType)?.client_details?.theme_color;

  useEffect(() => {
    if (wasCopied) {
      const timeout = setTimeout(() => setWasCopied(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [wasCopied]);

  const onCopyAddress = () => {
    copy(walletAddress);
    setWasCopied(true);
  };

  return (
    <div
      className={styles.walletCard}
      role="button"
      tabIndex={0}
      onClick={onCopyAddress}
      onKeyPress={onCopyAddress}
      onMouseEnter={() => setCopyIconColor(theme.isDarkTheme ? '#B6B4BA' : '#77767A')}
      onMouseLeave={() => setCopyIconColor(theme.isDarkTheme ? '#77767A' : '#B6B4BA')}
    >
      {walletAddress && (
        <Flex.Row justifyContent="space-between" alignItems="center" style={{ width: '100%' }}>
          <Flex.Row alignItems="center">
            <div style={{ width: '40px' }}>
              {activeAuthWallet ? (
                <WalletAppLogo
                  authWalletTheme={authWalletTheme}
                  authAppAssetUri={authAppAssetUri}
                  appName={appName}
                  size={40}
                />
              ) : (
                <Icon type={MagicGradientIcon} size={40} />
              )}
            </div>
            <Spacer size={15} orientation="horizontal" />
            <div>
              <Typography.BodyMedium weight="500" style={{ textAlign: 'left' }}>
                {walletName}
              </Typography.BodyMedium>
              <Spacer size={2} orientation="vertical" />
              <Typography.BodyMedium className={styles.address} weight="400">
                {textContent}
              </Typography.BodyMedium>
            </div>
          </Flex.Row>
          <Icon type={CopyIcon} color={copyIconColor} />
        </Flex.Row>
      )}
    </div>
  );
};
