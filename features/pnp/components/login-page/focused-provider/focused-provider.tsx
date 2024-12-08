/* eslint-disable no-nested-ternary */

import React from 'react';
import { CallToAction, mergeProps, Spacer } from '@magiclabs/ui';
import { motion } from 'framer-motion';
import { Alpha2Code } from 'i18n-iso-countries';
import { LoginButton } from '../login-buttons';
import { EmailLinkForm } from '../forms/email-link-form';
import { useLoginPageContext } from '../context';
import { LoginMethodType } from '~/app/constants/flags';

import styles from './focused-provider.less';
import { pnpStore } from '~/features/pnp/store';
import { setPhoneNumberForLogin, setPhoneNumberForm, setSelectedCountryCode } from '~/features/pnp/store/pnp.actions';
import { useCloseUIThread } from '~/app/ui/hooks/ui-thread-hooks';
import { SMSForm } from '~/features/pnp/components/login-page/forms/sms-form/sms-form';
import { i18n } from '~/app/libs/i18n';

type LoginButtonComponentType = (typeof LoginButton)[keyof typeof LoginButton];

export const FocusedProvider: React.FC = () => {
  const { providers, focusedProvider } = useLoginPageContext();

  if (!focusedProvider || !providers.includes(focusedProvider)) {
    return null;
  }

  switch (focusedProvider) {
    case LoginMethodType.EmailLink:
      return <EmailLinkForm />;

    case LoginMethodType.SMS:
      return <PNPSmsForm />;

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

interface SMSFormProps {}

/**
 * This component is thicc, complex, and coupled with a few really fragile
 * dependencies inside `@magiclabs/ui`. Please read the comments throughout.
 */
const PNPSmsForm: React.FC<SMSFormProps> = props => {
  // Form state, you need to setup these three values for the CTA
  const phone = pnpStore.hooks.useSelector(state => state.phoneNumber) ?? '';
  const selectedCountryCode = pnpStore.hooks.useSelector(state => state.countryCode) ?? 'US';
  const phoneNumberForLogin = pnpStore.hooks.useSelector(state => state.phoneNumberForLogin) ?? '';

  const updatePhoneAction = value => pnpStore.dispatch(setPhoneNumberForm(value));
  const updatePhoneNumberForLoginAction = phoneNumber => pnpStore.dispatch(setPhoneNumberForLogin(phoneNumber));
  const updateCountryCodeAction = code => pnpStore.dispatch(setSelectedCountryCode(code as Alpha2Code));

  const { requestInProgress, initiateRequest } = useLoginPageContext();

  // submit action. This will resolve JSONRpc with SMS and phone number to SDK and invoke a new loginWithSMS called
  const doSMSLogin = useCloseUIThread([LoginMethodType.SMS, phoneNumberForLogin]);

  return (
    <div className={styles.SMSLinkForm}>
      {/* This is the phone number input... */}
      <SMSForm
        requestInProgress={requestInProgress}
        doSMSLogin={doSMSLogin}
        phone={phone}
        selectedCountryCode={selectedCountryCode}
        updatePhoneAction={updatePhoneAction}
        updatePhoneNumberForLoginAction={updatePhoneNumberForLoginAction}
        updateCountryCodeAction={updateCountryCodeAction}
      />
      <Spacer size={24} orientation="vertical" />

      {/* Submit button */}
      <CallToAction
        className={styles.submit}
        disabled={requestInProgress || !phone.length}
        aria-label={i18n.pnp.login_signup_aria.toString()}
        {...mergeProps({ onPress: initiateRequest }, { onPress: doSMSLogin })}
      >
        {i18n.pnp.login_signup.toString()}
      </CallToAction>
    </div>
  );
};
