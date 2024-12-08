import React from 'react';
import { Flex, Icon, Spacer } from '@magiclabs/ui';
import styles from './banner-button.less';

export const BannerButton = ({ iconType, iconColor, onClick }) => {
  return (
    <Flex.Column className={styles.actionButton} onClick={onClick}>
      <div className={[styles.actionCircle, styles.small, styles.transparent].join(' ')}>
        <button className={[styles.actionIcon, styles.small, styles.transparent].join(' ')}>
          <Icon type={iconType} color={iconColor} />
        </button>
      </div>
      <Spacer size="sm" orientation="vertical" />
    </Flex.Column>
  );
};
