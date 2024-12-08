import React from 'react';
import { Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import styles from './powered-by.less';

export const PoweredBy = ({ name, nameIcon }) => {
  return (
    <div style={{ marginTop: '-5px' }}>
      <Flex.Row justifyContent="space-between">
        <Flex.Row alignItems="center">
          <Typography.BodySmall weight="400" className={styles.text}>
            Powered by
          </Typography.BodySmall>
          <Spacer size={6} orientation="horizontal" />
          <Icon type={nameIcon} size={{ height: name === 'sardine' ? 18 : 14 }} />
        </Flex.Row>
        {name === 'sardine' && (
          <div>
            <Typography.BodySmall weight="400" className={styles.text}>
              Unavailable in NY, HI
            </Typography.BodySmall>
          </div>
        )}
      </Flex.Row>
      <Spacer size={30} orientation="vertical" />
    </div>
  );
};
