import React from 'react';
import { isIframe } from '../../../../constants/is-iframe';
import { NoMatch } from '../../views/no-match';

export const EnforceIframe: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return isIframe ? <>{children}</> : <NoMatch />;
};
