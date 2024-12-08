import React from 'react';
import { Flex } from '@magiclabs/ui';

import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';

export const PendingSpinner = () => {
  return (
    <Flex.Row
      justifyContent="center"
      alignItems="center"
      style={{
        padding: '60px 0 40px',
      }}
    >
      <LoadingSpinner />
    </Flex.Row>
  );
};
