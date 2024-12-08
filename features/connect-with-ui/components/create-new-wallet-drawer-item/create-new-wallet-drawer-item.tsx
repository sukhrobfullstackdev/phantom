import React from 'react';
import { Icon, Typography } from '@magiclabs/ui';
import { CoinbaseWalletIcon, EnvelopeIcon, ExternalLink, MetamaskIcon } from '~/shared/svg/magic-connect';
import { connectStore } from '~/features/connect-with-ui/store';
import { setLastSelectedLogin } from '~/features/connect-with-ui/store/connect.actions';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import styles from './create-new-wallet-drawer-item.less';

interface NewWalletDrawerItemType {
  walletType: 'email' | 'metamask' | 'coinbase_wallet';
  setIsDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const NewWalletDrawerItem = ({ walletType, setIsDrawerOpen }: NewWalletDrawerItemType) => {
  const { navigateTo } = useControllerContext();

  const getDownloadLink = (wallet): string => {
    if (wallet === 'metamask') return 'https://metamask.app.link/';
    if (wallet === 'coinbase_wallet') return 'https://go.cb-w.com/';
    return '';
  };

  const routeToLoginPage = () => {
    setIsDrawerOpen(false);
    connectStore.dispatch(setLastSelectedLogin('email-otp'));

    // This delay is so the drawer closes before navigating away to prevent UI jankiness
    setTimeout(() => {
      navigateTo('login-prompt', eventData);
    }, 200);
  };

  return walletType === 'email' ? (
    <div
      className={styles.drawerItem}
      role="button"
      tabIndex={0}
      onClick={routeToLoginPage}
      onKeyPress={routeToLoginPage}
    >
      <div>
        <Icon type={EnvelopeIcon} size={25} />
      </div>
      <Typography.BodySmall weight="600">Continue with Email</Typography.BodySmall>
      <Typography.BodySmall weight="400" className={styles.subText}>
        No download. Create a Magic Wallet in seconds
      </Typography.BodySmall>
    </div>
  ) : (
    <a href={`${getDownloadLink(walletType)}`} target="_blank" rel="noreferrer" className={styles.link} tabIndex={0}>
      <div className={styles.drawerItem}>
        <div>
          <Icon type={walletType === 'metamask' ? MetamaskIcon : CoinbaseWalletIcon} size={25} />
        </div>
        <Typography.BodySmall weight="600">
          Download {walletType === 'metamask' ? 'MetaMask' : 'Coinbase Wallet'}{' '}
          <Icon type={ExternalLink} size={12} color="#B6B4BA" />
        </Typography.BodySmall>
        <Typography.BodySmall weight="400" className={styles.subText}>
          Works for Chrome, iOS, and Android
        </Typography.BodySmall>
      </div>
    </a>
  );
};
