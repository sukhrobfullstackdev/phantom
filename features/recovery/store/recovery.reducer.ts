import { ActionType, createReducer } from 'typesafe-actions';
import { Alpha2Code } from 'i18n-iso-countries';
import { createPersistReducer } from '~/app/store/persistence';
import * as RecoveryActions from './recovery.actions';

// initialState
interface RecoveryState {
  isDeepLink: boolean;
  phoneNumber: string;
  countryCode: Alpha2Code;
  phoneNumberForLogin: string;
  rom?: string;
  selectedCountryCallingCode: string;
  primaryFactorToRecover?: string;
  currentFactorId?: string;
  newFactorId?: string;
  currentFactorValue?: string;
}

type RecoveryActions = ActionType<typeof RecoveryActions>;

const initialState: RecoveryState = {
  isDeepLink: false,
  phoneNumber: '',
  countryCode: 'US',
  phoneNumberForLogin: '',
  rom: undefined,
  selectedCountryCallingCode: '+1',
  primaryFactorToRecover: undefined,
  currentFactorId: undefined,
  newFactorId: undefined,
  currentFactorValue: undefined,
};

const RecoveryReducer = createReducer<RecoveryState, RecoveryActions>(initialState)
  .handleAction(RecoveryActions.setPhoneNumberForm, (state, action) => ({
    ...state,
    phoneNumber: action.payload,
  }))
  .handleAction(RecoveryActions.setSelectedCountryCode, (state, action) => ({
    ...state,
    countryCode: action.payload,
  }))
  .handleAction(RecoveryActions.setPhoneNumberForLogin, (state, action) => ({
    ...state,
    phoneNumberForLogin: action.payload,
  }))
  .handleAction(RecoveryActions.setSelectedCountryCodeCallingCode, (state, action) => ({
    ...state,
    selectedCountryCallingCode: action.payload,
  }))
  .handleAction(RecoveryActions.setPrimaryFactorToRecover, (state, action) => ({
    ...state,
    primaryFactorToRecover: action.payload,
  }))
  .handleAction(RecoveryActions.setCurrentFactorId, (state, action) => ({
    ...state,
    currentFactorId: action.payload,
  }))
  .handleAction(RecoveryActions.setNewFactorId, (state, action) => ({
    ...state,
    newFactorId: action.payload,
  }))
  .handleAction(RecoveryActions.setCurrentFactorValue, (state, action) => ({
    ...state,
    currentFactorValue: action.payload,
  }))
  .handleAction(RecoveryActions.setDeepLink, (state, action) => ({
    ...state,
    isDeepLink: action.payload,
  }))
  .handleAction(RecoveryActions.initRecoveryState, (state, action) => ({
    ...initialState,
  }));

export const Recovery = createPersistReducer('recovery', RecoveryReducer);
