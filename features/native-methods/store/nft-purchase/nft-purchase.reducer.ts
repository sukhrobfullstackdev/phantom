import { ActionType, createReducer } from 'typesafe-actions';
import * as NFTPurchaseActions from './nft-purchase.actions';

export type NFTPurchaseStatus = 'loading' | 'draft' | 'processed' | 'declined' | 'expired' | 'cancelled' | 'error';

export type NFTPurchaseState = {
  status?: NFTPurchaseStatus;
  errorMessage?: string;
  errorCode?: string;
  referenceId?: string;
  nft?: {
    name: string;
    imageUrl: string;
    blockchainNftId: string;
    contractAddress: string;
    network: string;
    platform: string;
    type: string;
  };
  identityPrefill?: {
    firstName: string;
    lastName: string;
    dateOfBirth: string; // YYYY-MM-DD
    emailAddress: string;
    phone: string;
    address: {
      street1: string;
      street2: string;
      city: string;
      regionCode: string;
      postalCode: string;
      countryCode: string;
    };
  };
};

type NFTPurchaseActions = ActionType<typeof NFTPurchaseActions>;

export const initialNFTPurchaseState: NFTPurchaseState = {
  status: 'loading',
  errorMessage: undefined,
  errorCode: undefined,
  referenceId: undefined,
};

export const NFTPurchaseReducer = createReducer<NFTPurchaseState, NFTPurchaseActions>(initialNFTPurchaseState)
  .handleAction(NFTPurchaseActions.setNFTPurchaseState, (state, action) => ({
    ...state,
    ...action.payload,
  }))
  .handleAction(NFTPurchaseActions.clearNFTPurchaseState, () => ({
    ...initialNFTPurchaseState,
  }));
