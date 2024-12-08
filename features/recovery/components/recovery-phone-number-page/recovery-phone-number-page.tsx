import React, { useCallback, useEffect, useState } from 'react';
import { CallToAction, Flex, Icon, mergeProps, Spacer } from '@magiclabs/ui';
import { Alpha2Code } from 'i18n-iso-countries';
import { useTheme } from '~/app/ui/hooks/use-theme';
import styles from './recovery-phone-number-page.less';
import { PhoneLogo } from '~/shared/svg/account-recovery';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { SMSForm } from '~/features/pnp/components/login-page/forms/sms-form/sms-form';
import { i18n } from '~/app/libs/i18n';
import { recoveryStore } from '~/features/recovery/store';
import {
  setPhoneNumberForLogin,
  setPhoneNumberForm,
  setSelectedCountryCode,
  setSelectedCountryCodeCallingCode,
} from '~/features/recovery/store/recovery.actions';
import { isSetupRecoveryFlow } from '~/features/recovery/utils/utils';
import { RecoverySMSPageProps } from '~/features/recovery/components/setup-recovery-sms-verification-page';
import { EditPhoneNumberLogo } from '~/shared/svg/sms';
import { useSetupSmsRecovery } from '~/features/recovery/hooks/setupSmsRecoveryHooks';
import { ErrorMsg } from '~/app/ui/components/widgets/error-msg';
import { getApiKey } from '~/app/libs/api-key';
import {
  ACCOUNT_ALREADY_EXISTS,
  INVALID_FACTOR_VERIFIER_CREDENTIALS,
  MALFORMED_PHONE_NUMBER,
  RECOVERY_FACTOR_ALREADY_EXISTS,
} from '~/features/recovery/services/recovery/errorCodes';
import { UIThreadThunks } from '~/app/store/ui-thread/ui-thread.thunks';
import { useDispatch } from '~/app/ui/hooks/redux-hooks';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { useEditSmsRecovery } from '~/features/recovery/hooks/editSmsRecoveryHooks';
import { RecoveryService } from '../../services/recovery';
import { useAsyncEffect } from 'usable-react';

export const RecoveryPhoneNumberPage: React.FC<RecoverySMSPageProps> = ({ navBackRoute, flow }) => {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { navigateTo, resetToDefaultPage } = useControllerContext();
  const { setupRecoveryFactor, error: setupError } = useSetupSmsRecovery();
  const { editRecoveryFactor, error: editError } = useEditSmsRecovery();
  const apiKey: string = getApiKey();
  // Form state, you need to setup these three values for the CTA. This can't be SMSForm

  const error = setupError || editError;

  // This is used to for force updating
  const [errorMsg, setErrorMsg] = useState('');
  const [phoneNumberState, setPhoneNumberState] = useState('');
  const [reRender, setReRender] = useState('');
  const [requestInProgress, setRequestInProgress] = useState(false);
  const [unsupportedCountryCodes, setUnsupportedCountryCodes] = useState<string[]>([]);

  // Redux Data store
  const phone = recoveryStore.hooks.useSelector(state => state.phoneNumber) ?? '';
  const selectedCountryCode = recoveryStore.hooks.useSelector(state => state.countryCode) ?? 'US';
  const phoneNumberForLogin = recoveryStore.hooks.useSelector(state => state.phoneNumberForLogin) ?? '';
  const isDeepLink = recoveryStore.hooks.useSelector(state => state.isDeepLink);

  // Redux data actions
  const updateSelectedCountryCodeCallingCodeAction = (value: string) =>
    recoveryStore.dispatch(setSelectedCountryCodeCallingCode(value));
  const updatePhoneAction = (value: string) => {
    setPhoneNumberState(value);
    return recoveryStore.dispatch(setPhoneNumberForm(value));
  };
  const updatePhoneNumberForLoginAction = (phoneNumber: string) => {
    setReRender(phoneNumber);
    return recoveryStore.dispatch(setPhoneNumberForLogin(phoneNumber));
  };
  const updateCountryCodeAction = (code: string) => {
    setReRender(code);
    return recoveryStore.dispatch(setSelectedCountryCode(code as Alpha2Code));
  };

  useEffect(() => {
    if (error === ACCOUNT_ALREADY_EXISTS || error === RECOVERY_FACTOR_ALREADY_EXISTS) {
      setErrorMsg(i18n.update_email.account_already_exists.toString({ type: 'phone number', appName: theme.appName }));
    }
    if (error === MALFORMED_PHONE_NUMBER) {
      setErrorMsg(i18n.login_sms.malformed_phone_number.toString());
    }
    if (error === INVALID_FACTOR_VERIFIER_CREDENTIALS) {
      setErrorMsg(i18n.recovery.invalid_credential.toString());
    }
  }, [error]);

  useAsyncEffect(async () => {
    const result = await RecoveryService.getUnsuportedCountries(apiKey);

    if (result.data) {
      setUnsupportedCountryCodes(result.data);
    }
  }, []);

  // submit action
  const doSMSLogin = useCallback(async () => {
    if (isSetupRecoveryFlow(flow)) {
      const isFactorSuccessful = await setupRecoveryFactor(phoneNumberForLogin);
      if (isFactorSuccessful) return navigateTo('add-sms-recovery-verification');
    } else {
      const isFactorSuccessful = await editRecoveryFactor(phoneNumberForLogin);
      if (isFactorSuccessful) return navigateTo('edit-sms-recovery-verification');
    }
    setRequestInProgress(false);
  }, [phoneNumberState, phoneNumberForLogin]);

  // cancel action
  const cancel = useCallback(() => {
    if (isDeepLink) {
      dispatch(UIThreadThunks.releaseLockAndHideUI({ error: sdkErrorFactories.magic.userRejectAction() }));
    } else {
      navigateTo('auth-settings');
    }
  }, []);

  return (
    <div className={styles.AddPhoneNumberPage}>
      <ModalHeader
        leftAction={!isDeepLink ? <BackActionButton onClick={() => navigateTo(navBackRoute)} /> : null}
        rightAction={<CancelActionButton />}
      />
      <Spacer size={32} orientation="vertical" />
      <Icon className={styles.logo} type={isSetupRecoveryFlow(flow) ? PhoneLogo : EditPhoneNumberLogo} />
      <Spacer size={24} orientation="vertical" />
      <h1 className={styles.title}>{isSetupRecoveryFlow(flow) ? 'Add a phone number' : 'Update phone number'}</h1>
      <div className={styles.description}> This acts as a backup method for accessing your {theme.appName} account</div>
      <Spacer size={32} orientation="vertical" />

      <div className={styles.SMSLinkForm}>
        {/* This is the phone number input... */}
        <SMSForm
          phone={phoneNumberState}
          selectedCountryCode={selectedCountryCode}
          requestInProgress={requestInProgress}
          doSMSLogin={doSMSLogin}
          updatePhoneAction={updatePhoneAction}
          updatePhoneNumberForLoginAction={updatePhoneNumberForLoginAction}
          updateCountryCodeAction={updateCountryCodeAction}
          updateSelectedCountryCodeCallingCodeAction={updateSelectedCountryCodeCallingCodeAction}
          unsupportedCountryCodes={unsupportedCountryCodes}
        />
        <ErrorMsg errorMsg={errorMsg} paddingTop={0} />
        <Spacer size={8} orientation="vertical" />

        {isSetupRecoveryFlow(flow) ? (
          <Flex.Row justifyContent="space-between">
            <CallToAction color="secondary" className={styles.cancelBtn} style={{ width: '45%' }} onClick={cancel}>
              {i18n.update_email.cancel.toString()}
            </CallToAction>

            <CallToAction
              style={{ width: '45%' }}
              disabled={requestInProgress || !phone.length}
              {...mergeProps({ onPress: () => setRequestInProgress(true) }, { onPress: doSMSLogin })}
            >
              {i18n.mfa.next.toString()}
            </CallToAction>
          </Flex.Row>
        ) : (
          <Flex.Column alignItems="center">
            <CallToAction
              className={styles.update}
              disabled={requestInProgress || !phone.length}
              {...mergeProps({ onPress: () => setRequestInProgress(true) }, { onPress: doSMSLogin })}
            >
              Update
            </CallToAction>
            <Spacer size={16} orientation="vertical" />
            <div>
              <button className={styles.removeTextLink} onClick={() => navigateTo('remove-phone-number')}>
                Remove phone number
              </button>
            </div>
          </Flex.Column>
        )}
      </div>
    </div>
  );
};
