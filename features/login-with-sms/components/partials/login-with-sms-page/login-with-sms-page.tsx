import React from 'react';
import { Flex } from '@magiclabs/ui';

export const LoginWithSmsPage = ({ children, ...rest }) => (
  <Flex.Column horizontal="center" aria-live="assertive" {...rest}>
    {children}
  </Flex.Column>
);
