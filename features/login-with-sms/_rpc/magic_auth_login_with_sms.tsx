import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { createFeatureModule } from '~/features/framework';
import { RpcRouteConfig } from '~/app/rpc/utils/rpc-router';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { Modal } from '~/app/ui/components/layout/modal';
import { ifUserLoggedInThenResolve, marshalSmsParams, resolveSdkSms } from '../login-with-sms.controller';
import { SmsVerificationPage } from '../components/verification-page';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { useController } from '~/app/ui/hooks/use-controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { CancelModalButton } from '~/app/ui/components/partials/pending-modal/login/cancel-modal-button/cancel-modal-button';
import { EnforceMfaPage } from '~/features/mfa/components/enter-totp-page';
import { useEnforceMfa } from '~/features/mfa/hooks/mfaHooks';
import { store } from '~/app/store';
import {
  EnterRecoveryCodePage,
  LockoutRecoveryCodePage,
  LostRecoveryCodePage,
} from '~/features/mfa/components/recovery-code-page';
import { MfaVerifySuccessData } from '~/features/mfa/services/mfa/mfa';
import { smsLoginStore } from '../store';
import { ifGlobalAppScopeRejectMagicRPC } from '~/app/rpc/controllers/feature-route.controller';
import { RECAPTCHA_KEY } from '~/app/constants/env';
import { AuthFlow, useDeviceVerificationRoutes } from '~/features/device-verification/_rpc/device-verification';

function useLoginWithSmsPages() {
  const loginFlowContext = store.hooks.useSelector(state => state.Auth.loginFlowContext);
  const { isLoading, error, mfaVerifyCodes } = useEnforceMfa(loginFlowContext);
  const phoneNumber = smsLoginStore.hooks.useSelector(state => state.phoneNumber || '');
  const deviceVerificationPages = useDeviceVerificationRoutes({ authFactor: phoneNumber, authFlow: AuthFlow.SMS });

  const resolveMfaRpc = (data: MfaVerifySuccessData) =>
    resolveSdkSms(data.auth_user_id, data.auth_user_session_token, data.refresh_token);

  const { routes, createPageResolver } = useController([
    { id: 'login-with-sms', content: <SmsVerificationPage /> },
    {
      id: 'enforce-phone-mfa',
      content: <EnforceMfaPage flowContext={loginFlowContext} onMfaComplete={resolveMfaRpc} />,
    },
    {
      id: 'enter-recovery-code',
      content: (
        <EnterRecoveryCodePage
          tryRecovery={mfaVerifyCodes}
          isLoading={isLoading}
          error={error}
          navBackRoute="enforce-phone-mfa"
          onRecoverySuccess={resolveMfaRpc}
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
    ...deviceVerificationPages.routes,
  ]);
  const resolver = createPageResolver(() => 'login-with-sms');
  return { routes, resolver };
}

const PageRender = () => {
  const globalError = useActiveControlFlowErrorCode();
  const genericErrorPages = useGenericErrorPages(globalError);
  const loginWithSmsPages = useLoginWithSmsPages();
  const setIsCloseButtonEnabled = smsLoginStore.hooks.useSelector(state => state.isCloseButtonEnabled);
  const [isRecaptchaLoaded, setIsRecaptchaLoaded] = useState(false);

  const { page, resolvePage } = useController([...loginWithSmsPages.routes, ...genericErrorPages.routes]);
  resolvePage(genericErrorPages.resolver);

  window.recaptchaOnLoad = () => {
    setIsRecaptchaLoaded(true);
  };

  return isRecaptchaLoaded ? (
    <Modal.RPC>
      <div id="modal-portal">
        {setIsCloseButtonEnabled && <CancelModalButton />}
        {page}
      </div>
    </Modal.RPC>
  ) : null;
};

const magic_auth_login_with_sms: RpcRouteConfig = {
  middlewares: [atomic(), ifGlobalAppScopeRejectMagicRPC, marshalSmsParams, ifUserLoggedInThenResolve, showUI],
  render: () => (
    <smsLoginStore.Provider>
      <Helmet>
        <script src={`https://www.google.com/recaptcha/api.js?onload=recaptchaOnLoad&render=${RECAPTCHA_KEY}`} />
      </Helmet>
      <PageRender />
    </smsLoginStore.Provider>
  ),
};

export default createFeatureModule.RPC(magic_auth_login_with_sms);
