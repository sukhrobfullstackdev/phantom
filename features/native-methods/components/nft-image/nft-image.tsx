import React, { ComponentProps, useCallback, useEffect, useState } from 'react';

import NftNoImage from '~/shared/svg/nft/nft-no-image.svg';
import NftNoImageDark from '~/shared/svg/nft/nft-no-image-dark.svg';
import NftLoadingImage from '~/shared/svg/nft/nft-loading-image.svg';
import NftLoadingImageDark from '~/shared/svg/nft/nft-loading-image-dark.svg';
import { useThemeMode } from '../../hooks/useThemeMode';
import { Typography } from '@magiclabs/ui';
import { isEmpty } from '~/app/libs/lodash-utils';

export type NFTImageProps = ComponentProps<'img'> & {
  size?: number | string;
  quantity?: number;
};

export const NFTImage = ({ src, alt, size = 96, quantity, style, ...rest }: NFTImageProps) => {
  const { mode } = useThemeMode();

  const handleOnError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = mode(NftNoImage, NftNoImageDark);
  }, []);

  const [imageUrl, setImageUrl] = useState(mode(NftLoadingImage, NftLoadingImageDark));

  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setImageUrl(image.src);
    };
    image.onerror = () => {
      setImageUrl(mode(NftNoImage, NftNoImageDark));
    };

    if (!src || isEmpty(src)) {
      image.src = mode(NftNoImage, NftNoImageDark);
    } else {
      image.src = src.startsWith('ipfs') ? src.replace('ipfs://', 'https://ipfs.io/ipfs/') : src;
    }
  }, [src]);

  return (
    <div style={{ position: 'relative' }}>
      <img
        style={{
          width: typeof size === 'string' ? size : `${size}px`,
          borderRadius: '12px',
          objectFit: 'cover',
          aspectRatio: '1 / 1',
          ...style,
        }}
        src={imageUrl}
        alt={alt}
        onError={handleOnError}
        {...rest}
      />
      {quantity && quantity > 1 && (
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(25, 25, 26, 0.50)',
            borderRadius: '8px',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Typography.BodySmall
            color="white"
            weight="600"
            style={{
              lineHeight: '12px',
            }}
          >
            {quantity}
          </Typography.BodySmall>
        </div>
      )}
    </div>
  );
};
