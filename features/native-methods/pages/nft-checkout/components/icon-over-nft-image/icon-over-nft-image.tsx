import React, { ReactElement } from 'react';
import { NFTImage, NFTImageProps } from '~/features/native-methods/components/nft-image/nft-image';

type Props = NFTImageProps & {
  icon: ReactElement;
};

export const IconOverNFTImage = ({ icon, size = 96, ...rest }: Props) => {
  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: 'calc(100% + 20px)',
          height: 'calc(100% + 20px)',
          top: '-10px',
          left: '-10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 15,
        }}
      >
        {icon}
      </div>
      <NFTImage size={size} style={{ zIndex: 13 }} {...rest} />
    </div>
  );
};
