import { NFTPurchaseResponse } from 'magic-sdk';
import { RpcMiddleware } from '~/app/rpc/types';
import { nftPurchaseStore } from './nft-purchase.store';
import { setNFTPurchaseState } from './nft-purchase.actions';
import { NFTPurchaseState, initialNFTPurchaseState } from './nft-purchase.reducer';

type NFTPurchaseRequestParams = [Pick<NFTPurchaseState, 'nft' | 'identityPrefill'>];

type NFTPurchaseRequestParamsMiddleware = RpcMiddleware<NFTPurchaseRequestParams, NFTPurchaseResponse>;

export const marshallNFTPurchaseState: NFTPurchaseRequestParamsMiddleware = async (ctx, next) => {
  await nftPurchaseStore.ready;

  const { payload } = ctx;

  const nftPurchaseRequest = (payload?.params as NFTPurchaseRequestParams)[0];

  nftPurchaseStore.dispatch(
    setNFTPurchaseState({
      ...nftPurchaseRequest,
      ...initialNFTPurchaseState,
    }),
  );

  next();
};
