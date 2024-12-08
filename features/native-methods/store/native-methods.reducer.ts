import { combineReducers } from 'redux';
import { NFTPurchaseReducer } from './nft-purchase/nft-purchase.reducer';
import { createPersistReducer } from '~/app/store/persistence';

export const nativeMethodsReducer = combineReducers({
  nftPurchase: createPersistReducer('NFTPurchase', NFTPurchaseReducer),
});
