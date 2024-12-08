import React, { useEffect } from 'react';
import { getOptionsFromEndpoint, getParsedQueryParams } from '~/app/libs/query-params';
import { Modal } from '~/app/ui/components/layout/modal';
import { StandardPage } from '~/app/ui/components/layout/standard-page';
import { useController } from '~/app/ui/hooks/use-controller';
import { createFeatureModule } from '~/features/framework';
import {
  DeviceApproved,
  DeviceLinkExpired,
  DeviceRegistration,
  DeviceRejected,
  DeviceVerifying,
} from '~/features/device-verification/components/device-confirm-states';
import { Endpoint } from '~/server/routes/endpoint';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import styles from './new-device-verification.less';
import { getRawThemeConfigs } from '~/app/libs/theme';

function useDeviceConfirmPages() {
  const deviceConfirmationProps = getOptionsFromEndpoint(Endpoint.Client.NewDeviceV1);
  const { metadata, sub: deviceProfileId, deviceToken, exp: expiryTimestamp } = deviceConfirmationProps;

  const { routes } = useController([
    {
      id: 'device-verifying',
      content: (
        <DeviceVerifying
          uaSig={metadata?.ua_sig ?? ''}
          deviceProfileId={deviceProfileId ?? ''}
          deviceToken={deviceToken ?? ''}
          expiryTimestamp={expiryTimestamp ?? 0}
        />
      ),
    },
    {
      id: 'device-registration',
      content: (
        <DeviceRegistration
          browser={metadata?.browser ?? ''}
          device={metadata?.os ?? ''}
          ipAddress={metadata?.device_ip ?? ''}
          referrer={origin}
          deviceProfileId={deviceProfileId ?? ''}
          deviceToken={deviceToken ?? ''}
          expiryTimestamp={expiryTimestamp ?? 0}
        />
      ),
    },
    {
      id: 'device-approved',
      content: <DeviceApproved />,
    },
    {
      id: 'device-rejected',
      content: <DeviceRejected />,
    },
    {
      id: 'device-link-expired',
      content: <DeviceLinkExpired />,
    },
  ]);

  return { routes };
}

const render = () => {
  // Remap WalletConnect's favicon for whitelabeled device verification flow
  useEffect(() => {
    if (window.location.hostname !== 'register.walletconnect.com') return;
    const iconLink = document.getElementById('favicon') as HTMLLinkElement | null;
    if (iconLink && iconLink instanceof HTMLLinkElement)
      iconLink.href = `https://assets.auth.magic.link/wc-favicon.svg`;
  }, []);
  const { metadata } = getOptionsFromEndpoint(Endpoint.Client.NewDeviceV1);

  const deviceConfirmPages = useDeviceConfirmPages();

  const { page } = useController([...deviceConfirmPages.routes]);
  return (
    <StandardPage>
      <Modal in>
        <ModalHeader header={<div className={styles.header}>{metadata?.email}</div>} />
        <div id="modal-portal">{page}</div>
      </Modal>
    </StandardPage>
  );
};

export default createFeatureModule.Page({
  render,
  parseLocale: () => getParsedQueryParams('').locale,
  parseTheme: () => getRawThemeConfigs() as any,
});
