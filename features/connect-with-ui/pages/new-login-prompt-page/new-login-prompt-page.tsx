import { Flex, Icon, MonochromeIconDefinition, Spacer, Typography } from '@magiclabs/ui';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import { i18n } from '~/app/libs/i18n';
import { isMobileSDK } from '~/app/libs/platform';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { useLoginWithGoogle } from '~/features/connect-with-ui/hooks/useGoogleLogin';
import { tryResolvePublicAddress } from '~/features/connect-with-ui/connect-with-ui.controller';
import { connectStore } from '~/features/connect-with-ui/store';
import { GoogleIcon } from '~/shared/svg/company-logo';
import {
  setLastSelectedLogin,
  setThirdPartyWalletEnv,
  setEnabledThirdPartyWallets,
} from '~/features/connect-with-ui/store/connect.actions';
import { AppName } from '~/features/connect-with-ui/components/app-name';
import {
  EnvelopeIcon,
  MetamaskIcon,
  WalletConnectIcon,
  SuccessCheckmark,
  CoinbaseWalletIcon,
  SuccessCheckmarkDarkmode,
  MagicGradientIcon,
  WalletIconFull,
} from '~/shared/svg/magic-connect';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { SharedLogo } from '~/features/connect-with-ui/components/shared-logo';
import { ConnectLoginTypes, ThirdPartyWalletEnv } from '~/features/connect-with-ui/store/connect.reducer';
import { PrivacyAndTerms } from '~/features/connect-with-ui/components/privacy-and-terms';
import { CallToActionOverload } from '~/features/connect-with-ui/components/call-to-action-overload';
import { trackPage } from '~/app/libs/analytics';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { isGlobalAppScope, isMagicWalletDapp } from '~/app/libs/connect-utils';
import { getIsWebview } from '~/app/libs/get-is-webview';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { getRouteForMcUserIfSignUpOrHasAuthWallets } from '~/features/connect-with-ui/utils/get-route-for-mc-user';
import { store } from '~/app/store';
import { setActiveAuthWallet, setProfilePictureUrl } from '~/app/store/user/user.actions';
import { EmailOtpLoginForm } from '../login-prompt-page/email-otp-login-form';
import { GoogleLoginForm } from '../login-prompt-page/google-login-form';
import styles from './new-login-prompt-page.less';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';

export type LoginPromptPageProps = {
  onComplete: () => any | (() => Promise<any>);
};

export interface ThirdPartyWalletsInterface {
  loginProviderName: 'metamask_wallet' | 'wallet_connect' | 'coinbase_wallet';
  walletProvider: 'METAMASK' | 'WALLET_CONNECT' | 'COINBASE_WALLET';
  icon: MonochromeIconDefinition;
  isActive: boolean;
  installed: boolean;
}

const LoginTypeToCopyMap: { [key in ConnectLoginTypes]: string } = {
  google: 'Google',
  'email-otp': 'Email',
};

export const NewLoginPromptPage = ({ onComplete }: LoginPromptPageProps) => {
  const lastSelectedLoginType = connectStore.hooks.useSelector(state => state.lastSelectedLogin);
  const [loginType, setLoginType] = useState(lastSelectedLoginType || 'google');
  const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.hooks.useSelector(state => state.System);
  const isFirstLogin = useMemo(() => !lastSelectedLoginType, []);
  const { theme } = useTheme();
  const { navigateTo } = useControllerContext();
  const payload = useUIThreadPayload();
  const userEnv = payload?.params[0]?.env as ThirdPartyWalletEnv;
  const showCustomForbesCopy = LAUNCH_DARKLY_FEATURE_FLAGS['is-forbes-custom-copy-enabled'];

  const { isLoading, startAndVerifyGoogleLogin, error } = useLoginWithGoogle();
  const [isLoginCompleted, setIsLoginCompleted] = useState(false);

  const isWebview = getIsWebview(window.navigator.userAgent);

  const clearUserDataInRedux = () => {
    store.dispatch(setProfilePictureUrl(undefined));
    store.dispatch(setActiveAuthWallet(undefined));
  };

  const thirdPartyWallets: Array<ThirdPartyWalletsInterface> = [
    {
      loginProviderName: 'metamask_wallet',
      walletProvider: 'METAMASK',
      icon: MetamaskIcon,
      isActive: true,
      installed: !!userEnv?.isMetaMaskInstalled,
    },
    {
      loginProviderName: 'wallet_connect',
      walletProvider: 'WALLET_CONNECT',
      icon: WalletConnectIcon,
      isActive: false,
      installed: false,
    },
    {
      loginProviderName: 'coinbase_wallet',
      walletProvider: 'COINBASE_WALLET',
      icon: CoinbaseWalletIcon,
      isActive: true,
      installed: !!userEnv?.isCoinbaseWalletInstalled,
    },
  ];

  useEffect(() => {
    trackPage('new-login-prompt', eventData);
    clearUserDataInRedux();
    if (payload) {
      connectStore.dispatch(setThirdPartyWalletEnv(userEnv));
    }
  }, []);

  const {
    configuredAuthProviders: { primaryLoginProviders },
    isLoadingClientConfig,
  } = store.getState().System;

  const thirdPartyWalletProviders: ThirdPartyWalletsInterface[] = [
    ...thirdPartyWallets
      .filter(wallet => primaryLoginProviders.includes(wallet.loginProviderName))
      .filter(wallet => wallet.isActive),
  ];

  const renderSuccessCheckmark = () => {
    return theme.isDarkTheme ? SuccessCheckmarkDarkmode : SuccessCheckmark;
  };

  const isMagicLogoHidden: boolean = LAUNCH_DARKLY_FEATURE_FLAGS['is-magic-logo-hidden'];

  const finishGoogleLogin = async (token: string) => {
    const isLoggedIn = await startAndVerifyGoogleLogin(token);
    connectStore.dispatch(setLastSelectedLogin('google'));
    if (isLoggedIn) {
      setIsLoginCompleted(true);

      // setTimeout so we can show the checkmark for 1000m before resolving payload / routing
      setTimeout(async () => {
        await onComplete();
        // Will only be reached if new user or has MA wallets
        const route = getRouteForMcUserIfSignUpOrHasAuthWallets();
        if (route === 'resolve') {
          return tryResolvePublicAddress(payload);
        }
        return navigateTo(route, eventData);
      }, 1000);
    }
  };

  let loginForm;

  if (loginType === 'email-otp' || isWebview || !isGlobalAppScope()) {
    loginForm = <EmailOtpLoginForm />;
  } else {
    loginForm = <GoogleLoginForm onGoogleSuccess={finishGoogleLogin} />;
  }

  const loginOptions: Array<JSX.Element> = [];

  if (isWebview || !isGlobalAppScope()) {
    // do nothing, don't add alternative login option
  } else if (loginType === 'email-otp') {
    loginOptions.push(
      <CallToActionOverload key="google" outline leadingIcon={GoogleIcon} onPress={() => setLoginType('google')}>
        Google
      </CallToActionOverload>,
    );
  } else {
    loginOptions.push(
      <CallToActionOverload key="email" outline leadingIcon={EnvelopeIcon} onPress={() => setLoginType('email-otp')}>
        Email
      </CallToActionOverload>,
    );
  }

  const orderWallets = (wallets: Array<ThirdPartyWalletsInterface>): Array<ThirdPartyWalletsInterface> => {
    return wallets.sort((a, b) => Number(b.installed) - Number(a.installed));
  };

  const privacyAndTerms = showCustomForbesCopy ? (
    <div className={styles.customPrivacyAndTerms}>
      By continuing, you acknowledge that you're providing this information directly to Magic pursuant to Magic's
      <a href="https://magic.link/legal/privacy-policy" target="_blank" rel="noreferrer">
        {' '}
        privacy policy{' '}
      </a>
      &
      <a href="https://magic.link/legal/terms-of-service" target="_blank" rel="noreferrer">
        {' '}
        terms
      </a>
      .
    </div>
  ) : (
    <PrivacyAndTerms
      style={{
        // correct spacing because secured by magic component
        // is globally set for Auth and Connect.
        marginBottom: '-32px',
      }}
    />
  );

  const renderThirdPartyWallets = () => {
    if (
      !LAUNCH_DARKLY_FEATURE_FLAGS['is-third-party-wallets-enabled'] ||
      isLoadingClientConfig ||
      isMobileSDK() ||
      !isGlobalAppScope()
    )
      return null;

    return (
      <Flex.Row justifyContent="center" className={styles.altWalletsContainer}>
        {thirdPartyWalletProviders.length > 0 && (
          <CallToActionOverload
            outline
            style={{ width: '100%' }}
            key="wallet"
            leadingIcon={WalletIconFull}
            onClick={() => {
              const orderedWallets = orderWallets(thirdPartyWalletProviders);
              connectStore.dispatch(setEnabledThirdPartyWallets(orderedWallets));
              navigateTo('third-party-wallet-connection-page', eventData);
            }}
            onKeyPress={() => {
              const orderedWallets = orderWallets(thirdPartyWalletProviders);
              connectStore.dispatch(setEnabledThirdPartyWallets(orderedWallets));
              navigateTo('third-party-wallet-connection-page', eventData);
            }}
          >
            Connect Wallet
          </CallToActionOverload>
        )}
      </Flex.Row>
    );
  };
  const shouldShowForm = !isLoading && !error && !isLoginCompleted;
  return (
    <>
      <ModalHeader
        rightAction={<CancelActionButton />}
        header={
          <Typography.BodySmall weight="400" className={styles.text} tagOverride="span">
            {showCustomForbesCopy ? 'Log in' : 'Sign in'} to <AppName /> {showCustomForbesCopy && ' with Magic'}
          </Typography.BodySmall>
        }
      />
      <div className={styles.loginPromptPage}>
        <Spacer size={16} orientation="vertical" />
        {isMagicLogoHidden && <ThemeLogo height="56px" width="56px" style={{ borderRadius: '50%', margin: 'auto' }} />}
        {!isMagicLogoHidden && (
          <>{isMagicWalletDapp() ? <Icon type={MagicGradientIcon} size={56} /> : <SharedLogo />}</>
        )}
        <Spacer size={32} orientation="vertical" />
        {error && (
          <Typography.BodyMedium>There was an error logging in. Please refresh and try again.</Typography.BodyMedium>
        )}
        {isLoading && <LoadingSpinner />}
        {isLoginCompleted && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            <Icon aria-label={i18n.generic.success.toString()} type={renderSuccessCheckmark()} />
          </motion.div>
        )}
        {shouldShowForm && (
          <>
            {!isWebview && lastSelectedLoginType && !isFirstLogin && isGlobalAppScope() && (
              <>
                <Typography.BodySmall weight="400" className={styles.text}>
                  You last logged in with <strong>{LoginTypeToCopyMap[lastSelectedLoginType]}</strong>
                </Typography.BodySmall>
                <Spacer size={12} orientation="vertical" />
              </>
            )}
            <AnimatePresence exitBeforeEnter>
              <motion.div
                key={loginType}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0, transition: { ease: 'easeIn', duration: 0.15 } }}
                initial={{ y: 10, opacity: 0 }}
              >
                {loginForm}
              </motion.div>
            </AnimatePresence>
            {/* Temporarily Disable third party wallet in mobile SDK */}
            {(!isWebview || thirdPartyWalletProviders.length > 0) && !isMobileSDK() && isGlobalAppScope() && (
              <>
                <Spacer size={15} orientation="vertical" />
                <Typography.H6 className={styles.text}>OR</Typography.H6>
                <Spacer size={15} orientation="vertical" />
              </>
            )}
            {loginOptions}
            <Spacer size={15} orientation="vertical" />
            {renderThirdPartyWallets()}
          </>
        )}
        <Spacer size={32} orientation="vertical" />
        {privacyAndTerms}
      </div>
    </>
  );
};
