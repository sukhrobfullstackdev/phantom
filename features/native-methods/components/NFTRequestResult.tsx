import { Flex, Spacer, Typography } from '@magiclabs/ui';
import { Nft } from 'alchemy-sdk';
import React from 'react';

import { getNftImage } from '~/features/connect-with-ui/utils/get-nft-image';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { ExclamtionIcon } from '~/features/native-methods/ui/icons/ExclamtionIcon';
import { MotionDiv } from './motion-div/motion-div';

type Props = {
  title: string;
  description: string;
  nft?: Nft | null;
  icon?: React.ReactElement;
  actions?: React.ReactElement;
};

export const NFTRequestResult = ({
  title = 'Unknown Error',
  description = 'Something went wrong. Please check your request and try again.',
  nft,
  icon,
  actions,
}: Props) => {
  const { mode } = useThemeMode();

  return (
    <MotionDiv>
      <Flex.Column
        alignItems="center"
        style={{
          marginTop: '40px',
        }}
      >
        <div
          style={{
            position: 'relative',
            backgroundImage: `url(${getNftImage(nft?.image?.cachedUrl ?? nft?.image?.originalUrl)})`,
            backgroundSize: 'cover',
            borderRadius: '12px',
            width: '96px',
            height: '96px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(2px)',
            }}
          >
            {icon ?? <ExclamtionIcon color="white" />}
          </div>
        </div>
        <Spacer size={24} orientation="vertical" />
        <Flex.Column
          alignItems="center"
          style={{
            gap: '8px',
          }}
        >
          <Typography.H3
            weight="700"
            color={mode('var(--ink100)', 'var(--white)')}
            style={{
              textAlign: 'center',
            }}
          >
            {title}
          </Typography.H3>
          <Typography.BodyMedium
            weight="400"
            color={mode('var(--ink70)', 'var(--chalk44)')}
            style={{
              textAlign: 'center',
            }}
          >
            {description}
          </Typography.BodyMedium>

          {actions && (
            <>
              <Spacer size={32} orientation="vertical" />
              {actions}
            </>
          )}
        </Flex.Column>
      </Flex.Column>
    </MotionDiv>
  );
};
