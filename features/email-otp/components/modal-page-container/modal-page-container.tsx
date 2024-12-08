import React from 'react';
import { Flex } from '@magiclabs/ui';

export const ModalPageContainer = ({ children, ...rest }) => (
  <Flex.Column horizontal="center" aria-live="assertive" {...rest}>
    {children}
  </Flex.Column>
);
