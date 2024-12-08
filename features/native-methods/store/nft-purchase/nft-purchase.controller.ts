import { JsonRpcRequestPayload } from 'fortmatic';
import { store } from '~/app/store';
import { nftPurchaseStore } from './nft-purchase.store';
import { resolvePayload } from '~/app/rpc/utils';

export const resolveNFTPurchaseRequest = async (payload?: JsonRpcRequestPayload) => {
  const threadPayload = payload || (store.getState().UIThread.payload as JsonRpcRequestPayload);
  const nftPurchaseStatus = nftPurchaseStore.getState().status;
  const nftPurchaseErrorMsg = nftPurchaseStore.getState().errorMessage;
  const nftPurchaseErrorCode = nftPurchaseStore.getState().errorCode;
  const nftPurchaseReferenceId = nftPurchaseStore.getState().referenceId;
  await resolvePayload(threadPayload, {
    status: nftPurchaseStatus,
    errorMessage: nftPurchaseErrorMsg,
    errorCode: nftPurchaseErrorCode,
    referenceId: nftPurchaseReferenceId,
  });
};
