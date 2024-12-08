import { ActionType, createReducer } from 'typesafe-actions';
import { Alpha2Code } from '../../pnp/components/login-page/forms/sms-form/country-metadata';
import * as RevealActions from './reveal.actions';

interface RevealState {
  email?: string;
  username?: string;
  phoneNumber?: string;
  countryCode?: Alpha2Code;
  phoneNumberForLogin?: string;
}

type RevealActions = ActionType<typeof RevealActions>;

const initialState: RevealState = {
  email: '',
  phoneNumber: '',
  countryCode: 'US',
  phoneNumberForLogin: '',
};

export const RevealReducer = createReducer<RevealState, RevealActions>(initialState)
  .handleAction(RevealActions.setEmailForm, (state, action) => ({
    ...state,
    email: action.payload,
  }))
  .handleAction(RevealActions.setWebAuthnForm, (state, action) => ({
    ...state,
    username: action.payload,
  }))
  .handleAction(RevealActions.setPhoneNumberForm, (state, action) => ({
    ...state,
    phoneNumber: action.payload,
  }))
  .handleAction(RevealActions.setSelectedCountryCode, (state, action) => ({
    ...state,
    countryCode: action.payload,
  }))
  .handleAction(RevealActions.setPhoneNumberForLogin, (state, action) => ({
    ...state,
    phoneNumberForLogin: action.payload,
  }));
