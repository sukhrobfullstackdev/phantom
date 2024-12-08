import { useSharedState } from '~/features/native-methods/hooks/use-shared-data';

type NFTPaypalCheckoutState = {
  orderId: string;
  requestId: string;
  lastDigits: string;
  cardType: string;
};

export const useNFTPaypalCheckoutState = () => {
  const [nftPaypalCheckoutState, setNFTPaypalCheckoutState] = useSharedState<NFTPaypalCheckoutState>(
    ['nft-paypal-checkout-state'],
    {
      orderId: '',
      requestId: '',
      lastDigits: '',
      cardType: '',
    },
  );

  const updateNFTPaypalCheckoutState = (state: Partial<NFTPaypalCheckoutState>) => {
    setNFTPaypalCheckoutState({ ...nftPaypalCheckoutState, ...state });
  };

  return { nftPaypalCheckoutState, setNFTPaypalCheckoutState, updateNFTPaypalCheckoutState };
};
