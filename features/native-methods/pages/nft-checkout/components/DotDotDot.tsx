import React from 'react';
import { Flex } from '@magiclabs/ui';

type Props = {
  color?: string;
};

export const DotDotDot = ({ color = 'var(--ink70)' }: Props) => {
  return (
    <Flex style={{ gap: '4px' }}>
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          style={{
            width: '4px',
            height: '4px',
            backgroundColor: color,
            borderRadius: '50%',
          }}
        />
      ))}
    </Flex>
  );
};
