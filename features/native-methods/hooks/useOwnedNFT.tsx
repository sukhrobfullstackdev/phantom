import { useQuery } from '@tanstack/react-query';
import { NftOrdering } from 'alchemy-sdk';

import { useUserMetadata } from './useUserMetadata';
import { useAlchemy } from '~/features/blockchain-ui-methods/hooks/use-alchemy';
import { NFTError, NFT_ERROR_TYPES } from './use-nft-error';

type Props = {
  contractAddress: string;
  tokenId: string;
};

export const useOwnedNFT = ({ contractAddress, tokenId }: Props) => {
  const { alchemy } = useAlchemy();
  const { address } = useUserMetadata();

  const { data: ownedNFT, ...rest } = useQuery({
    queryKey: ['owned-nfts', address, contractAddress.toLowerCase(), tokenId],
    queryFn: async () => {
      const response = await alchemy.nft.getNftsForOwner(address, {
        orderBy: NftOrdering.TRANSFERTIME,
      });

      const nft = response.ownedNfts.find(
        owned => owned.contract.address.toLowerCase() === contractAddress.toLowerCase() && owned.tokenId === tokenId,
      );

      if (!nft) {
        throw new NFTError(NFT_ERROR_TYPES.INVALID_PARAMS);
      }

      return nft;
    },
    suspense: true,
    retry: 3,
    retryDelay: 2000,
  });

  return { ownedNFT: ownedNFT!, ...rest };
};
