import React, { PropsWithChildren, useEffect, useState } from 'react';
import { useUIThreadPayload, useUIThreadResponse } from '~/app/ui/hooks/ui-thread-hooks';
import { useNFTTransferState } from '../hooks/use-nft-trasnfer-state';
import { NFTError, NFT_ERROR_TYPES } from '~/features/native-methods/hooks/use-nft-error';
import { nftTransferRequestSchema } from '../middlewares';

export const NFTTransferInitializer = ({ children }: PropsWithChildren) => {
  const [isReady, setIsReady] = useState(false);

  const payload = useUIThreadPayload();
  const response = useUIThreadResponse();
  const { reset } = useNFTTransferState();

  useEffect(() => {
    // set the state for the NFT transfer from the payload
    const params = payload?.params[payload?.params.length - 1];

    if (!params) {
      throw new NFTError(NFT_ERROR_TYPES.INVALID_PARAMS);
    }

    const validation = nftTransferRequestSchema.safeParse(params);
    if (!validation.success) {
      throw new NFTError(NFT_ERROR_TYPES.INVALID_PARAMS);
    }

    const { contractAddress, tokenId, quantity = 1, recipient = '' } = validation.data;

    reset({
      contractAddress,
      tokenId,
      quantity: response ? 1 : quantity,
      toAddress: response ? '' : recipient,
    });

    setIsReady(true);
  }, []);

  return isReady ? <>{children}</> : <></>;
};
