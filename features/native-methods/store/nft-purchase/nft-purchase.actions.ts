import { createAction } from 'typesafe-actions';
import * as actionTypes from './nft-purchase.action-types';
import { NFTPurchaseState } from './nft-purchase.reducer';

export const setNFTPurchaseState = createAction(actionTypes.SET_NFT_PURCHASE_STATE, (data: NFTPurchaseState) => data)();

export const clearNFTPurchaseState = createAction(actionTypes.CLEAR_NFT_PURCHASE_STATE)();
