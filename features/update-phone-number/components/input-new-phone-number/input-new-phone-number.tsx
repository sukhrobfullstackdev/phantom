import React, { useEffect, useState } from 'react';
import { Flex, Icon, mergeProps, Spacer } from '@magiclabs/ui';
import { Alpha2Code } from 'i18n-iso-countries';
import { useTheme } from '~/app/ui/hooks/use-theme';
import styles from './input-new-phone-number.less';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { SMSForm } from '~/features/pnp/components/login-page/forms/sms-form/sms-form';
import { i18n } from '~/app/libs/i18n';
import { updatePhoneNumberStore } from '~/features/update-phone-number/store';
import {
  setParsedPhoneNumber,
  setPhoneNumberForm,
  setSelectedCountryCode,
  setSelectedCountryCodeCallingCode,
} from '~/features/update-phone-number/store/update-phone-number.actions';
import { useCloseUIThread } from '~/app/ui/hooks/ui-thread-hooks';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { CallToActionStateful } from '~/features/connect-with-ui/components/call-to-action-overload';
import { EditPhoneNumberLogo } from '~/shared/svg/sms';
import { useUpdatePhoneNumberService } from '~/features/update-phone-number/hooks/updatePhoneNumberHooks';
import { ErrorMsg } from '~/app/ui/components/widgets/error-msg';
import {
  ACCOUNT_ALREADY_EXISTS,
  AUTH_METHOD_FORBIDDEN,
  MALFORMED_PHONE_NUMBER,
} from '~/features/update-phone-number/services/update-phone-number-error-codes';

export const InputNewPhoneNumber = () => {
  const { theme } = useTheme();
  const { navigateTo } = useControllerContext();
  const { startAuthUserFactor, error } = useUpdatePhoneNumberService();
  const [phoneState, setPhoneState] = useState('');
  const [countryState, setCountryState] = useState('');
  const [requestInProgress, setRequestInProgress] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Redux Data store
  const phone = updatePhoneNumberStore.hooks.useSelector(state => state.phoneNumber) ?? '';
  const selectedCountryCode = updatePhoneNumberStore.hooks.useSelector(state => state.countryCode) ?? 'US';

  // Redux data actions
  const updateSelectedCountryCodeCallingCodeAction = (value: string) =>
    updatePhoneNumberStore.dispatch(setSelectedCountryCodeCallingCode(value));

  const updatePhoneAction = (value: string) => {
    setPhoneState(value);
    return updatePhoneNumberStore.dispatch(setPhoneNumberForm(value));
  };
  const updateCountryCodeAction = (code: Alpha2Code) => {
    setCountryState(code);
    return updatePhoneNumberStore.dispatch(setSelectedCountryCode(code));
  };
  const updateParsedPhoneNumber = (phoneNumber: string) =>
    updatePhoneNumberStore.dispatch(setParsedPhoneNumber(phoneNumber));

  useEffect(() => {
    if (error === AUTH_METHOD_FORBIDDEN) {
      setErrorMsg(i18n.update_phone_number.auth_method_forbidden.toString());
    }
    if (error === MALFORMED_PHONE_NUMBER) {
      setErrorMsg(i18n.login_sms.malformed_phone_number.toString());
    }
    if (error === ACCOUNT_ALREADY_EXISTS) {
      setErrorMsg(i18n.update_email.account_already_exists.toString({ type: 'phone number', appName: theme.appName }));
    }
  }, [error]);

  const doSMSLogin = async () => {
    const success = await startAuthUserFactor();
    setRequestInProgress(false);
    if (success) {
      navigateTo('update-phone-number-verification');
    }
  };

  return (
    <div className={styles.InputNewPhoneNumber}>
      <ModalHeader rightAction={<CancelActionButton />} header={theme.appName} />
      <Spacer size={36} orientation="vertical" />
      <Icon type={EditPhoneNumberLogo} />
      <Spacer size={32} orientation="vertical" />
      <h1 className={styles.title}>{i18n.update_phone_number.title.toString()}</h1>
      <div className={styles.description}>
        {' '}
        {i18n.update_phone_number.description.toString()} <b>{theme.appName}</b>
      </div>
      <Spacer size={40} orientation="vertical" />

      <div className={styles.SMSLinkForm}>
        <SMSForm
          phone={phoneState}
          selectedCountryCode={selectedCountryCode}
          requestInProgress={requestInProgress}
          doSMSLogin={doSMSLogin}
          updatePhoneAction={updatePhoneAction}
          updatePhoneNumberForLoginAction={updateParsedPhoneNumber}
          updateCountryCodeAction={updateCountryCodeAction}
          updateSelectedCountryCodeCallingCodeAction={updateSelectedCountryCodeCallingCodeAction}
        />
        <ErrorMsg errorMsg={errorMsg} paddingTop={0} />
        <Spacer size={12} orientation="vertical" />
        <Flex.Row>
          <CallToActionStateful
            className={styles.cancelBtn}
            color="secondary"
            onClick={useCloseUIThread(sdkErrorFactories.magic.userRejectAction())}
          >
            {i18n.update_phone_number.cancel.toString()}
          </CallToActionStateful>
          <Spacer size={24} orientation="horizontal" />
          <CallToActionStateful
            className={styles.signBtn}
            color="primary"
            disabled={requestInProgress || !phone.length}
            {...mergeProps({ onClick: () => setRequestInProgress(true) }, { onClick: doSMSLogin })}
          >
            {i18n.update_phone_number.update.toString()}
          </CallToActionStateful>
        </Flex.Row>
      </div>
    </div>
  );
};
