import { ActionType, createReducer } from 'typesafe-actions';
import { Alpha2Code } from '../components/login-page/forms/sms-form/country-metadata';
import * as PNPActions from './pnp.actions';

interface PNPState {
  email?: string;
  phoneNumber?: string;
  countryCode?: Alpha2Code;
  phoneNumberForLogin?: string;
}

type PNPActions = ActionType<typeof PNPActions>;

const initialState: PNPState = {
  email: '',
  phoneNumber: '',
  countryCode: 'US',
  phoneNumberForLogin: '',
};

export const PNPReducer = createReducer<PNPState, PNPActions>(initialState)
  .handleAction(PNPActions.setEmailForm, (state, action) => ({
    ...state,
    email: action.payload,
  }))
  .handleAction(PNPActions.setPhoneNumberForm, (state, action) => ({
    ...state,
    phoneNumber: action.payload,
  }))
  .handleAction(PNPActions.setSelectedCountryCode, (state, action) => ({
    ...state,
    countryCode: action.payload,
  }))
  .handleAction(PNPActions.setPhoneNumberForLogin, (state, action) => ({
    ...state,
    phoneNumberForLogin: action.payload,
  }));
