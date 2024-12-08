import React, { useCallback, useMemo, useState } from 'react';
import { Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { LockIcon } from '~/shared/svg/reveal-private-key';
import { store } from '~/app/store';
import { LoginPageContext } from '../context';
import { LoginMethodType } from '~/app/constants/flags';
import { AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import { FocusedProvider } from '../focused-provider';
import { AdditionalProviders } from '../additional-providers';
import styles from './login-form-modal.less';

export const LoginFormModal: React.FC = () => {
  const { isDefaultTheme } = useTheme();
  const { appName } = store.getState().Theme.theme;
  const { primaryLoginProviders, socialLoginProviders } = store.getState().System.configuredAuthProviders;
  const providers: string[] = primaryLoginProviders.concat(socialLoginProviders);

  const [requestInProgress, setRequestInProgress] = useState<boolean>(false);
  const initiateRequest = useCallback(() => {
    setRequestInProgress(true);
  }, []);

  const [focusedProvider, setFocusedProvider] = useState<string | undefined>(() => {
    const defaultFocusedProvider = providers.find(i =>
      [LoginMethodType.EmailLink, LoginMethodType.SMS, LoginMethodType.WebAuthn].includes(i as LoginMethodType),
    );
    return defaultFocusedProvider;
  });

  const ctx: LoginPageContext = useMemo(
    () => ({
      providers,
      focusedProvider,
      setFocusedProvider,
      requestInProgress,
      initiateRequest,
    }),

    [providers, focusedProvider, requestInProgress],
  );

  return (
    <LoginPageContext.Provider value={ctx}>
      <Flex.Column horizontal="center">
        {!isDefaultTheme('logoImage') && (
          <>
            <ThemeLogo height={69} />
            <Spacer size={20} orientation="vertical" />
          </>
        )}

        <Flex.Row horizontal="center" vertical="center">
          <Icon type={LockIcon} color="#B6B4BA" />
          <Spacer size={10} orientation="horizontal" />
          <Typography.BodySmall weight="400">Secure private key access</Typography.BodySmall>
        </Flex.Row>

        <Spacer size={36} orientation="vertical" />

        <>
          <AnimateSharedLayout>
            <AnimatePresence exitBeforeEnter initial={false}>
              <FocusedProvider />
            </AnimatePresence>
          </AnimateSharedLayout>

          <AnimateSharedLayout>
            <AnimatePresence initial={false}>
              <AdditionalProviders />
            </AnimatePresence>
          </AnimateSharedLayout>
        </>
      </Flex.Column>

      <div className={styles.offset} style={{ bottom: -165 }}>
        <Typography.BodySmall weight="700">What's Magic?</Typography.BodySmall>
        <Spacer size={8} orientation="vertical" />
        <Typography.BodySmall weight="400">
          Magic powers secure wallet services for {appName} and thousands of other trusted Web3 applications
        </Typography.BodySmall>
        <Typography.BodySmall>
          <a href="https://magic.link/" target="_blank" rel="noreferrer">
            Learn more &rarr;
          </a>
        </Typography.BodySmall>
      </div>
    </LoginPageContext.Provider>
  );
};
