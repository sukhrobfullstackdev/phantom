import React from 'react';
import { Flex, Typography } from '@magiclabs/ui';

import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import secureWindowSource from '~/shared/svg/magic/secure-window.svg';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';

type Props = {
  onClickHere: () => void;
};

export const ContinueWithMagicWindow = ({ onClickHere }: Props) => {
  const { mode } = useThemeMode();

  return (
    <>
      <BasePage
        style={{
          alignItems: 'center',
          width: '100%',
        }}
      >
        <img
          alt="secure-screen"
          src={secureWindowSource}
          style={{
            width: '80px',
            padding: '32px 0',
          }}
        />

        <Flex
          direction="column"
          style={{
            gap: '8px',
          }}
        >
          <Typography.H3 weight="700" color={mode('var(--ink100)', 'var(--white)')}>
            Continue with Magic's secure browser window
          </Typography.H3>
          <div>
            <Typography.BodyMedium
              style={{
                display: 'inline-block',
              }}
              weight="400"
              color={mode('var(--ink70)', 'var(--chalk44)')}
            >
              Don’t see the window?
            </Typography.BodyMedium>{' '}
            <Typography.BodyMedium
              role="button"
              style={{
                display: 'inline-block',
                cursor: 'pointer',
              }}
              color="var(--magic50)"
              weight="600"
              onClick={onClickHere}
            >
              Click here
            </Typography.BodyMedium>{' '}
            <Typography.BodyMedium
              style={{
                display: 'inline-block',
              }}
              weight="400"
              color={mode('var(--ink70)', 'var(--chalk44)')}
            >
              or check your browser popup settings
            </Typography.BodyMedium>
          </div>
        </Flex>
      </BasePage>
    </>
  );
};
