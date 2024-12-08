import React, { Suspense, useState } from 'react';
import { Flex, Icon, Linkable, Spacer, Typography } from '@magiclabs/ui';
import Tilt from 'react-parallax-tilt';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';
import CollectionDetails from '~/features/native-methods/components/collection-details/collection-details/collection-details';
import NftNoImage from '~/shared/svg/nft/nft-no-image.svg';
import NftNoImageDark from '~/shared/svg/nft/nft-no-image-dark.svg';
import styles from './collectible-details-page.less';
import { CollectibleAttributesDrawer } from '~/features/connect-with-ui/components/collectible-attributes-drawer';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { Network } from '~/features/connect-with-ui/components/network';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { VerifiedBadge } from '~/shared/svg/magic-connect';
import { TruncatedText } from '~/features/connect-with-ui/components/truncated-text';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { getNftImage } from '~/features/connect-with-ui/utils/get-nft-image';
import { getNftAltTag } from '~/features/connect-with-ui/utils/get-nft-alt-tag';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner/loading-spinner';
import { useOwnedNFT } from '~/features/native-methods/hooks/useOwnedNFT';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { MAGIC_SHOW_NFTS } from '~/app/constants/route-methods';
import { AnalyticsActionType, trackAction } from '~/app/libs/analytics';
import { BottomModal } from '../../components/BottomModal';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { isInAppBrowser } from '../../utils/ua-parser';
import { Button } from '~/features/native-methods/ui/button/button';
import { ExternalLinkIcon } from '../../ui/icons/ExternalLinkIcon';
import { useIsEVM } from '~/features/native-methods/hooks/useIsEVM';
import { useThemeMode } from '../../hooks/useThemeMode';
import { getLogger } from '~/app/libs/datadog';
import { useViewOnOpenSea } from '~/features/blockchain-ui-methods/hooks/use-view-on-opensea';
import { useCollectiableDetailsState } from '../../hooks/use-collectiable-details-state';
import { useAlchemy } from '~/features/blockchain-ui-methods/hooks/use-alchemy';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';
import { MAGIC_METHODS, useMagicMethodRouter } from '../../hooks/use-magic-method-router';
import { ErrorBoundary } from '~/app/libs/exceptions/error-boundary';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 680px;
`;

interface NftImageContainerProps {
  src: string;
}

const NftImageContainer = styled.div<NftImageContainerProps>`
  width: 100%;
  height: 100%;
  display: inline-block;
  position: relative;
  &::before {
    content: '';
    background: url(${props => props.src});
    display: block;
    position: absolute;
    top: 6px;
    left: 6px;
    width: 100%;
    height: 100%;
    border-radius: 16px;
    filter: blur(6px);
    opacity: 0.6;
  }
`;

const StyledTilt = styled(Tilt)`
  padding: 8px;
`;

const NftImageWithBlur = ({ alt, src, onError }: { alt: string; src: string; onError: any }) => {
  return (
    <StyledTilt>
      <NftImageContainer src={src}>
        <img alt={alt} src={src} className={styles.collectibleImage} onError={onError} />
      </NftImageContainer>
    </StyledTilt>
  );
};

type Props = {
  isNftTransferEnabled: boolean;
};

const Resolved = ({ isNftTransferEnabled }: Props) => {
  const { navigateTo } = useControllerContext();
  const { theme } = useTheme();
  const { mode } = useThemeMode();
  const { alchemy } = useAlchemy();
  const {
    chainInfo: { blockchainIcon, networkName, isMainnet },
  } = useChainInfo();
  const {
    collectiableDetailsState: { contractAddress, tokenId },
  } = useCollectiableDetailsState();
  const mmRouter = useMagicMethodRouter();
  const payload = useUIThreadPayload();
  const [isOpen, setIsOpen] = useState(false);
  const { isEVM } = useIsEVM();
  const { viewOnOpenSea, showViewButton, isCustomizedEnabled } = useViewOnOpenSea();

  const goToWalletHome = () => {
    if (payload?.method === MAGIC_SHOW_NFTS) {
      navigateTo('collectibles-list', eventData);
    } else {
      navigateTo('wallet-home', eventData);
    }
  };

  const { ownedNFT } = useOwnedNFT({
    contractAddress,
    tokenId,
  });

  const { data: nftCollectionData, isLoading: isNFTCollectionLoading } = useQuery({
    queryKey: ['nft-collection', contractAddress],
    queryFn: () => alchemy.nft.getNftsForContract(contractAddress),
  });

  const handleSend = () => {
    trackAction(AnalyticsActionType.NFTSendClicked, {
      contractAddress,
      tokenId,
    });

    if (isInAppBrowser()) {
      setIsOpen(true);
      return;
    }

    if (!ownedNFT) {
      getLogger().warn(`Warning with CollectibleDetailsPage: Could not find ownedNFT`);
      return;
    }

    mmRouter.push({
      method: MAGIC_METHODS.MAGIC_NFT_TRANSFER,
      params: {
        contractAddress: ownedNFT.contract.address,
        tokenId: ownedNFT.tokenId,
      },
    });
  };

  const nftDescription = ownedNFT.contract.openSeaMetadata?.description || ownedNFT?.description;
  const nftTitle =
    ownedNFT.name ||
    ownedNFT.contract.name ||
    `#${ownedNFT.tokenId}` ||
    ownedNFT.contract.openSeaMetadata?.collectionName;

  return (
    <>
      <Spacer size={8} orientation="vertical" />
      <BottomModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Flex.Column alignItems="center" style={{ gap: '12px' }}>
          <ThemeLogo height={48} />
          <Typography.H4 weight="700" color="var(--ink100)">
            UnsupportedBrowser
          </Typography.H4>
          <Typography.BodyMedium color="var(--ink100)" weight="400" style={{ textAlign: 'center' }}>
            Please open this page in a different web browser to continue.
          </Typography.BodyMedium>
        </Flex.Column>
      </BottomModal>
      <div className={styles.collectibleDetailsPage}>
        <ModalHeader
          leftAction={<BackActionButton onClick={goToWalletHome} />}
          rightAction={<CancelActionButton />}
          header={<Network />}
        />
        <NftImageWithBlur
          alt={getNftAltTag(ownedNFT)}
          src={getNftImage(ownedNFT.image.cachedUrl ?? ownedNFT.image.originalUrl)}
          onError={({ currentTarget }) => {
            if (theme.isDarkTheme) {
              currentTarget.src = NftNoImageDark;
              return;
            }
            currentTarget.src = NftNoImage;
          }}
        />
        <Spacer size={40} orientation="vertical" />
        <div className={styles.collectionName}>
          {ownedNFT.contract.openSeaMetadata?.imageUrl && (
            <img
              className={styles.collectionImg}
              src={ownedNFT.contract.openSeaMetadata.imageUrl}
              alt="NFT Collection"
            />
          )}
          {ownedNFT.contract.openSeaMetadata?.externalUrl ? (
            <Linkable>
              <a href={ownedNFT.contract.openSeaMetadata?.externalUrl} target="_blank" rel="noreferrer">
                <Typography.BodySmall>{ownedNFT.contract.openSeaMetadata?.collectionName}</Typography.BodySmall>
              </a>
            </Linkable>
          ) : (
            <Typography.BodySmall>{ownedNFT.contract.name}</Typography.BodySmall>
          )}
          {ownedNFT.contract.openSeaMetadata?.safelistRequestStatus === 'verified' && (
            <Icon type={VerifiedBadge} size={16} />
          )}
        </div>
        <Spacer size={8} orientation="vertical" />
        <Typography.H3>{nftTitle}</Typography.H3>
        {nftDescription && (
          <>
            <Spacer size={12} orientation="vertical" />
            <TruncatedText>{nftDescription}</TruncatedText>
          </>
        )}
        <Spacer size={24} orientation="vertical" />
        <Flex.Row alignItems="center" style={{ width: '100%', gap: '16px' }}>
          {showViewButton ? (
            <Button
              role="link"
              onClick={() =>
                viewOnOpenSea({
                  contractAddress: ownedNFT.contract.address,
                  tokenId: ownedNFT.tokenId,
                })
              }
              variant="neutral"
            >
              <Typography.BodyMedium>{isCustomizedEnabled ? theme.appName : 'OpenSea'}</Typography.BodyMedium>
              <ExternalLinkIcon size={16} opacity={0.5} />
            </Button>
          ) : null}
          {isNftTransferEnabled && isEVM && (
            <Button onClick={handleSend}>
              <Typography.BodyMedium>Send</Typography.BodyMedium>
            </Button>
          )}
        </Flex.Row>
        <Spacer size={40} orientation="vertical" />
        {Number(ownedNFT.balance) > 1 && (
          <>
            <Flex.Row alignItems="center" justifyContent="space-between" style={{ padding: '12px 0' }}>
              <Typography.BodySmall weight="600" color={mode('var(--ink100)', 'var(--white)')}>
                Quantity
              </Typography.BodySmall>
              <Typography.BodySmall weight="400" color={mode('var(--ink100)', 'var(--white)')}>
                {ownedNFT.balance}
              </Typography.BodySmall>
            </Flex.Row>
            <hr className={styles.divider} />
          </>
        )}

        <Flex.Row alignItems="center" justifyContent="space-between" style={{ padding: '12px 0' }}>
          <Typography.BodySmall>Blockchain</Typography.BodySmall>
          <Flex.Row alignItems="center">
            <Icon aria-hidden type={blockchainIcon} size={16} />
            <Spacer size={4} orientation="horizontal" />
            <Typography.BodySmall className={`${styles.networkName} ${isMainnet ? '' : styles.testnet}`}>
              {networkName}
            </Typography.BodySmall>
          </Flex.Row>
        </Flex.Row>

        {ownedNFT.raw.metadata?.attributes && ownedNFT.raw.metadata?.attributes?.length > 0 && (
          <>
            <hr className={styles.divider} />
            <Spacer size={12} orientation="vertical" />
            <CollectibleAttributesDrawer attributes={ownedNFT.raw.metadata.attributes} />
          </>
        )}
        <CollectionDetails
          nftData={ownedNFT}
          nfts={nftCollectionData?.nfts.slice(0, 10) ?? []}
          isLoading={isNFTCollectionLoading}
        />
      </div>
    </>
  );
};

export const CollectibleDetailsPage = (props: Props) => {
  const { navigateBackToPrevPage } = useControllerContext();

  return (
    <>
      <ModalHeader
        leftAction={<BackActionButton onClick={navigateBackToPrevPage} />}
        rightAction={<CancelActionButton />}
        header={<Network />}
      />
      <ErrorBoundary
        fallback={error => (
          <LoadingContainer>
            <Typography.H5>An error has occurred: {error.message}</Typography.H5>
          </LoadingContainer>
        )}
      >
        <Suspense
          fallback={
            <LoadingContainer>
              <LoadingSpinner />
            </LoadingContainer>
          }
        >
          <Resolved {...props} />
        </Suspense>
      </ErrorBoundary>
    </>
  );
};
