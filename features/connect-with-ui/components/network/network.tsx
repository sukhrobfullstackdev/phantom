import React, { useContext, useEffect, useRef, useState } from 'react';
import { Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { AngleDown } from '~/shared/svg/magic-connect';
import styles from './network.less';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import NetworkSwitcher from '~/features/connect-with-ui/components/network/network-switcher';
import NetworkDrawer from '~/features/connect-with-ui/components/network/network-drawer';
import { store } from '~/app/store';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { isGlobalAppScope } from '~/app/libs/connect-utils';

const shouldShowNetworkSwitcher = () => {
  // this is the client app's origin of the most recent json rpc request event.
  // see setEventOrigin in json-rpc-channel.ts
  const { System } = store.getState();
  const clientAppDomain = System.eventOrigin;

  const options = [
    // wallet
    'wallet.magic.link',
    'wallet.stagef.magic.link',
    'localhost:3006', // magic wallet dapp local
    // e2e
    'auth.stagef.magic.link',
    'localhost:3014', // phantom local
  ];
  return options.some(option => clientAppDomain.includes(option));
};

interface NetworkProps {
  inverse?: boolean;
  isBannerPage?: boolean;
}

export const Network = ({ inverse, isBannerPage }: NetworkProps) => {
  const chainInfo = useContext(MultiChainInfoContext);
  const { isMainnet, networkName, blockchainIcon } = chainInfo || {};
  const theme = useTheme();
  const { mode } = useThemeMode();
  const ref = useRef<HTMLDivElement | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const networkTextDefaultClassList = `${isMainnet ? styles.mainnet : styles.testnet}`;
  const networkTextDarkerBannerClassList = `${isMainnet ? styles.mainnetInverseDark : styles.testnetInverseDark}`;
  const networkTextLighterBannerClassList = `${isMainnet ? styles.mainnetInverseLight : styles.testnetInverseLight}`;
  const inverseNetworkClass = !inverse ? networkTextDarkerBannerClassList : networkTextLighterBannerClassList;

  const networkClass = isBannerPage ? inverseNetworkClass : networkTextDefaultClassList;
  const networkWeight = isMainnet ? '400' : '600';

  const handleOpenDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };
  const handleClickOutside = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as HTMLElement)) {
      setIsDrawerOpen(false);
    }
  };

  const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.hooks.useSelector(state => state.System);

  const isNetworkSwitcherEnabled = LAUNCH_DARKLY_FEATURE_FLAGS['is-network-switcher-enabled'];
  const showNetworkSwitcher = isNetworkSwitcherEnabled && shouldShowNetworkSwitcher();

  useEffect(() => {
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, []);

  return (
    <div ref={ref}>
      <Flex.Row
        alignItems="center"
        justifyContent="center"
        onClick={handleOpenDrawer}
        onKeyDown={handleOpenDrawer}
        role="button"
        tabIndex={0}
        className={styles.networkContainer}
        aria-label="current-blockchain-network"
      >
        <Flex.Row className={styles.networkNameContainer}>
          <Typography.BodySmall
            weight={networkWeight}
            className={networkClass}
            role="button"
            tabIndex={0}
            onClick={handleOpenDrawer}
            onKeyDown={handleOpenDrawer}
          >
            {networkName}
          </Typography.BodySmall>
          <Icon type={AngleDown} size={18} color={theme.theme.isDarkTheme ? '#FFFFFFB8' : '#B6B4BA'} />
        </Flex.Row>
      </Flex.Row>

      <NetworkDrawer isDrawerOpen={isDrawerOpen}>
        {chainInfo && (
          <Flex.Column alignItems="center" justifyContent="center" style={{ padding: '16px', gap: '8px' }}>
            <Flex.Row
              alignItems="center"
              justifyContent="center"
              onClick={() => setIsDrawerOpen(false)}
              onKeyDown={() => setIsDrawerOpen(false)}
              role="button"
              tabIndex={0}
              className={styles.networkContainer}
            >
              <Typography.BodyMedium weight="700" color={mode('var(--ink100)', 'var(--white)')}>
                {isGlobalAppScope() ? 'Choose a network' : 'Network'}
              </Typography.BodyMedium>
              <Spacer size={5} orientation="horizontal" />
            </Flex.Row>

            {showNetworkSwitcher ? (
              <NetworkSwitcher selectedNetwork={networkName} />
            ) : (
              <>
                <Spacer size={20} orientation="vertical" />
                <Flex.Row alignItems="center">
                  {!!blockchainIcon && <Icon aria-hidden type={blockchainIcon} size={26} />}
                  <Spacer size={8} orientation="horizontal" />
                  <Typography.BodyMedium>{networkName}</Typography.BodyMedium>
                </Flex.Row>
                <Spacer size={20} orientation="vertical" />
                <Typography.BodySmall className={styles.text} weight="400">
                  You're connected to {networkName}.
                </Typography.BodySmall>
                <Typography.BodySmall className={styles.text} weight="400">
                  This blockchain network was set by {theme.theme.appName}.
                </Typography.BodySmall>
                <Spacer size={24} orientation="vertical" />
              </>
            )}
          </Flex.Column>
        )}
      </NetworkDrawer>
    </div>
  );
};

Network.defaultProps = {
  inverse: false,
  isBannerPage: false,
};
