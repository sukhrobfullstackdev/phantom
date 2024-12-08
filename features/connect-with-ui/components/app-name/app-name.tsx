import { HoverActivatedTooltip, Icon, Typography } from '@magiclabs/ui';
import React from 'react';
import styles from './app-name.less';
import { useTheme } from '~/app/ui/hooks/use-theme';

import { BadgeIcon, CheckIcon } from '~/shared/svg/magic-connect';
import { store } from '~/app/store';

export const AppName: React.FC<{ override?: string }> = ({ override = '' }) => {
  const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.hooks.useSelector(state => state.System);
  const theme = useTheme();

  return LAUNCH_DARKLY_FEATURE_FLAGS['is-verified-application'] ? (
    <HoverActivatedTooltip placement="bottom" style={{ display: 'inline-flex' }}>
      <HoverActivatedTooltip.Anchor>
        <Typography.BodySmall tagOverride="span" className={styles.appName}>
          {override || theme.theme.appName}
          <Icon type={BadgeIcon} style={{ position: 'relative', left: '3px', top: '2px' }} />
          <Icon type={CheckIcon} style={{ position: 'relative', left: '-8px', top: '-3px' }} />
        </Typography.BodySmall>
      </HoverActivatedTooltip.Anchor>
      <HoverActivatedTooltip.Content className={styles.tooltipContent}>Verified by Magic</HoverActivatedTooltip.Content>
    </HoverActivatedTooltip>
  ) : (
    <Typography.BodySmall tagOverride="span" className={[styles.unverified, styles.inline].join(' ')}>
      {override || theme.theme.appName}
    </Typography.BodySmall>
  );
};
