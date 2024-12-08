import React, { useEffect } from 'react';
import { Spacer, Icon, Flex } from '@magiclabs/ui';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import { i18n } from '~/app/libs/i18n';

import styles from './device-confirm.less';
import { AlertIcon } from '~/shared/svg/auth';

export const DeviceLinkExpired: React.FC = () => {
  useEffect(() => {
    trackAction(AnalyticsActionType.ConfirmPageShown, { status: 'expired' });
  }, []);

  return (
    <Flex.Column horizontal="center" className={styles.DeviceConfirm} aria-live="assertive">
      <Icon type={AlertIcon} />
      <Spacer size={24} orientation="vertical" />
      <h2>{i18n.verify_device.device_verification_link_expired.toMarkdown()}</h2>
      <Spacer size={4} orientation="vertical" />
      <div className="fontDescription fontDescriptionSmall fontCentered">
        {i18n.verify_device.your_device_link_expired.toMarkdown()}
      </div>
      <Spacer size={8} orientation="vertical" />
    </Flex.Column>
  );
};

DeviceLinkExpired.displayName = 'DeviceLinkExpired';
