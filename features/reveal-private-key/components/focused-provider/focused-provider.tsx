import React from 'react';
import { Spacer } from '@magiclabs/ui';
import { motion } from 'framer-motion';
import { LoginButton } from '../login-buttons';
import { EmailLinkForm } from '../forms/email-link-form';
import { useLoginPageContext } from '../context';
import { LoginMethodType } from '~/app/constants/flags';
import { SmsForm } from '../forms/sms-form';
import { WebAuthnForm } from '../forms/webauthn-form';

import styles from './focused-provider.less';

type LoginButtonComponentType = (typeof LoginButton)[keyof typeof LoginButton];

export const FocusedProvider: React.FC = () => {
  const { providers, focusedProvider } = useLoginPageContext();

  if (!focusedProvider || !providers.includes(focusedProvider)) {
    return null;
  }

  switch (focusedProvider) {
    case LoginMethodType.EmailLink:
      return <EmailLinkForm />;

    case LoginMethodType.WebAuthn:
      return <WebAuthnForm />;

    case LoginMethodType.SMS:
      return <SmsForm />;

    default:
      return (
        <>
          <motion.div
            key={`FocusedProvider:${focusedProvider}`}
            layoutId={`FocusedProvider:${focusedProvider}`}
            layout="position"
            className={styles.FocusedProviderButton}
          >
            {React.createElement(LoginButton[focusedProvider] as LoginButtonComponentType, { size: 'full' })}
          </motion.div>

          <Spacer size={10} orientation="vertical" />
        </>
      );
  }
};
