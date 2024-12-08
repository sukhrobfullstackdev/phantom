import React from 'react';

import { FlexProps } from '@magiclabs/ui/dist/types/components/layout/flexbox/flexbox';
import { Spacer, Flex, Typography } from '@magiclabs/ui';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { DotDotDot } from './DotDotDot';
import { MagicLogoIcon } from '~/features/native-methods/ui/icons/MagicLogoIcon';
import { PaypalLogoIcon } from '~/features/native-methods/ui/icons/PaypalLogoIcon';

export const PaypalPending = ({ style, ...rest }: FlexProps) => {
  const { mode } = useThemeMode();

  return (
    <Flex
      alignItems="center"
      direction="column"
      style={{
        width: '100%',
        ...style,
      }}
      {...rest}
    >
      <Spacer size={40} orientation="vertical" />

      <Flex
        alignItems="center"
        style={{
          gap: '16px',
        }}
      >
        <MagicLogoIcon size={48} />
        <DotDotDot />
        <PaypalLogoIcon size={48} />
      </Flex>

      <Spacer size={24} orientation="vertical" />

      <Flex
        direction="column"
        style={{
          gap: '8px',
        }}
      >
        <Typography.H3 weight="700" color={mode('var(--ink100)', 'var(--white)')}>
          Continue with PayPal
        </Typography.H3>
        <Typography.BodyMedium weight="400" color={mode('var(--ink100)', 'var(--white)')}>
          Please continue to <span style={{ fontWeight: 600, color: 'var(--magic50)' }}>PayPal</span>
          <br />
          to complete transaction.
        </Typography.BodyMedium>
      </Flex>
      <Spacer size={24} orientation="vertical" />
    </Flex>
  );
};
