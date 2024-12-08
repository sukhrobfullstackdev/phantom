import { Typography } from '@magiclabs/ui';
import React from 'react';
import styles from './multi-chain-sign-transaction-page.less';

export const TransactionDataLabel = ({ label }) => {
  return (
    <Typography.BodySmall weight="400" className={styles.label}>
      {label}
    </Typography.BodySmall>
  );
};
