import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { store } from '~/app/store';
import { setRT, setUserID, setUST } from '~/app/store/auth/auth.actions';
import { parseCookies } from '~/app/libs/parse-cookies';
import { getParsedQueryParams } from '~/app/libs/query-params';
import { createFeatureModule } from '~/features/framework';
import { Endpoint } from '~/server/routes/endpoint';
import { AuthPending } from '~/app/ui/components/partials/auth-confirm-states/auth-pending';
import { StandardPage } from '~/app/ui/components/layout/standard-page';
import { useController } from '~/app/ui/hooks/use-controller';
import { useEnforceOAuthMfaPages } from '~/features/oauth/hooks/useEnforceOAuthMfaPages';
import { useOAuthRedirectEffect } from '~/features/oauth/hooks/useOAuthRedirectEffect';
import { Modal } from '~/app/ui/components/layout/modal';
import { MfaVerifySuccessData } from '~/features/mfa/services/mfa/mfa';

const OAuthCredential: React.FC = () => {
  const [isMfaComplete, setIsMfaComplete] = useState(false);
  const isMfaEnabled = parseCookies()._lfc && parseCookies()._mfafr;
  const { errorRedirectQuery } = useOAuthRedirectEffect({
    isMfaComplete,
    isMfaEnabled,
  });

  const enforceMfaPages = useEnforceOAuthMfaPages(
    ({ auth_user_id, auth_user_session_token, refresh_token }: MfaVerifySuccessData) => {
      store.dispatch(setUserID(auth_user_id));
      store.dispatch(setUST(auth_user_session_token));
      store.dispatch(setRT(refresh_token));
      setIsMfaComplete(true);
    },
  );
  const { page } = useController([...enforceMfaPages.routes]);

  return (
    <StandardPage>
      {errorRedirectQuery && <Redirect to={`${Endpoint.Client.ErrorV1}?${errorRedirectQuery}`} />}
      {isMfaEnabled ? (
        <Modal in>
          <div id="modal-portal">{page}</div>
        </Modal>
      ) : (
        <AuthPending />
      )}
    </StandardPage>
  );
};

export default createFeatureModule.Page({
  render: () => {
    return <OAuthCredential />;
  },

  parseApiKey: () => parseCookies()._oaclientmeta?.magic_api_key ?? '',
  parseLocale: () => getParsedQueryParams().locale,
  parseTheme: () => parseCookies()._ct,
});
