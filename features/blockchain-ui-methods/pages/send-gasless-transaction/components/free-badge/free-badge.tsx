import React from 'react';
import { Flex, Typography } from '@magiclabs/ui';
import { usePrimaryColor } from '~/features/native-methods/hooks/usePrimaryColor';
import { convertHEXToRGBA } from '~/features/native-methods/utils/convert-hex-to-rgba';

export const FreeBadge = () => {
  const { primaryColor } = usePrimaryColor();

  return (
    <Flex
      alignItems="center"
      justifyContent="center"
      style={{
        padding: '6px 8px',
        borderRadius: '6px',
        backgroundColor: convertHEXToRGBA(primaryColor, 0.08),
      }}
    >
      <Typography.H6
        weight="600"
        color={primaryColor}
        style={{
          fontSize: '10px',
          lineHeight: '12px',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}
      >
        FREE
      </Typography.H6>
    </Flex>
  );
};
