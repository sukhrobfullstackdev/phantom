import React from 'react';
import { Flex, Icon, Typography, Spacer } from '@magiclabs/ui';

import styles from './collectibles-list.less';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { PaintingIcon, GamepadIcon, MusicalNotesIcon, CollectibleCardIcon } from '~/shared/svg/magic-connect';

export const EmptyCollectiblesList: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Flex.Column className={`${styles.emptyCollectiblesList} ${theme.isDarkTheme ? styles.dark : ''}`}>
      <Flex.Row alignItems="center" justifyContent="center">
        <Icon type={PaintingIcon} className={theme.isDarkTheme ? '' : styles.lightIcon} />
        <Spacer size={28} />
        <Icon type={GamepadIcon} className={theme.isDarkTheme ? '' : styles.lightIcon} />
        <Spacer size={28} />
        <Icon type={MusicalNotesIcon} className={theme.isDarkTheme ? '' : styles.lightIcon} />
        <Spacer size={28} />
        <Icon type={CollectibleCardIcon} className={theme.isDarkTheme ? '' : styles.lightIcon} />
      </Flex.Row>
      <Spacer size={24} orientation="vertical" />
      <Typography.BodySmall
        weight="400"
        color={`${theme.isDarkTheme ? 'var(--white)' : 'var(--ink80)'}`}
        style={{
          textAlign: 'center',
        }}
      >
        No digital collectibles... Yet
      </Typography.BodySmall>
    </Flex.Column>
  );
};
