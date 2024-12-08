import React, { CSSProperties, useEffect, useState } from 'react';
import { Flex, Icon, Spacer, TextButton, Typography } from '@magiclabs/ui';
import { useClipboard } from 'usable-react';
import { store } from '~/app/store';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { connectStore } from '~/features/connect-with-ui/store';
import { connectLogout } from '~/features/connect-with-ui/store/connect.thunks';
import { nativeMethodsStore } from '../../store/native-methods.store';
import { clearNativeMethodsStore } from '~/features/native-methods/store/native-methods.trunks';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { WalletIcon, ChevronRight, CloseIcon, ExternalLink } from '~/shared/svg/magic-connect';
import { Address } from '~/features/connect-with-ui/components/address';
import { resolvePayload } from '~/app/rpc/utils';
import { useCloseUIThread, useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { TrackingButton } from '~/features/connect-with-ui/components/tracking-button';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { NavigationCard } from '~/features/connect-with-ui/components/navigation-card';
import { isGlobalAppScope, isMagicWalletDapp } from '~/app/libs/connect-utils';
import { ActiveWalletCard } from '~/features/connect-with-ui/components/active-wallet-card';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { Network } from '~/features/connect-with-ui/components/network';
import { BannerButton } from '~/features/connect-with-ui/components/banner-button';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { secretPhraseOrPrivateKeyLabel } from '~/features/connect-with-ui/utils/secret-phrase-or-private-key';
import { ProfileImage } from '~/features/connect-with-ui/components/profile-image';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { isSdkVersionGreaterThanOrEqualTo } from '~/app/libs/is-version-greater-than';
import { AnalyticsActionType } from '~/app/libs/analytics';
import waves from './background-waves.svg';
import styles from './wallet-account-info-page.less';
import { getIsTrialMode } from '~/app/ui/components/widgets/trial-mode-banner';
import { isWalletUIRpcMethod } from '~/app/libs/wallet-ui-rpc-methods';

const AccountSection = ({ children, route, ...rest }) => {
  const { navigateTo } = useControllerContext();

  return (
    <NavigationCard onClick={() => navigateTo(route, eventData)}>
      <div className={styles.accountSection} {...rest}>
        {children}
      </div>
    </NavigationCard>
  );
};

export const WalletAddress = () => {
  const walletAddress = store.hooks.useSelector(state => state.Auth.userKeys.publicAddress);
  const theme = useTheme();
  const { isDarkTheme } = theme.theme;
  const { copy } = useClipboard();
  const [wasCopied, setWasCopied] = useState(false);
  const textContent = wasCopied ? 'Copied!' : <Address address={walletAddress} />;

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
    <button onClick={onCopyAddress} className={styles.walletAddress}>
      <Typography.BodyMedium weight="400" color={isDarkTheme ? '#FFFFFFB8' : theme.theme.color.mid.base.toString()}>
        {textContent}
      </Typography.BodyMedium>
    </button>
  );
};

export const WalletAccountInfoPage = () => {
  const payload = useUIThreadPayload();
  const cancel = useCloseUIThread(sdkErrorFactories.magic.userRejectAction());
  const { theme } = useTheme();
  const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.hooks.useSelector(state => state.System);
  const email = store.hooks.useSelector(state => state.Auth.userEmail);
  const { navigateTo } = useControllerContext();
  const handleCloseButton = () => {
    // Conditional logic against the magic-sdk version to ensure it doesn't interrupt
    // how existing devs may be handling the error
    const VERSION = '14.0.0';
    if (payload && isWalletUIRpcMethod(payload) && isSdkVersionGreaterThanOrEqualTo(VERSION)) {
      return resolvePayload(payload, true);
    }
    cancel();
  };

  // Dynamically apply border radius to banner
  const mediaMatch = window.matchMedia('(min-width: 480px)');
  const [matches, setMatches] = useState(mediaMatch.matches);
  const [showTrialmodeBanner, setShowTrialmodeBanner] = useState(false);

  useEffect(() => {
    const handler = e => setMatches(e.matches);
    mediaMatch.addEventListener('change', handler);
    setShowTrialmodeBanner(payload ? getIsTrialMode(payload?.method) : false);
    return () => mediaMatch.removeEventListener('change', handler);
  }, []);

  const Logout = () => {
    const onLogout = async () => {
      await connectStore.dispatch(connectLogout());
      await nativeMethodsStore.dispatch(clearNativeMethodsStore());
      if (payload) {
        store.dispatch(SystemThunks.emitJsonRpcEvent({ payload, event: 'disconnect' }));
        await resolvePayload(payload, true);
      }
    };
    return (
      <TrackingButton actionName={AnalyticsActionType.LogoutClick}>
        <TextButton onClick={onLogout}>
          <Typography.BodyLarge weight="600">Log out</Typography.BodyLarge>
        </TextButton>
      </TrackingButton>
    );
  };

  const HelpCenter = () => {
    const [iconColor, setIconColor] = useState(theme.isDarkTheme ? '#79767A' : '#B6B4BA');

    return (
      <a
        href="https://magic.link/docs/home/faqs/wallet-end-users"
        rel="noreferrer"
        target="_blank"
        className={styles.helpCenterLink}
        onMouseEnter={() => setIconColor(theme.isDarkTheme ? '#B6B4BA' : '#77767A')}
        onMouseLeave={() => setIconColor(theme.isDarkTheme ? '#77767A' : '#B6B4BA')}
      >
        <NavigationCard onClick={undefined}>
          <Flex.Row justifyContent="space-between" alignItems="center">
            <Typography.BodyMedium color="inherit" weight="500">
              Help center
            </Typography.BodyMedium>
            <Icon type={ExternalLink} size={16} color={iconColor} />
          </Flex.Row>
        </NavigationCard>
      </a>
    );
  };

  const RevealPrivateKey = () => {
    const [iconColor, setIconColor] = useState(theme.isDarkTheme ? '#79767A' : '#B6B4BA');
    const keyTypeLabel = secretPhraseOrPrivateKeyLabel();

    const getRevealSecretPhraseRoute = () => {
      if (!LAUNCH_DARKLY_FEATURE_FLAGS['is-reveal-seed-phrase-ux-enabled']) {
        return 'wallet-export';
      }
      return isMagicWalletDapp() ? 'wallet-export-agreement' : 'wallet-export-redirect';
    };

    return (
      <div
        onMouseEnter={() => setIconColor(theme.isDarkTheme ? '#B6B4BA' : '#77767A')}
        onMouseLeave={() => setIconColor(theme.isDarkTheme ? '#77767A' : '#B6B4BA')}
      >
        <AccountSection route={getRevealSecretPhraseRoute()}>
          <Typography.BodyMedium color="inherit" weight="500">
            Wallet {keyTypeLabel}
          </Typography.BodyMedium>
          <Icon type={ChevronRight} color={iconColor} />
        </AccountSection>
      </div>
    );
  };

  const isCustomDarkTheme = (): boolean => {
    return theme.isDarkTheme && theme.hex.primary.base !== '#A799FF';
  };

  const isCustomTheme = () => {
    return theme.hex.primary.base !== '#6851FF' && theme.hex.primary.base !== '#A799FF';
  };
  const headerStyles: CSSProperties = {
    borderRadius: matches && !showTrialmodeBanner ? '28px 28px 0 0' : '0px',
    boxSizing: 'content-box',
    padding: '0 16px 48px',
    width: 'calc(100% - 32px)',
  };

  return (
    <>
      <ModalHeader
        style={
          isCustomTheme()
            ? {
                background: theme.hex.primary.base,
                backgroundImage: `url('${waves}')`,
                ...headerStyles,
              }
            : {
                backgroundImage: `url('${waves}'), linear-gradient(113.64deg, #3728b7 -3.38%, #6851ff 46.01%, #c970ff 99.1%)`,
                ...headerStyles,
              }
        }
        leftAction={
          <BannerButton
            onClick={() => navigateTo('wallet-home', eventData)}
            iconColor={isCustomDarkTheme() ? '#000' : '#fff'}
            iconType={WalletIcon}
          />
        }
        rightAction={
          isMagicWalletDapp() ? (
            <div style={{ height: '32px', width: '32px' }} />
          ) : (
            <BannerButton
              onClick={handleCloseButton}
              iconColor={isCustomDarkTheme() ? '#000' : '#fff'}
              iconType={CloseIcon}
            />
          )
        }
        header={<Network isBannerPage inverse={!isCustomDarkTheme()} />}
      />
      <BasePage>
        <div className={styles.bannerSpacer} />
        <ProfileImage height={64} />
        <Spacer size={16} orientation="vertical" />
        <Typography.H4 weight="700" color="inherit">
          {email}
        </Typography.H4>
        <Spacer size={30} orientation="vertical" />
        <ActiveWalletCard />
        {isGlobalAppScope() && (
          <>
            <Spacer size={15} orientation="vertical" />
            <HelpCenter />
            <Spacer size={10} orientation="vertical" />
            <RevealPrivateKey />
          </>
        )}
        <Spacer size={32} orientation="vertical" />
        <Logout />
      </BasePage>
    </>
  );
};
