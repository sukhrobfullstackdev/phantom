import React from 'react';
import { CallToAction, mergeProps } from '@magiclabs/ui';
import { Alpha2Code } from 'i18n-iso-countries';
import { useLoginPageContext } from '../../context';
import { LoginMethodType } from '~/app/constants/flags';
import styles from './sms-form.less';
import { revealStore } from '~/features/reveal-private-key/store';
import {
  setPhoneNumberForLogin,
  setPhoneNumberForm,
  setSelectedCountryCode,
} from '~/features/reveal-private-key/store/reveal.actions';
import { useCloseUIThread } from '~/app/ui/hooks/ui-thread-hooks';
import { SMSForm } from '~/features/pnp/components/login-page/forms/sms-form/sms-form';

export const SmsForm: React.FC = () => {
  const phone = revealStore.hooks.useSelector(state => state.phoneNumber) ?? '';
  const selectedCountryCode = revealStore.hooks.useSelector(state => state.countryCode) ?? 'US';
  const phoneNumberForLogin = revealStore.hooks.useSelector(state => state.phoneNumberForLogin) ?? '';

  const updatePhoneAction = value => revealStore.dispatch(setPhoneNumberForm(value));
  const updatePhoneNumberForLoginAction = phoneNumber => revealStore.dispatch(setPhoneNumberForLogin(phoneNumber));
  const updateCountryCodeAction = code => revealStore.dispatch(setSelectedCountryCode(code as Alpha2Code));

  const { requestInProgress, initiateRequest } = useLoginPageContext();

  const doSMSLogin = useCloseUIThread([LoginMethodType.SMS, phoneNumberForLogin]);

  return (
    <div className={styles.SMSLinkForm}>
      <SMSForm
        requestInProgress={requestInProgress}
        doSMSLogin={doSMSLogin}
        phone={phone}
        selectedCountryCode={selectedCountryCode}
        updatePhoneAction={updatePhoneAction}
        updatePhoneNumberForLoginAction={updatePhoneNumberForLoginAction}
        updateCountryCodeAction={updateCountryCodeAction}
      />

      <CallToAction
        className={styles.submit}
        disabled={requestInProgress || !phone.length}
        aria-label="Log in"
        {...mergeProps({ onPress: initiateRequest }, { onPress: doSMSLogin })}
      >
        Log in
      </CallToAction>
    </div>
  );
};
