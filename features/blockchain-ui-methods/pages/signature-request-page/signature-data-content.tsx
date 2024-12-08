import { Spacer, Typography } from '@magiclabs/ui';
import React from 'react';
import styles from './signature-request-page.less';

export const SignatureDataContent = ({ content }) => {
  const contentString = content.toString();
  return (
    <span>
      <Typography.BodySmall weight="400" className={styles.message}>
        {contentString?.startsWith('0x') ? (
          <span className={`${styles.hexContent} fontMonospace`}>{content}</span>
        ) : (
          content
        )}
      </Typography.BodySmall>
      <Spacer size={7} orientation="vertical" />
    </span>
  );
};
