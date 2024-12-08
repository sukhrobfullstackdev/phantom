import React, { useState, useCallback, useEffect } from 'react';
import { Typography } from '@magiclabs/ui';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { ButtonSize } from '~/features/connect-with-ui/components/button';
import { ArrowLeft, ArrowRight } from '~/shared/svg/magic-connect';
import NftNoImage from '~/shared/svg/nft/nft-no-image.svg';
import NftNoImageDark from '~/shared/svg/nft/nft-no-image-dark.svg';
import {
  IMAGE_MARGIN,
  IMAGE_WIDTH,
  CarouselContainer,
  NftCarousel,
  CarouselImages,
  CarouselImage,
  Arrow,
  CarouselHeader,
  ArrowContainer,
} from '~/features/native-methods/components/collection-details/carousel/carousel-styles';
import { useViewOnOpenSea } from '~/features/blockchain-ui-methods/hooks/use-view-on-opensea';
import { Nft } from 'alchemy-sdk';

const getNftSrc = (src: string | undefined, theme) => {
  if (src) return src;
  return theme.isDarkTheme ? NftNoImageDark : NftNoImage;
};

const Carousel = ({ nfts }: { nfts: Nft[] }) => {
  if (nfts.length === 0) return null;

  const { theme } = useTheme();

  const MAX_IMAGE_WIDTH = IMAGE_WIDTH + IMAGE_MARGIN;

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [disableLeftArrow, setDisableLeftArrow] = useState(false);
  const [disableRightArrow, setDisableRightArrow] = useState(true);

  const { viewOnOpenSea } = useViewOnOpenSea();

  useEffect(() => {
    // we want to show at least 3 NFTs at the end of the list
    const maxIndex = nfts.length - 3;

    setDisableLeftArrow(activeIndex === 0);
    setDisableRightArrow(activeIndex >= maxIndex);
  }, [activeIndex]);

  const handleScroll = useCallback(
    (direction: 'left' | 'right') => {
      setActiveIndex(direction === 'left' ? activeIndex - 1 : activeIndex + 1);
    },
    [activeIndex],
  );

  const scrollPosition = activeIndex * MAX_IMAGE_WIDTH;

  return (
    <CarouselContainer>
      <CarouselHeader>
        <Typography.H5 weight="600" style={{ fontSize: '14px' }}>
          More from this collection
        </Typography.H5>
        <ArrowContainer>
          <Arrow
            disabled={disableLeftArrow}
            onClick={() => handleScroll('left')}
            iconType={ArrowLeft}
            size={ButtonSize.small}
            data-testid="left-arrow"
          />
          <Arrow
            disabled={disableRightArrow}
            onClick={() => handleScroll('right')}
            iconType={ArrowRight}
            size={ButtonSize.small}
            data-testid="right-arrow"
          />
        </ArrowContainer>
      </CarouselHeader>
      <NftCarousel>
        <CarouselImages style={{ transform: `translateX(${scrollPosition * -1}px)` }}>
          {nfts.map(nft => {
            return (
              <CarouselImage
                role="button"
                key={`${nft.name} ${nft.tokenId}`}
                src={getNftSrc(nft.image.cachedUrl ?? nft.image.originalUrl, theme)}
                alt={`${nft.name} ${nft.tokenId}`}
                onClick={() =>
                  viewOnOpenSea({
                    contractAddress: nft.contract.address,
                    tokenId: nft.tokenId,
                  })
                }
                onError={({ currentTarget }) => {
                  currentTarget.src = theme.isDarkTheme ? NftNoImageDark : NftNoImage;
                }}
              />
            );
          })}
        </CarouselImages>
      </NftCarousel>
    </CarouselContainer>
  );
};

export default Carousel;
