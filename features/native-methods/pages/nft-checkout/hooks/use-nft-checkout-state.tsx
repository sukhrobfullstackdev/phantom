import { NFTCheckoutRequest } from 'magic-sdk';
import { useCallback } from 'react';
import { useSharedState } from '~/features/native-methods/hooks/use-shared-data';

export type NFTCheckoutState = NFTCheckoutRequest & {
  quantity: number;
  walletAddress: string;
  isCryptoCheckoutEnabled: boolean;
};

const defaultNFTCheckoutState: NFTCheckoutState = {
  contractId: '',
  tokenId: '',
  name: '',
  imageUrl: '',
  quantity: 1,
  walletAddress: '',
  isCryptoCheckoutEnabled: false,
};

export const useNFTCheckoutState = () => {
  const [nftCheckoutState, setNFTCheckoutState] = useSharedState<NFTCheckoutState>(['nft-checkout-state'], {
    ...defaultNFTCheckoutState,
  });

  const reset = useCallback((state?: Partial<NFTCheckoutState>) => {
    setNFTCheckoutState({
      ...defaultNFTCheckoutState,
      ...state,
    });
  }, []);

  return { nftCheckoutState, setNFTCheckoutState, reset };
};
