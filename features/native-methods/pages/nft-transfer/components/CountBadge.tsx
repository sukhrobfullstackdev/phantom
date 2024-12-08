import { Flex, Typography } from '@magiclabs/ui';
import { FlexProps } from '@magiclabs/ui/dist/types/components/layout/flexbox/flexbox';
import React from 'react';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';

type Props = FlexProps & {
  count: number;
  color?: string;
};

export const CountBadge = ({ count, color, style, ...rest }: Props) => {
  const { mode } = useThemeMode();
  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      style={{
        border: `2px solid ${mode('white', '#323232')}`,
        backgroundColor: mode('var(--ink20)', 'var(--slate1)'),
        boxSizing: 'border-box',
        padding: '6px 8px',
        borderRadius: '6px',
        ...style,
      }}
      {...rest}
    >
      <Typography.BodySmall
        weight="600"
        color={color ?? mode('var(--ink80)', 'white')}
        style={{
          fontSize: '0.75rem',
          lineHeight: '0.75rem',
        }}
      >
        x{count}
      </Typography.BodySmall>
    </Flex>
  );
};
