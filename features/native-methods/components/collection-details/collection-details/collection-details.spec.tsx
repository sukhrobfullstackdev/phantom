import React from 'react';
import { render, screen } from '@testing-library/react';
import type { OwnedNft } from 'alchemy-sdk';
import { NftTokenType, OpenSeaSafelistRequestStatus } from 'alchemy-sdk';
import CollectionDetails from '~/features/native-methods/components/collection-details/collection-details/collection-details';

const fullData: OwnedNft = {
  balance: '0',
  tokenId: '1',
  tokenType: NftTokenType.ERC1155,
  image: {},
  /** The raw metadata for the NFT based on the metadata URI on the NFT contract. */
  raw: {
    metadata: {
      name: 'Test Collection name',
    },
  },
  contract: {
    address: '',
    tokenType: NftTokenType.ERC1155,
    spamClassifications: [],
    openSeaMetadata: {
      imageUrl: 'https://example.com/image.png',
      externalUrl: 'https://example.com',
      discordUrl: 'https://discord.gg/example',
      twitterUsername: 'twitterExampleUsername',
      safelistRequestStatus: OpenSeaSafelistRequestStatus.VERIFIED,
      collectionName: 'Test Collection collectionName',
      description: 'Test Collection description',
      lastIngestedAt: new Date().toISOString(),
    },
  },
  timeLastUpdated: new Date().toISOString(),
};

describe('CollectionDetails component', () => {
  test('renders full collection details with social links and verified status', () => {
    render(<CollectionDetails nftData={fullData} nfts={[]} isLoading={false} />);
    expect(screen.getByAltText('Test Collection collectionName')).toBeInTheDocument(); // imageUrl + collectionName
    expect(screen.getByText('Test Collection description')).toBeInTheDocument(); // description

    expect(screen.getByTitle('Discord')).toBeInTheDocument(); // discordUrl
    expect(screen.getByTitle('External URL')).toBeInTheDocument(); // twitterUsername

    expect(screen.getByTitle('Discord').closest('a')?.href).toBe('https://discord.gg/example'); // discordUrl
    expect(screen.getByTitle('External URL').closest('a')?.href).toBe('https://example.com/'); // twitterUsername
  });
});
