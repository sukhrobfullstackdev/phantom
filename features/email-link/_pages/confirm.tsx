import React, { useState } from 'react';
import { decodeBase64URL } from '~/app/libs/base64';
import {
  getDecodedOptionsFromQueryParams,
  getOptionsFromEndpoint,
  getParsedQueryParams,
} from '~/app/libs/query-params';
import { Modal } from '~/app/ui/components/layout/modal';
import { StandardPage } from '~/app/ui/components/layout/standard-page';
import { AuthExpired } from '~/app/ui/components/partials/auth-confirm-states/auth-expired';
import { Confirm } from '~/app/ui/components/views/confirm';
import { useController } from '~/app/ui/hooks/use-controller';
import { createFeatureModule } from '~/features/framework';
import { EnforceMfaPage } from '~/features/mfa/components/enter-totp-page';
import {
  EnterRecoveryCodePage,
  LockoutRecoveryCodePage,
  LostRecoveryCodePage,
} from '~/features/mfa/components/recovery-code-page';
import { useEnforceMfa } from '~/features/mfa/hooks/mfaHooks';
import { Endpoint } from '~/server/routes/endpoint';
import { decodeJWT } from '~/shared/libs/decode-jwt';

function useEnforceEmailMfaPages(onMfaComplete: () => void) {
  const { flow_context } = getOptionsFromEndpoint(Endpoint.Client.ConfirmV1);
  const { isLoading, error, mfaVerifyCodes } = useEnforceMfa(flow_context as string);

  const { routes, createPageResolver } = useController([
    {
      id: 'enforce-email-mfa',
      content: (
        <EnforceMfaPage
          flowContext={flow_context as string}
          onMfaComplete={onMfaComplete}
          nonMfaErrorRoute="auth-expired"
        />
      ),
    },
    {
      id: 'enter-recovery-code',
      content: (
        <EnterRecoveryCodePage
          tryRecovery={mfaVerifyCodes}
          isLoading={isLoading}
          error={error}
          navBackRoute="enforce-email-mfa"
          onRecoverySuccess={onMfaComplete}
          nonMfaErrorRoute="auth-expired"
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
      id: 'auth-expired',
      content: <AuthExpired />,
    },
  ]);

  const resolver = createPageResolver(() => 'enforce-email-mfa');
  return { routes, resolver };
}

const render = () => {
  const { tlt: tempLoginToken, next_factor: next_factor_from_query } = getOptionsFromEndpoint(Endpoint.Client.ConfirmV1);
  const { next_factor: next_factor_from_tlt } = decodeJWT<{ next_factor?: string }>(tempLoginToken as string, decodeBase64URL).payload;
  const next_factor = next_factor_from_tlt ?? next_factor_from_query;
  // all of this doLegacyConfirm stuff is due to the old verify confirm logic using an effect
  // in a hook to start verify flow which we DO NOT want to happen until the second factor
  // is completed. A page route would not work as it still triggers the hook useEffect
  // @TODO refactor legacy confirm to support being a page route so we can remove all of this
  const [doLegacyConfirm, setDoLegacyConfirm] = useState(!next_factor);
  const enforceMfaPages = useEnforceEmailMfaPages(() => setDoLegacyConfirm(true));

  const { page } = useController([...enforceMfaPages.routes]);
  return (
    <StandardPage>
      {doLegacyConfirm ? (
        <Confirm />
      ) : (
        <Modal in>
          <div id="modal-portal">{page}</div>
        </Modal>
      )}
    </StandardPage>
  );
};

export default createFeatureModule.Page({
  render,
  parseLocale: () => getParsedQueryParams().locale,
  parseTheme: () => getDecodedOptionsFromQueryParams('ct') as any,
});
