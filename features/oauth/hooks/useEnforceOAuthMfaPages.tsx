import React from 'react';
import { parseCookies } from '~/app/libs/parse-cookies';
import { EnforceMfaPage } from '~/features/mfa/components/enter-totp-page';
import {
  EnterRecoveryCodePage,
  LockoutRecoveryCodePage,
  LostRecoveryCodePage,
} from '~/features/mfa/components/recovery-code-page';
import { useController } from '~/app/ui/hooks/use-controller';
import { useEnforceMfa } from '~/features/mfa/hooks/mfaHooks';
import { MfaVerifySuccessData } from '~/features/mfa/services/mfa/mfa';

export const useEnforceOAuthMfaPages = (
  onMfaComplete: (mfaResult: MfaVerifySuccessData) => void,
  loginFlowContext?: string,
) => {
  const flowContext = loginFlowContext || parseCookies()._lfc;
  const { isLoading, error, mfaVerifyCodes } = useEnforceMfa(flowContext as string);
  const { routes, createPageResolver } = useController([
    {
      id: 'enforce-oauth-mfa',
      content: <EnforceMfaPage flowContext={flowContext as string} onMfaComplete={onMfaComplete} />,
    },
    {
      id: 'enter-recovery-code',
      content: (
        <EnterRecoveryCodePage
          tryRecovery={mfaVerifyCodes}
          isLoading={isLoading}
          error={error}
          navBackRoute="enforce-oauth-mfa"
          onRecoverySuccess={onMfaComplete}
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
  ]);

  const resolver = createPageResolver(() => 'enforce-oauth-mfa');
  return { routes, resolver };
};
