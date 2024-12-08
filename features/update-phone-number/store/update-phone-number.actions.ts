import { createAction } from 'typesafe-actions';
import * as actionTypes from './update-phone-number.actionTypes';
import { Alpha2Code } from '~/features/pnp/components/login-page/forms/sms-form/country-metadata';

export const setPhoneNumberForm = createAction(
  actionTypes.SET_PHONE_NUMBER_FORM,
  (phoneNumber: string) => phoneNumber,
)();

export const setSelectedCountryCode = createAction(
  actionTypes.SET_SELECTED_COUNTRY_CODE,
  (alpha2Code: Alpha2Code) => alpha2Code,
)();

export const setSelectedCountryCodeCallingCode = createAction(
  actionTypes.SET_SELECTED_COUNTRY_CODE_CALLING_CODE,
  (selectedCountryCallingCode: string) => {
    return `+${selectedCountryCallingCode}`;
  },
)();

export const setAuthFactorId = createAction(actionTypes.SET_AUTH_FACTOR_ID, (authFactorId: string) => authFactorId)();

export const setParsedPhoneNumber = createAction(actionTypes.SET_PARSED_PHONE_NUMBER, (parsedPhoneNumber: string) => {
  return parsedPhoneNumber;
})();
