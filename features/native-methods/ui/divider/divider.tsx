import { Flex } from '@magiclabs/ui';
import React, { HTMLAttributes } from 'react';
import { useThemeMode } from '../../hooks/useThemeMode';

type Props = HTMLAttributes<HTMLElement>;

export const Divider = (props: Props) => {
  const { mode } = useThemeMode();

  return (
    <Flex alignItems="center" justifyContent="center" {...props}>
      <div
        style={{
          width: '100%',
          height: '1px',
          backgroundColor: mode('var(--ink20)', 'var(--slate3)'),
        }}
      />
    </Flex>
  );
};
