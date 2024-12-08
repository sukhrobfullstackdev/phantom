import { Spacer, Typography } from '@magiclabs/ui';
import React from 'react';
import styles from './multi-chain-sign-transaction-page.less';

export const TransactionDataContent = ({ content }) => {
  return (
    <span>
      <Typography.BodySmall weight="400" className={styles.message}>
        {content}
      </Typography.BodySmall>
      <Spacer size={7} orientation="vertical" />
    </span>
  );
};
