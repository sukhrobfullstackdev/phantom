import React, { useMemo } from 'react';
import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { Modal } from '~/app/ui/components/layout/modal';
import { EmailVerificationPage } from '~/features/email-otp/components/verification-page';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { useController } from '~/app/ui/hooks/use-controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { EnforceMfaPage } from '~/features/mfa/components/enter-totp-page';
import { useEnforceMfa } from '~/features/mfa/hooks/mfaHooks';
import { store } from '~/app/store';
import {
  EnterRecoveryCodePage,
  LockoutRecoveryCodePage,
  LostRecoveryCodePage,
} from '~/features/mfa/components/recovery-code-page';
import { createRandomString } from '~/app/libs/crypto';
import {
  applyWhitelabel,
  completeLogin,
  ifUserLoggedInThenResolve,
  marshalEmailOtpParams,
  resolveRpcWithDID,
} from '../email-otp.controller';
import { loginWithEmailOtpStore } from '../store';
import { SuccessLoginData } from '../hooks/emailOtpHooks';
import { WelcomePage } from '~/features/connect-with-ui/pages/welcome-page';
import { WalletSelectionPage } from '~/features/connect-with-ui/pages/wallet-selection-page';
import { WalletQuickConnectPage } from '~/features/connect-with-ui/pages/wallet-quick-connect-page';
import { ifGlobalAppScopeRejectMagicRPC } from '~/app/rpc/controllers/feature-route.controller';
import { AuthFlow, useDeviceVerificationRoutes } from '~/features/device-verification/_rpc/device-verification';
import { ExpiredOtpPage } from '../components/expired-otp-page';

type LoginWithEmailOtpPagesOptions = {
  onLoginComplete: () => Promise<any>;
};

export function useLoginWithEmailOtpPages({ onLoginComplete }: LoginWithEmailOtpPagesOptions) {
  const rom = useMemo(() => createRandomString(128), []);
  const email = loginWithEmailOtpStore.hooks.useSelector(state => state.email);
  const loginFlowContext = store.hooks.useSelector(state => state.Auth.loginFlowContext);
  const isSecondFactor = store.hooks.useSelector(state => state.Auth.factorsRequired.length > 1);
  const { isLoading, error, mfaVerifyCodes } = useEnforceMfa(loginFlowContext || '');
  const deviceVerificationPages = useDeviceVerificationRoutes({ authFactor: email, authFlow: AuthFlow.EmailOTP });
  const resolveLoginRpc = async (data: SuccessLoginData) => {
    await completeLogin(rom, data.auth_user_id, data.auth_user_session_token, data.refresh_token);
    await onLoginComplete();
  };

  const { routes, createPageResolver } = useController([
    {
      id: 'login-with-email-otp',
      content: (
        <EmailVerificationPage rom={rom} isSecondFactor={isSecondFactor} email={email} resolveLogin={resolveLoginRpc} />
      ),
    },
    {
      id: 'enforce-email-otp-mfa',
      content: <EnforceMfaPage flowContext={loginFlowContext || ''} onMfaComplete={resolveLoginRpc} />,
    },
    {
      id: 'enter-recovery-code',
      content: (
        <EnterRecoveryCodePage
          tryRecovery={mfaVerifyCodes}
          isLoading={isLoading}
          error={error}
          navBackRoute="enforce-email-otp-mfa"
          onRecoverySuccess={resolveLoginRpc}
        />
      ),
    },
    {
      id: 'lost-recovery-code',
      content: <LostRecoveryCodePage navBackRoute="enter-recovery-code" />,
    },
    {
      id: 'recovery-code-lockout',
      content: <LockoutRecoveryCodePage hideActions />,
    },
    {
      id: 'email-otp-expired',
      content: <ExpiredOtpPage />,
    },
    {
      id: 'welcome-page',
      content: <WelcomePage />,
    },
    {
      id: 'wallet-selection-page',
      content: <WalletSelectionPage />,
    },
    {
      id: 'wallet-quick-connect-page',
      content: <WalletQuickConnectPage />,
    },
    ...deviceVerificationPages.routes,
  ]);
  const resolver = createPageResolver(() => 'login-with-email-otp');
  return { routes, resolver };
}

const PageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const pages = useLoginWithEmailOtpPages({
    onLoginComplete: resolveRpcWithDID,
  });

  const { page, resolvePage } = useController([...pages.routes, ...genericErrorPages.routes]);
  resolvePage(genericErrorPages.resolver);

  return (
    <Modal.RPC>
      <loginWithEmailOtpStore.Provider>
        <div id="modal-portal">{page}</div>
      </loginWithEmailOtpStore.Provider>
    </Modal.RPC>
  );
};

const magic_auth_login_with_email_otp: RpcRouteConfig = {
  middlewares: [
    atomic(),
    ifGlobalAppScopeRejectMagicRPC,
    marshalEmailOtpParams,
    ifUserLoggedInThenResolve,
    applyWhitelabel,
    showUI.force,
  ],
  render: () => <PageRender />,
};

export default createFeatureModule.RPC(magic_auth_login_with_email_otp);
