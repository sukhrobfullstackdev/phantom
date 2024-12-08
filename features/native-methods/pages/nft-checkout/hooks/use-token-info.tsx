import { FetchTokenInfoResponse } from '~/app/services/nft/fetchTokenInfo';
import { useNFTCheckoutState } from './use-nft-checkout-state';
import { useQuery } from '@tanstack/react-query';
import { NFTService } from '~/app/services/nft/nft-service';
import { NFTError, NFT_ERROR_TYPES } from '~/features/native-methods/hooks/use-nft-error';
import { GetTokenPrice } from '~/app/services/token-price/token-price';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';

type TokenInfo = FetchTokenInfoResponse & {
  priceInUSD: number;
};

export const useTokenInfo = () => {
  const { chainInfo } = useChainInfo();
  const { nftCheckoutState } = useNFTCheckoutState();

  const { data: tokenInfo } = useQuery<TokenInfo>({
    queryKey: ['token-info', nftCheckoutState.contractId, nftCheckoutState.tokenId],
    queryFn: async () => {
      const tokenInfoResponse = await NFTService.fetchTokenInfo({
        contractId: nftCheckoutState.contractId,
        tokenId: nftCheckoutState.tokenId,
      });

      if (tokenInfoResponse.error || !tokenInfoResponse.data) {
        throw new NFTError(NFT_ERROR_TYPES.SOMETHING_WENT_WRONG);
      }

      if (tokenInfoResponse.data.chainId !== chainInfo.chainId) {
        throw new Error('Please check your network. Your checkout ID is not available on the selected network');
      }

      if (tokenInfoResponse.data.mintedQuantity >= tokenInfoResponse.data.maxQuantity) {
        throw new NFTError(NFT_ERROR_TYPES.SOLD_OUT);
      }

      if (tokenInfoResponse.data.denomination === 'USD') {
        const tokenPrice = await GetTokenPrice(chainInfo.currency);

        return {
          ...tokenInfoResponse.data,
          price: (Number(tokenPrice.data.to_currency_amount_display) * Number(tokenInfoResponse.data.price)).toString(),
          priceInUSD: Number(tokenInfoResponse.data.price),
        };
      }

      return {
        ...tokenInfoResponse.data,
        priceInUSD: Number(tokenInfoResponse.data.price) * tokenInfoResponse.data.usdRate,
      };
    },
    suspense: true,
    staleTime: 360000,
  });

  return { tokenInfo: tokenInfo! };
};
