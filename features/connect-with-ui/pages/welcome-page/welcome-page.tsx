import React from 'react';
import { motion } from 'framer-motion';
import { CallToAction, Spacer, Typography } from '@magiclabs/ui';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { resolvePayload } from '~/app/rpc/utils';
import { toChecksumAddress } from '~/app/libs/web3-utils';
import { store } from '~/app/store';
import { WelcomeIcons } from '~/features/connect-with-ui/components/welcome-icons';
import { connectStore } from '~/features/connect-with-ui/store';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { tryResolvePublicAddress } from '~/features/connect-with-ui/connect-with-ui.controller';
import { userHasOneAuthWalletWithMfa } from '~/features/connect-with-ui/utils/get-route-for-mc-user';
import styles from './welcome-page.less';

export const WelcomePage = () => {
  const { theme } = useTheme();
  const payload = useUIThreadPayload();
  const address = store.hooks.useSelector(state => state.Auth.userKeys.publicAddress);
  const walletConnectionsInfo = connectStore.hooks.useSelector(state => state.walletConnectionsInfo);
  const { navigateTo } = useControllerContext();
  const hasAuthWallets = walletConnectionsInfo?.authWallets && walletConnectionsInfo?.authWallets?.length > 0;
  const shouldTruncateAppName = theme.appName.length > 35;
  const appName = shouldTruncateAppName ? `${theme.appName.substring(0, 35)}...` : theme.appName;

  const handleContinue = () => {
    if (!payload) return;
    if (hasAuthWallets) {
      if (userHasOneAuthWalletWithMfa(walletConnectionsInfo?.authWallets)) {
        return tryResolvePublicAddress(payload);
      }
      return navigateTo('wallet-selection-page', eventData);
    }
    if (address) {
      return resolvePayload(payload, [toChecksumAddress(address)]);
    }
  };

  return (
    <div style={{ marginBottom: '-20px' }}>
      <ModalHeader />
      <Spacer size={20} orientation="vertical" />
      <div className={styles.page}>
        <WelcomeIcons />
        <Spacer orientation="vertical" size={56} />
        <motion.div
          className={styles.motionDiv}
          transition={{ delay: 0.6, duration: 0.3 }}
          animate={{
            opacity: [0, 1],
            y: -20,
          }}
        >
          <Typography.BodyMedium className={styles.welcomeToMagic}>Welcome to Magic</Typography.BodyMedium>
        </motion.div>
        <motion.div
          className={styles.motionDiv}
          transition={{ delay: 1.1, duration: 0.3 }}
          animate={{
            opacity: [0, 1],
            y: -20,
          }}
        >
          <Typography.BodyLarge className={styles.header} weight="400">
            Your personal passport to <strong>{theme.appName}</strong> and more
          </Typography.BodyLarge>
          <Spacer orientation="vertical" size={12} />
          <Typography.BodySmall className={styles.subText} weight="400">
            Magic provides secure access to your crypto and collectibles across hundreds of apps
          </Typography.BodySmall>
          <Spacer orientation="vertical" size={10} />
        </motion.div>
        <Spacer orientation="vertical" size={10} />
        <motion.div
          className={styles.motionDiv}
          transition={{ delay: 1.4, duration: 0.3 }}
          animate={{
            opacity: [0, 1],
            y: -20,
          }}
        >
          <CallToAction onClick={handleContinue} className={styles.continueButton}>
            Continue to {appName}
          </CallToAction>
        </motion.div>
      </div>
    </div>
  );
};
