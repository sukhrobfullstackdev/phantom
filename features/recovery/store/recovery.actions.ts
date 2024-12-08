import { createAction } from 'typesafe-actions';
import * as actionTypes from './recovery.actionTypes';
import { Alpha2Code } from '~/features/pnp/components/login-page/forms/sms-form/country-metadata';

export const setPhoneNumberForm = createAction(
  actionTypes.SET_PHONE_NUMBER_FORM,
  (phoneNumber: string) => phoneNumber,
)();

export const setSelectedCountryCode = createAction(
  actionTypes.SET_SELECTED_COUNTRY_CODE,
  (alpha2Code: Alpha2Code) => alpha2Code,
)();

export const setPhoneNumberForLogin = createAction(
  actionTypes.SET_PHONE_NUMBER_FOR_LOGIN,
  (phoneNumberForLogin: string) => {
    return phoneNumberForLogin;
  },
)();
export const setSelectedCountryCodeCallingCode = createAction(
  actionTypes.SET_SELECTED_COUNTRY_CODE_CALLING_CODE,
  (selectedCountryCallingCode: string) => {
    return `+${selectedCountryCallingCode}`;
  },
)();

export const setPrimaryFactorToRecover = createAction(
  actionTypes.SET_PRIMARY_FACTOR_TO_RECOVER,
  (email?: string) => email,
)();

export const setDeepLink = createAction(actionTypes.SET_DEEP_LINK, (isDeepLink: boolean) => isDeepLink)();

export const initRecoveryState = createAction(actionTypes.INIT_RECOVERY_STATE, () => {})();

export const setCurrentFactorId = createAction(actionTypes.SET_CURRENT_FACTOR_ID, (factorId?: string) => factorId)();
export const setNewFactorId = createAction(actionTypes.SET_NEW_FACTOR_ID, (factorId?: string) => factorId)();
export const setCurrentFactorValue = createAction(actionTypes.SET_CURRENT_FACTOR_VALUE, (value?: string) => value)();
