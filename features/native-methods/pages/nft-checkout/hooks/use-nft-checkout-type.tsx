import { useSharedState } from '~/features/native-methods/hooks/use-shared-data';

export const NFT_CHECKOUT_TYPES = {
  PAYPAL: 'paypal',
  CREDIT_OR_DEBIT: 'credit-or-debit',
  CRYPTO: 'crypto',
} as const;

type NFTCheckoutType = (typeof NFT_CHECKOUT_TYPES)[keyof typeof NFT_CHECKOUT_TYPES];

export const useNFTCheckoutType = () => {
  const [nftCheckoutType, setNFTCheckoutType] = useSharedState<NFTCheckoutType>(
    ['nft-checkout-type'],
    NFT_CHECKOUT_TYPES.PAYPAL,
  );
  return { nftCheckoutType, setNFTCheckoutType };
};
