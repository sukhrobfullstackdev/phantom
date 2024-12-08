import { NFTCheckoutRequest } from 'magic-sdk';
import { RpcMiddleware } from '~/app/rpc/types';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { z } from 'zod';

type NFTCheckoutResponse = {
  status: 'declined' | 'expired' | 'processed' | 'pending';
};

type NFTCheckoutRequestMiddleware = RpcMiddleware<[NFTCheckoutRequest], NFTCheckoutResponse>;

export const nftCheckoutRequestSchema = z.object({
  contractId: z.string(),
  tokenId: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  quantity: z.number().min(1).optional(),
  walletAddress: z.string().optional(),
  isCryptoCheckoutEnabled: z.boolean().optional(),
});

export const checkNFTCheckoutRequest: NFTCheckoutRequestMiddleware = (ctx, next) => {
  const { payload } = ctx;

  const nftCheckoutRequest = payload?.params?.[0];
  if (!nftCheckoutRequest) {
    throw sdkErrorFactories.client.malformedPayload;
  }

  const validation = nftCheckoutRequestSchema.safeParse(nftCheckoutRequest);
  if (!validation.success) {
    throw sdkErrorFactories.client.malformedPayload;
  }

  next();
};
