import React, { useCallback, useMemo, useState } from 'react';
import { clsx, Flex, Linkable, Spacer, useSlotID } from '@magiclabs/ui';
import { AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { LoginPageContext } from './context';
import { FocusedProvider } from './focused-provider';
import { AdditionalProviders } from './additional-providers';
import { i18n } from '~/app/libs/i18n';
import { LoginMethodType } from '~/app/constants/flags';
import { NoProvidersConfigured } from './no-providers-configured';

import styles from './login-page.less';
import { useTheme } from '~/app/ui/hooks/use-theme';

interface LoginProps {
  providers: string[];
  lastUsedProvider?: string;
  termsOfServiceURI?: string;
  privacyPolicyURI?: string;
}

export const LoginPage: React.FC<LoginProps> = props => {
  const { providers, lastUsedProvider, termsOfServiceURI, privacyPolicyURI } = props;

  const [requestInProgress, setRequestInProgress] = useState(false);
  const initiateRequest = useCallback(() => {
    setRequestInProgress(true);
  }, []);

  const [focusedProvider, setFocusedProvider] = useState<string | undefined>(() => {
    // If no `lastUsedProvider` is given, we'll default to one of the given primary auth providers.
    const defaultFocusedProvider = providers.find(i =>
      [LoginMethodType.EmailLink, LoginMethodType.SMS].includes(i as any),
    );
    return lastUsedProvider ?? defaultFocusedProvider;
  });

  const ctx: LoginPageContext = useMemo(
    () => ({
      providers,
      lastUsedProvider,
      focusedProvider,
      setFocusedProvider,
      requestInProgress,
      initiateRequest,
    }),

    [providers, lastUsedProvider, focusedProvider, requestInProgress],
  );

  return (
    <LoginPageContext.Provider value={ctx}>
      <Flex.Column horizontal="center" className={styles.LoginPage}>
        <ThemeLogo height={60} />
        <Spacer size={32} orientation="vertical" />
        <h1>{lastUsedProvider ? i18n.pnp.welcome_back.toString() : i18n.pnp.welcome.toString()}</h1>
        <Spacer size={40} orientation="vertical" />

        {providers.length ? (
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
        ) : (
          <NoProvidersConfigured />
        )}

        <BrowseWrapText privacyPolicyURI={privacyPolicyURI} termsOfServiceURI={termsOfServiceURI} />
      </Flex.Column>
    </LoginPageContext.Provider>
  );
};

interface BrowseWrapTextProps {
  termsOfServiceURI?: string;
  privacyPolicyURI?: string;
}

const BrowseWrapText: React.FC<BrowseWrapTextProps> = props => {
  const { termsOfServiceURI, privacyPolicyURI } = props;

  const hasTermsOrPrivacyLinks = !!termsOfServiceURI || !!privacyPolicyURI;
  const hasTermsAndPrivacyLinks = !!termsOfServiceURI && !!privacyPolicyURI;

  const { theme } = useTheme();
  const browsewrapLabelIDs = [useSlotID(), useSlotID(), useSlotID(), useSlotID()];

  return hasTermsOrPrivacyLinks ? (
    <div className={styles.BrowseWrapText}>
      <Spacer size={24} orientation="vertical" />

      <p aria-labelledby={clsx(browsewrapLabelIDs)}>
        <Flex.Column vertical="center">
          <span id={browsewrapLabelIDs[0]} aria-hidden="true">
            {i18n.pnp.browsewrap_text.toString({ appName: theme.appName })}
          </span>

          <Flex.Row className={styles.legalLinks} horizontal="center">
            {!!privacyPolicyURI && (
              <Linkable>
                <a id={browsewrapLabelIDs[1]} href={privacyPolicyURI} target="_blank" rel="noopener noreferrer">
                  {i18n.pnp.privacy_policy.toString()}
                </a>
              </Linkable>
            )}

            {hasTermsAndPrivacyLinks && (
              <span id={browsewrapLabelIDs[2]} className={styles.ampersand} aria-hidden="true">
                &
              </span>
            )}

            {!!termsOfServiceURI && (
              <Linkable>
                <a id={browsewrapLabelIDs[3]} href={termsOfServiceURI} target="_blank" rel="noopener noreferrer">
                  {i18n.pnp.terms_of_service.toString()}
                </a>
              </Linkable>
            )}
          </Flex.Row>
        </Flex.Column>
      </p>
    </div>
  ) : null;
};
