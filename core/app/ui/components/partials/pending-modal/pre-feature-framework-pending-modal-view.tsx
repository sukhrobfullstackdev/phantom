import React from 'react';
import { useController } from '~/app/ui/hooks/use-controller';
import { ControlFlowErrorCode } from '~/app/libs/exceptions';
import {
  useActiveControlFlowErrorCode,
  usePreviousUIThreadPayload,
  useUIThreadPayload,
} from '~/app/ui/hooks/ui-thread-hooks';
import { Modal } from '../../layout/modal';
import { useGenericErrorPages } from './generic-errors';

// Passwordless login flow components
import { MagicLinkExpired } from './login/magic-link-expired';
import { MagicLinkFailed } from './login/magic-link-failed';
import { DeviceVerificationLinkExpired } from '~/features/device-verification/components/device-verification-link-expired';
import { CheckEmail } from './login/check-email';

import { RedirectLoginComplete } from './login/redirect-login-complete';
import { AuthFlow } from '~/features/device-verification/_rpc/device-verification';
import { useSelector } from '~/app/ui/hooks/redux-hooks';

/**
 * An enum of flow states the `PendingModal` component can be in.
 */
enum PendingModalFlow {
  Login,
  UpdateEmail,
}

/**
 * A hook which determines the appropriate flow state based on the JSON RPC
 * payload method currently being processed.
 */
function usePendingModalFlow() {
  const payload = useUIThreadPayload();
  const prevPayload = usePreviousUIThreadPayload();

  const reduceFlow = (method?: string) => {
    switch (method) {
      // We will reach an `undefined` case if the payload completes processing.
      // To avoid an unintended route navigation, we persist the most recently
      // processed flow.
      case undefined:
        if (prevPayload?.method) return reduceFlow(prevPayload?.method);
        break;
      default:
        return PendingModalFlow.Login;
    }
  };

  return reduceFlow(payload?.method);
}

/**
 * Define login flow pages & route reducer.
 */
function useLoginPages(globalError?: ControlFlowErrorCode) {
  const userEmail = useSelector(state => state.Auth.userEmail);
  const { routes, createPageResolver } = useController([
    // Magic link pages
    { id: 'login-check-email', content: <CheckEmail /> },
    { id: 'login-redirect-login-complete', content: <RedirectLoginComplete /> },
    { id: 'login-link-expired', content: <MagicLinkExpired /> },
    { id: 'login-link-failed', content: <MagicLinkFailed /> },
    {
      id: 'device-verification-link-expired',
      content: <DeviceVerificationLinkExpired authFactor={userEmail} authFlow={AuthFlow.MagicLink} />,
    },
  ]);

  const resolver = createPageResolver(() => {
    if (globalError) {
      switch (globalError) {
        case ControlFlowErrorCode.LoginRedirectLoginComplete:
          return 'login-redirect-login-complete';
        case ControlFlowErrorCode.LoginWithMagicLinkExpired:
          return 'login-link-expired';
        case ControlFlowErrorCode.DeviceVerificationLinkExpired:
          return 'device-verification-link-expired';
        case ControlFlowErrorCode.LoginWithMagicLinkRateLimited:
          return 'login-link-failed';
      }
    }
    return 'login-check-email';
  });

  return { routes, resolver };
}

export function OldPendingModalPage() {
  const flow = usePendingModalFlow();
  const globalError = useActiveControlFlowErrorCode();

  // Collect all the routes together.
  const genericErrorPages = useGenericErrorPages(globalError);
  const loginPages = useLoginPages(globalError);

  // Compose all routes in order of precedence.
  const { page, resolvePage } = useController([...loginPages.routes, ...genericErrorPages.routes]);

  switch (flow) {
    case PendingModalFlow.Login:
    default:
      resolvePage(genericErrorPages.resolver, loginPages.resolver);
      break;
  }

  return <Modal.RPC>{page}</Modal.RPC>;
}
