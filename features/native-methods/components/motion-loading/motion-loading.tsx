import React from 'react';

import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { MotionDiv } from '../motion-div/motion-div';

type Props = {
  motionKey?: string;
};

export const MotionLoading = ({ motionKey }: Props) => {
  return (
    <MotionDiv
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        height: '336px',
        justifyContent: 'center',
      }}
      key={motionKey}
    >
      <LoadingSpinner />
    </MotionDiv>
  );
};
