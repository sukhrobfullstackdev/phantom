import { Typography } from '@magiclabs/ui';
import React from 'react';
import styles from './signature-request-page.less';

export const SignatureDataLabel = ({ label }) => {
  return (
    <Typography.BodySmall weight="400" className={styles.label}>
      {label}
    </Typography.BodySmall>
  );
};
