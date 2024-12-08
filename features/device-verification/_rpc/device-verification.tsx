import React from 'react';
import { createRoutes } from '~/app/ui/hooks/use-controller';
import { DeviceVerificationLinkExpired } from '~/features/device-verification/components/device-verification-link-expired';
import { DeviceVerificationPending } from '~/features/device-verification/components/device-verification-pending';

export enum AuthFlow {
  EmailOTP,
  MagicLink,
  SMS,
}

export type DeviceVerificationProps = {
  authFactor: string;
  authFlow: AuthFlow;
};
export function useDeviceVerificationRoutes({ authFactor, authFlow }: DeviceVerificationProps) {
  const { routes, createPageResolver } = createRoutes([
    {
      id: 'device-verification-pending',
      content: <DeviceVerificationPending authFactor={authFactor} authFlow={authFlow} />,
    },
    {
      id: 'device-verification-link-expired',
      content: <DeviceVerificationLinkExpired authFactor={authFactor} authFlow={authFlow} />,
    },
  ]);
  const resolver = createPageResolver(() => 'device-verification-pending');
  return { routes, resolver };
}
