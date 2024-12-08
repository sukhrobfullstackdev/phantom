import React, { useEffect } from 'react';
import { Flex, Spacer } from '@magiclabs/ui';
import { AnalyticsActionType, trackAction } from '~/app/libs/analytics';
import { i18n } from '~/app/libs/i18n';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner/loading-spinner';
import { useControllerContext } from '~/app/ui/hooks/use-controller';

import styles from './device-confirm.less';
import { useAsyncEffect } from 'usable-react';
import { jwtVerify } from 'jose';
import { JWKSetForDeviceToken } from '~/features/device-verification/components/device-confirm-states/constants/jwk';
import { verifyUASig } from '~/app/libs/webcrypto/ua-sig';
import { DeviceVerificationService } from '~/features/device-verification/service';

interface DeviceVerifyingPageProps {
  uaSig: string;
  deviceProfileId: string;
  deviceToken: string;
  expiryTimestamp: number;
}

export const DeviceVerifying: React.FC<DeviceVerifyingPageProps> = ({
  uaSig,
  deviceProfileId,
  deviceToken,
  expiryTimestamp,
}) => {
  const { navigateTo } = useControllerContext();

  useAsyncEffect(async () => {
    try {
      // Verify the JWT
      await jwtVerify(deviceToken, JWKSetForDeviceToken);

      if (Date.now() > expiryTimestamp * 1000) {
        navigateTo('device-link-expired');
      } else {
        const isSameIFrameContext = await verifyUASig(uaSig);
        if (isSameIFrameContext) {
          await DeviceVerificationService.deviceApprove(deviceProfileId, deviceToken, true);
          navigateTo('device-approved');
        } else {
          navigateTo('device-registration');
        }
      }
    } catch (e) {
      navigateTo('device-link-expired');
    }
  }, []);

  useEffect(() => {
    trackAction(AnalyticsActionType.ConfirmPageShown, { status: 'expired' });
  }, []);

  return (
    <Flex.Column horizontal="center" className={styles.DeviceConfirm} aria-live="assertive">
      <Spacer size={24} orientation="vertical" />
      <LoadingSpinner />
      <Spacer size={16} orientation="vertical" />
      <div className="fontDescription fontDescriptionSmall fontCentered">
        {i18n.verify_device.device_verifying.toMarkdown()}
      </div>
      <Spacer size={8} orientation="vertical" />
    </Flex.Column>
  );
};

DeviceVerifying.displayName = 'DeviceVerifying';
