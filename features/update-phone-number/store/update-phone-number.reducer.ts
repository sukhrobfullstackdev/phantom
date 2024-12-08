import { ActionType, createReducer } from 'typesafe-actions';
import { Alpha2Code } from 'i18n-iso-countries';
import { createPersistReducer } from '~/app/store/persistence';
import * as UpdatePhoneNumberActions from './update-phone-number.actions';

// initialState
interface UpdatePhoneNumberState {
  phoneNumber: string;
  countryCode: Alpha2Code;
  selectedCountryCallingCode: string;
  parsedPhoneNumber?: string;
  authFactorId?: string;
}

type UpdatePhoneNumberActions = ActionType<typeof UpdatePhoneNumberActions>;

const initialState: UpdatePhoneNumberState = {
  phoneNumber: '',
  countryCode: 'US',
  selectedCountryCallingCode: '+1',
  parsedPhoneNumber: '',
  authFactorId: undefined,
};

const UpdatePhoneNumberReducer = createReducer<UpdatePhoneNumberState, UpdatePhoneNumberActions>(initialState)
  .handleAction(UpdatePhoneNumberActions.setPhoneNumberForm, (state, action) => ({
    ...state,
    phoneNumber: action.payload,
  }))
  .handleAction(UpdatePhoneNumberActions.setSelectedCountryCode, (state, action) => ({
    ...state,
    countryCode: action.payload,
  }))
  .handleAction(UpdatePhoneNumberActions.setSelectedCountryCodeCallingCode, (state, action) => ({
    ...state,
    selectedCountryCallingCode: action.payload,
  }))
  .handleAction(UpdatePhoneNumberActions.setAuthFactorId, (state, action) => ({
    ...state,
    authFactorId: action.payload,
  }))
  .handleAction(UpdatePhoneNumberActions.setParsedPhoneNumber, (state, action) => ({
    ...state,
    parsedPhoneNumber: action.payload,
  }));

export const UpdatePhoneNumber = createPersistReducer('update_phone_number', UpdatePhoneNumberReducer);
