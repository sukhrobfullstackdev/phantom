import { OwnedNft, Nft } from 'alchemy-sdk';

export const getNftAltTag = (nft: Nft | OwnedNft): string => `${nft?.name || nft?.raw.metadata?.name} #${nft.tokenId}`;
