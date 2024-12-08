import React from 'react';
import { MonochromeIconDefinition } from '@magiclabs/ui';

export const Forbidden: MonochromeIconDefinition = {
  SVGContents: ({ theme }) => (
    <path
      d="M20.5 0C9.46 0 0.5 8.96 0.5 20C0.5 31.04 9.46 40 20.5 40C31.54 40 40.5 31.04 40.5 20C40.5 8.96 31.54 0 20.5 0ZM4.5 20C4.5 11.16 11.66 4 20.5 4C24.2 4 27.6 5.26 30.3 7.38L7.88 29.8C5.68353 27.0063 4.49278 23.5538 4.5 20ZM20.5 36C16.8 36 13.4 34.74 10.7 32.62L33.12 10.2C35.3165 12.9937 36.5072 16.4462 36.5 20C36.5 28.84 29.34 36 20.5 36Z"
      fill={theme.isDarkTheme ? 'var(--ruby30)' : 'var(--ruby50)'}
    />
  ),

  viewbox: [0, 0, 40, 40],
};
