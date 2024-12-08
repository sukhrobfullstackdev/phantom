import { ThunkActionWrapper } from '~/app/store/types';
import { nativeMethodsReducer } from './native-methods.reducer';
import { clearNFTPurchaseState } from './nft-purchase/nft-purchase.actions';

export const clearNativeMethodsStore = (): ThunkActionWrapper<void, typeof nativeMethodsReducer> => {
  return dispatch => {
    dispatch(clearNFTPurchaseState());
  };
};
