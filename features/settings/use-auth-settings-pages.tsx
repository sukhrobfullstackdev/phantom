import React from 'react';
import { createRoutes } from '~/app/ui/hooks/use-controller';
import { AuthSettingsPage } from './components/auth-settings-page';
import { useDisableMfaPages } from '~/features/mfa/_rpc/magic_auth_disable_mfa_flow';
import { useEnableMfaPages } from '~/features/mfa/_rpc/magic_auth_enable_mfa_flow';
import { useSetupRecoveryFlow } from '~/features/recovery/_rpc/magic_auth_setup_recovery_flow';
import { useEditRecoveryFlow } from '~/features/recovery/_rpc/magic_auth_edit_recovery_flow';
import { useRecencyCheckPages } from '~/features/recency-check/use-recency-check-pages';
import { useUpdateEmailV2Pages } from '~/features/update-email/_rpc/magic_auth_update_email_v2';

export function useAuthSettingsPages() {
  const disableMfaPages = useDisableMfaPages({ returnToRoute: 'auth-settings' });
  const enableMfaPages = useEnableMfaPages({ returnToRoute: 'auth-settings' });
  const setupRecoveryPages = useSetupRecoveryFlow({ returnToRoute: 'auth-settings' });
  const editRecoveryPages = useEditRecoveryFlow({ returnToRoute: 'auth-settings' });
  const recencyCheckPages = useRecencyCheckPages();
  const updateEmailPages = useUpdateEmailV2Pages({ returnToRoute: 'auth-settings' });

  const { routes, createPageResolver } = createRoutes([
    ...[{ id: 'auth-settings', content: <AuthSettingsPage /> }],
    ...disableMfaPages.routes,
    ...enableMfaPages.routes,
    ...setupRecoveryPages.routes,
    ...editRecoveryPages.routes,
    ...recencyCheckPages.routes,
    ...updateEmailPages.routes,
  ]);

  const resolver = createPageResolver(() => 'auth-settings');
  return { routes, resolver };
}
