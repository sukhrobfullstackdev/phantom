import { AnimatePresence, motion } from 'framer-motion';
import React, { useContext, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Flex, Icon, MonochromeIcons, Spacer, Typography } from '@magiclabs/ui';
import { store } from '~/app/store';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { CheckmarkIcon } from '~/shared/svg/settings';
import { LoadingIcon, MagicGradientIcon } from '~/shared/svg/magic-connect';
import { TokenFormatter } from '../token-formatter';
import { useGetNativeTokenBalance } from '~/features/connect-with-ui/hooks/useGetNativeTokenBalance';
import { selectWallet } from '~/features/connect-with-ui/utils/select-wallet';
import { resolvePayload } from '~/app/rpc/utils';
import { AuthWalletType, ConnectWalletType } from '~/features/connect-with-ui/utils/get-wallet-connections';
import { formatAppName } from '~/features/connect-with-ui/utils/format-app-name';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import { WalletAppLogo } from '~/features/connect-with-ui/components/wallet-app-logo';
import styles from './selectable-wallet.less';
import { isTouchScreenDevice } from '../../utils/is-touch-screen-device';
import { setActiveAuthWallet } from '~/app/store/user/user.actions';
import { LockIcon } from '~/shared/svg/mfa';
import { emitIdToken } from '../../hooks/useLoginFormPages';
import { AuthThunks } from '~/app/store/auth/auth.thunks';
import { toChecksumAddress } from '~/app/libs/web3-utils';

interface SelectableWalletProps {
  wallet: ConnectWalletType | AuthWalletType;
  isConnectWallet?: boolean;
  setSelectedWalletId: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedWalletId: string | undefined;
  loginLabel?: string | null;
  setShouldPauseCycle: React.Dispatch<React.SetStateAction<boolean>>;
  shouldPauseCycle: boolean;
}

export const SelectableWallet = ({
  wallet,
  isConnectWallet = false,
  selectedWalletId,
  setSelectedWalletId,
  loginLabel,
  setShouldPauseCycle,
  shouldPauseCycle,
}: SelectableWalletProps) => {
  const payload = useUIThreadPayload();
  const balanceInWei = useGetNativeTokenBalance(wallet.public_address);
  const balance = Number(ethers.utils.formatUnits(balanceInWei || '0')).toString();
  const { Auth } = store.hooks.useSelector(state => state);
  const { theme } = useTheme();
  const [isWalletHovered, setIsWalletHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletSelectionConfirmed, setIsWalletSelectionConfirmed] = useState(false);
  const [showWalletAddress, setShowWalletAddress] = useState(true);
  const [delayShowingAddress, setDelayShowingAddress] = useState(false);
  const chainInfo = useContext(MultiChainInfoContext);
  const walletId = wallet.wallet_id;
  const appName = formatAppName((wallet as AuthWalletType).client_details?.app_name || 'Magic');
  const isMfaEnabled = (wallet as AuthWalletType).is_mfa_enabled;
  const isWalletOptionDisabled = isMfaEnabled || (selectedWalletId && selectedWalletId !== walletId);
  const authWalletTheme = (wallet as AuthWalletType).client_details?.theme_color;
  const authAppAssetUri = (wallet as AuthWalletType).client_details?.asset_uri;
  const isTouchScreen = isTouchScreenDevice();
  const showHoverState = isTouchScreen || (isWalletHovered && !isLoading && !isWalletSelectionConfirmed);
  const showLoadingState = isLoading && !isWalletSelectionConfirmed;
  const showConfirmedState = !isLoading && isWalletSelectionConfirmed;

  const connectWallet = async () => {
    if (isMfaEnabled || !payload) return;
    setSelectedWalletId(walletId);
    setIsLoading(true);
    const newActiveWallet = await selectWallet(Auth.userID, walletId, isConnectWallet ? 'connect' : 'magic');
    setIsLoading(false);
    setIsWalletSelectionConfirmed(true);
    if (newActiveWallet) {
      // Set connect store with auth wallet information
      if (!isConnectWallet) {
        await store.dispatch(setActiveAuthWallet(wallet as AuthWalletType));
        await store.dispatch(AuthThunks.populateUserCredentials());
      }
      await emitIdToken();
      setTimeout(() => {
        return resolvePayload(payload, [toChecksumAddress(newActiveWallet.public_address)]);
      }, 1200);
    }
  };

  useEffect(() => {
    const addressBalanceInterval = setInterval(() => {
      if (!shouldPauseCycle) {
        setDelayShowingAddress(true);
        setTimeout(() => {
          setDelayShowingAddress(false);
        }, 400);
        setShowWalletAddress(prev => !prev);
      }
    }, 3500);
    return () => {
      clearInterval(addressBalanceInterval);
    };
  }, [shouldPauseCycle]);

  return (
    <>
      <Spacer size={15} orientation="vertical" />
      <div
        onClick={connectWallet}
        onKeyPress={connectWallet}
        role="button"
        tabIndex={0}
        style={
          isWalletOptionDisabled ? { opacity: 0.3, cursor: 'default', pointerEvents: 'none' } : { cursor: 'pointer' }
        }
        onMouseEnter={() => {
          if (!isMfaEnabled) {
            setIsWalletHovered(true);
            setShouldPauseCycle(true);
          }
        }}
        onMouseLeave={() => {
          setIsWalletHovered(false);
          setShouldPauseCycle(false);
        }}
        data-disabled={isWalletOptionDisabled}
      >
        <Flex.Row justifyContent="space-between" alignItems="center" style={{ overflow: 'hidden' }}>
          <Flex.Row alignItems="center">
            {isConnectWallet && <Icon type={MagicGradientIcon} size={40} />}
            {!isConnectWallet && (
              <WalletAppLogo
                authWalletTheme={authWalletTheme}
                authAppAssetUri={authAppAssetUri}
                appName={appName}
                size={40}
              />
            )}
            <Spacer size={12} orientation="horizontal" />
            <Flex.Column style={{ textAlign: 'left' }}>
              <Typography.BodyMedium weight="500" style={{ maxWidth: '250px' }}>
                {appName} Wallet{' '}
                {loginLabel && (
                  <span className={styles.walletLabel}>({loginLabel === 'OAUTH' ? 'Google' : 'Email'})</span>
                )}
              </Typography.BodyMedium>
              {isMfaEnabled && (
                <Flex.Row alignItems="center">
                  <Icon type={LockIcon} size={12} />
                  <Spacer size={5} orientation="horizontal" />
                  <Typography.BodySmall className={styles.text} weight="400">
                    Unavailable - 2FA enabled
                  </Typography.BodySmall>
                </Flex.Row>
              )}
              <div style={{ maxHeight: '20px', height: '20px' }}>
                <AnimatePresence initial={false}>
                  {!isMfaEnabled && !showWalletAddress && !delayShowingAddress && (
                    <motion.div
                      transition={{ duration: 0.45, delay: 0 }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12, transition: { duration: 0.4 } }}
                      aria-hidden
                    >
                      <Typography.BodySmall weight="400" className={styles.text} aria-hidden>
                        {balance && <TokenFormatter value={Number(balance)} token={chainInfo?.currency} />}
                      </Typography.BodySmall>
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence initial={false}>
                  {!isMfaEnabled && showWalletAddress && (
                    <motion.div
                      transition={{ duration: 0.45, delay: 0.4 }}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 12, transition: { duration: 0.4 } }}
                      aria-hidden
                    >
                      <Typography.BodySmall
                        aria-hidden
                        weight="400"
                        className={styles.text}
                      >{`${wallet.public_address.slice(0, 5)}...${wallet.public_address.slice(
                        -4,
                      )}`}</Typography.BodySmall>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Flex.Column>
          </Flex.Row>
          <AnimatePresence initial={false}>
            {showHoverState && (
              <motion.div
                transition={{ duration: 0.3 }}
                initial={{ opacity: 0 }}
                animate={{
                  x: 16,
                  opacity: [0, 1],
                }}
                exit={{
                  opacity: [1, 0],
                  x: 0,
                  transition: { duration: 0 },
                }}
              >
                <Icon size={18} color="#B6B4BA" type={MonochromeIcons.ArrowRight} style={{ paddingRight: '16px' }} />
              </motion.div>
            )}
          </AnimatePresence>

          {showLoadingState && (
            <Icon className={styles.loadingSpinner} color={theme.hex.primary.base} type={LoadingIcon} size={28} />
          )}
          {showConfirmedState && <Icon size={18} color={theme.hex.primary.base} type={CheckmarkIcon} />}
        </Flex.Row>
      </div>
      <Spacer size={15} orientation="vertical" />
    </>
  );
};

SelectableWallet.defaultProps = {
  isConnectWallet: false,
  loginLabel: null,
};
