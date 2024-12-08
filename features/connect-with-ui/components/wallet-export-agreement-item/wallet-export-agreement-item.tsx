import React from 'react';
import { Checkbox, Flex, Spacer, Typography } from '@magiclabs/ui';
import styles from './wallet-export-agreement-item.less';

export const WalletExportAgreementItem = ({ content, isChecked, setIsChecked }) => {
  return (
    <Flex.Row className={styles.agreementItem} alignItems="center">
      <Checkbox onChange={() => setIsChecked(!isChecked)} checked={isChecked} />
      <Spacer size={35} orientation="horizontal" />
      <Typography.BodySmall weight="400">{content}</Typography.BodySmall>
    </Flex.Row>
  );
};
