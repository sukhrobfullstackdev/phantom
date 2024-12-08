import { createStore } from '~/app/store';
import { NFTPurchaseReducer } from './nft-purchase.reducer';

export const nftPurchaseStore = createStore(NFTPurchaseReducer, 'nft purchase');
