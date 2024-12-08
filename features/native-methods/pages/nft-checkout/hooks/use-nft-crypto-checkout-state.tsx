import { useSharedState } from '~/features/native-methods/hooks/use-shared-data';

type NFTCryptoCheckoutState = {
  txHash: string;
};

export const useNFTCryptoCheckoutState = () => {
  const [nftCryptoCheckoutState, setNFTCryptoCheckoutState] = useSharedState<NFTCryptoCheckoutState>(
    ['nft-crypto-checkout-state'],
    {
      txHash: '',
    },
  );

  return { nftCryptoCheckoutState, setNFTCryptoCheckoutState };
};
