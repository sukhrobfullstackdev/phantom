import { NFTPurchaseState } from '~/features/native-methods/store/nft-purchase/nft-purchase.reducer';
import { nftPurchaseStore } from '~/features/native-methods/store/nft-purchase/nft-purchase.store';
import {
  setNFTPurchaseState as action,
  clearNFTPurchaseState,
} from '~/features/native-methods/store/nft-purchase/nft-purchase.actions';

export const useNFTPurchaseState = () => {
  const nftPurchaseState = nftPurchaseStore.hooks.useSelector(state => state);
  const setNFTPurchaseState = (state: NFTPurchaseState) => nftPurchaseStore.dispatch(action(state));

  const reset = () => nftPurchaseStore.dispatch(clearNFTPurchaseState);

  return { ...nftPurchaseState, setNFTPurchaseState, reset };
};
