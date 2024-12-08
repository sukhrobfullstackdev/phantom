import { NFTTransferRequest } from 'magic-sdk';
import { RpcMiddleware } from '~/app/rpc/types';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { z } from 'zod';

type NFTTransferResponse = {
  status: 'declined' | 'expired' | 'processed';
};

type NFTTransferRequestMiddleware = RpcMiddleware<[NFTTransferRequest], NFTTransferResponse>;

export const nftTransferRequestSchema = z.object({
  contractAddress: z.string(),
  tokenId: z.string(),
  quantity: z.number().optional(),
  recipient: z.string().optional(),
});

export const checkNFTTransferRequest: NFTTransferRequestMiddleware = (ctx, next) => {
  const { payload } = ctx;

  const nftTransferRequest = payload?.params?.[0];
  if (!nftTransferRequest) {
    throw sdkErrorFactories.client.malformedPayload;
  }

  const validation = nftTransferRequestSchema.safeParse(nftTransferRequest);
  if (!validation.success) {
    throw sdkErrorFactories.client.malformedPayload;
  }

  next();
};
