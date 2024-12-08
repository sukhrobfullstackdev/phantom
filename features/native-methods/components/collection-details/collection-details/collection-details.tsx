import React from 'react';
import { Typography, Flex, Icon, Spacer } from '@magiclabs/ui';
import type { Nft, OwnedNft } from 'alchemy-sdk';
import styles from '~/features/native-methods/pages/collectible-details-page/collectible-details-page.less';
import { CollectibleSocialLink } from '~/features/connect-with-ui/components/collectible-social-link';
import { ExternalUrlIcon, VerifiedBadge, DiscordExternalIcon, TwitterExternalIcon } from '~/shared/svg/magic-connect';
import { TruncatedText } from '~/features/connect-with-ui/components/truncated-text';
import Carousel from '~/features/native-methods/components/collection-details/carousel/carousel';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner/loading-spinner';
import { LoadingContainer } from '~/features/native-methods/components/collection-details/collection-details/collection-detials-styles';

const CollectibleDetails = ({ nftData, nfts, isLoading }: { nftData: OwnedNft; nfts: Nft[]; isLoading: boolean }) => {
  const {
    imageUrl,
    externalUrl,
    discordUrl,
    twitterUsername,
    safelistRequestStatus,
    collectionName,
    description: collectionDescription,
  } = nftData.contract?.openSeaMetadata || {};

  const showCollectibleDetails =
    imageUrl ||
    externalUrl ||
    discordUrl ||
    twitterUsername ||
    safelistRequestStatus ||
    collectionDescription ||
    collectionName;

  const showSocialLinks = externalUrl || discordUrl || twitterUsername;

  return showCollectibleDetails ? (
    <>
      <Spacer size={40} orientation="vertical" />
      <hr className={`${styles.divider} ${styles.thick}`} />
      <Spacer size={32} orientation="vertical" />
      {imageUrl && (
        <>
          <img
            className={`${styles.collectionImg} ${styles.large}`}
            src={imageUrl}
            alt={collectionName || 'NFT Collection'}
          />
          <Spacer size={8} orientation="vertical" />
        </>
      )}
      <Flex.Row alignItems="center">
        <Typography.H5 weight="700">{collectionName}</Typography.H5>
        {safelistRequestStatus === 'verified' && collectionName && (
          <>
            <Spacer size={4} />
            <Icon type={VerifiedBadge} size={24} />
          </>
        )}
      </Flex.Row>
      {collectionDescription && (
        <>
          <Spacer size={8} orientation="vertical" />
          <TruncatedText>{collectionDescription}</TruncatedText>
        </>
      )}
      {showSocialLinks && (
        <>
          <Spacer size={16} orientation="vertical" />
          <Flex.Row className={styles.externalLinks}>
            {externalUrl && <CollectibleSocialLink link={externalUrl} icon={ExternalUrlIcon} />}
            {discordUrl && <CollectibleSocialLink link={discordUrl} icon={DiscordExternalIcon} />}
            {twitterUsername && (
              <CollectibleSocialLink link={`https://twitter.com/${twitterUsername}`} icon={TwitterExternalIcon} />
            )}
          </Flex.Row>
        </>
      )}
      {isLoading ? (
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      ) : (
        <>
          <Spacer size={16} orientation="vertical" />
          <Carousel nfts={nfts} />
        </>
      )}
    </>
  ) : null;
};
export default CollectibleDetails;
