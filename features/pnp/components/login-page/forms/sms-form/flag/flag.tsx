/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-unused-expressions */

import React from 'react';
import { Alpha2Code } from '../country-metadata';

import styles from './flag.less';

interface FlagProps {
  code: Alpha2Code;
}

export const Flag: React.FC<FlagProps> = props => {
  const { code } = props;

  return (
    <div className={styles.Flag}>
      <img
        src={`https://flagcdn.com/${(code ?? 'US').toLowerCase()}.svg`}
        loading="lazy"
        alt={`${code ?? 'US'} flag`}
      />
    </div>
  );
};
