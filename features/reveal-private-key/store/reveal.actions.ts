import { createAction } from 'typesafe-actions';
import { Alpha2Code } from '../../pnp/components/login-page/forms/sms-form/country-metadata';
import * as actionTypes from './reveal.actionTypes';

export const setEmailForm = createAction(actionTypes.SET_EMAIL_FORM, (email: string) => email)();

export const setWebAuthnForm = createAction(actionTypes.SET_WEB_AUTHN_FORM, (username: string) => username)();

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
  (phoneNumberForLogin: string) => phoneNumberForLogin,
)();
