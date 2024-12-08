import React, { PropsWithChildren, useEffect, useState } from 'react';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { NFTError, NFT_ERROR_TYPES } from '~/features/native-methods/hooks/use-nft-error';
import { useNFTCheckoutState } from '../hooks/use-nft-checkout-state';
import { nftCheckoutRequestSchema } from '../middlewares';
import { PaypalSuspense } from './paypal-suspense';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { isEmpty } from '~/app/libs/lodash-utils';

export const NFTCheckoutInitializer = ({ children }: PropsWithChildren) => {
  const [isReady, setIsReady] = useState(false);

  const payload = useUIThreadPayload();
  const { address } = useUserMetadata();
  const { reset } = useNFTCheckoutState();

  useEffect(() => {
    // set the state for the NFT checkout from the payload
    const params = payload?.params[payload?.params.length - 1];

    if (!params) {
      throw new NFTError(NFT_ERROR_TYPES.INVALID_PARAMS);
    }

    const validation = nftCheckoutRequestSchema.safeParse(params);
    if (!validation.success) {
      throw new NFTError(NFT_ERROR_TYPES.INVALID_PARAMS);
    }

    const { quantity = 1, walletAddress, isCryptoCheckoutEnabled = false, ...rest } = validation.data;

    reset({
      ...rest,
      quantity,
      walletAddress: walletAddress && !isEmpty(walletAddress) ? walletAddress : address,
      isCryptoCheckoutEnabled,
    });

    setIsReady(true);
  }, []);

  return isReady ? <PaypalSuspense>{children}</PaypalSuspense> : <></>;
};
