import React, { useEffect } from 'react';
import { Flex, Icon, Spacer } from '@magiclabs/ui';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { i18n } from '~/app/libs/i18n';
import { LockShieldLogo } from '~/shared/svg/account-recovery';
import styles from './device-confirm.less';

export const DeviceRejected: React.FC = () => {
  useEffect(() => {
    trackAction(AnalyticsActionType.ConfirmPageShown, { status: 'failed' });
  }, []);
  const { theme } = useTheme();

  return (
    <Flex.Column horizontal="center" aria-live="assertive" className={styles.DeviceConfirm}>
      <Icon type={LockShieldLogo} color="var(--alert50)" />
      <Spacer size={24} orientation="vertical" />
      <h2 className="fontCentered">{i18n.verify_device.rejected_login_title.toMarkdown()}</h2>
      <Spacer size={8} orientation="vertical" />
      <div className="fontDescription fontDescriptionSmall fontCentered">
        {i18n.verify_device.rejected_login_text.toMarkdown()}
      </div>
      <Spacer size={20} orientation="vertical" />
      <div className="fontDescriptionSmall fontCentered">
        {i18n.verify_device.rejected_login_mistake.toMarkdown({ appName: theme.appName })}
      </div>
    </Flex.Column>
  );
};

DeviceRejected.displayName = 'DeviceRejected';
