import React, { useEffect } from 'react';
import { Flex, Icon, Spacer } from '@magiclabs/ui';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { i18n } from '~/app/libs/i18n';
import { SuccessShieldLogo } from '~/shared/svg/account-recovery';
import styles from './device-confirm.less';

export const DeviceApproved: React.FC = () => {
  useEffect(() => {
    trackAction(AnalyticsActionType.ConfirmPageShown, { status: 'failed' });
  }, []);
  const { theme } = useTheme();

  return (
    <Flex.Column horizontal="center" aria-live="assertive" className={styles.DeviceConfirm}>
      <Icon type={SuccessShieldLogo} color="var(--leaf50)" size={40} />
      <Spacer size={24} orientation="vertical" />
      <h2 className="fontCentered">{i18n.verify_device.device_approved.toMarkdown()}</h2>
      <Spacer size={8} orientation="vertical" />
      <div className="fontDescription fontDescriptionSmall fontCentered">
        {i18n.verify_device.go_back_to_finish_login.toMarkdown({ appName: theme.appName })}
      </div>
      <Spacer size={24} orientation="vertical" />
      <div className="fontDescriptionSmall fontCentered">{i18n.verify_device.close_this_tab.toMarkdown()}</div>
    </Flex.Column>
  );
};

DeviceApproved.displayName = 'DeviceApproved';
