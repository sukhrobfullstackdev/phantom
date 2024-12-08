import React, { useCallback, useEffect, useState } from 'react';
import { useAsyncEffect } from 'usable-react';
import { CallToAction, Checkbox, Flex, Icon, Spacer } from '@magiclabs/ui';
import { AnalyticsActionType, trackAction } from '~/app/libs/analytics';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { i18n } from '~/app/libs/i18n';
import styles from './device-confirm.less';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { WarningIcon } from '~/shared/svg/magic-connect';
import { DeviceVerificationService } from '~/features/device-verification/service';

type DeviceRegistrationProps = {
  browser: string;
  device: string;
  ipAddress: string;
  referrer: string;
  deviceProfileId: string;
  deviceToken: string;
  expiryTimestamp: number;
};

export const DeviceRegistration: React.FC<DeviceRegistrationProps> = ({
  browser,
  device,
  ipAddress,
  referrer,
  deviceProfileId,
  deviceToken,
  expiryTimestamp,
}) => {
  const { navigateTo } = useControllerContext();

  useAsyncEffect(async () => {
    const { status } = (await DeviceVerificationService.deviceCheck(deviceProfileId)).data;
    if (status === 'approved') {
      navigateTo('device-approved');
    } else if (status === 'rejected') {
      navigateTo('device-rejected');
    } else {
      const expiryHandle = setInterval(() => {
        if (Date.now() > expiryTimestamp * 1000) {
          navigateTo('device-link-expired');
        }
      }, 1000);
      return () => window.clearInterval(expiryHandle);
    }
  }, [deviceProfileId]);

  useEffect(() => {
    trackAction(AnalyticsActionType.ConfirmPageShown, { status: 'failed' });
  }, []);

  const { theme, defaultTheme } = useTheme();
  const showLogo = theme.logoImage !== defaultTheme.logoImage;

  const rejectDevice = useCallback(async () => {
    try {
      await DeviceVerificationService.deviceApprove(deviceProfileId, deviceToken, false);
      navigateTo('device-rejected');
    } catch {}
  }, []);

  const approveDevice = useCallback(async () => {
    try {
      await DeviceVerificationService.deviceApprove(deviceProfileId, deviceToken, true);
      navigateTo('device-approved');
    } catch {}
  }, []);

  return (
    <Flex.Column horizontal="flex-start" aria-live="assertive" className={styles.DeviceConfirm}>
      {showLogo && (
        <div className="fontCentered">
          <ThemeLogo height={69} />
          <Spacer size={16} orientation="vertical" />
        </div>
      )}
      <h2 className="fontCentered">{i18n.verify_device.register_new_device.toMarkdown()}</h2>
      <Spacer size={32} orientation="vertical" />

      <div className={`${styles.label} strong`}>{i18n.verify_device.new_device.toMarkdown()}</div>
      <Spacer size={8} orientation="vertical" />
      <div className="fontDescription fontDescriptionSmall">
        {browser}, {device}
      </div>
      <hr />
      <Spacer size={24} orientation="vertical" />

      <div className={`${styles.label} strong`}>{i18n.verify_device.website.toMarkdown()}</div>
      <Spacer size={8} orientation="vertical" />
      <div className="fontDescription fontDescriptionSmall">{referrer}</div>
      <hr />
      <Spacer size={24} orientation="vertical" />

      <div className={`${styles.label} strong`}>{i18n.verify_device.new_device_ip.toMarkdown()}</div>
      <Spacer size={8} orientation="vertical" />
      <div className="fontDescription fontDescriptionSmall">{ipAddress}</div>

      <Spacer size={24} orientation="vertical" />

      <div className={styles.ctaButtons}>
        <CallToAction style={{ width: '50%' }} color="error" onPress={rejectDevice}>
          {i18n.verify_device.reject.toMarkdown()}
        </CallToAction>
        <Spacer size={16} orientation="horizontal" />
        <CallToAction style={{ width: '50%' }} onPress={approveDevice}>
          {i18n.verify_device.approve.toMarkdown()}
        </CallToAction>
      </div>
    </Flex.Column>
  );
};

DeviceRegistration.displayName = 'DeviceRegistration';
