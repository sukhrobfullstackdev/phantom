import { createFeatureModule } from '~/features/framework';
import React from 'react';

import {
  compareOAuthState,
  getToken,
  getStorageMetadata,
  marshallParseOAuthResultParams,
  resolveOAuthFlow,
} from '../controllers/client/verify';
import { useController } from '~/app/ui/hooks/use-controller';
import { store } from '~/app/store';
import { Modal } from '~/app/ui/components/layout/modal';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { setRT, setUST, setUserEmail, setUserID } from '~/app/store/auth/auth.actions';
import { MfaVerifySuccessData } from '~/features/mfa/services/mfa/mfa';
import { useEnforceOAuthMfaPages } from '../hooks/useEnforceOAuthMfaPages';
import { handleHydrateUserOrReject, resolvePayload } from '~/app/rpc/utils';
import { UserThunks } from '~/app/store/user/user.thunks';
import { GetMetadataThunks } from '~/features/get-metadata/store/get-metadata.thunks';
import { getLogger } from '~/app/libs/datadog';

const PageRender = () => {
  const onMfaComplete = async ({ auth_user_id, auth_user_session_token, refresh_token }: MfaVerifySuccessData) => {
    const { userInfo, provider, scope, userHandle, payload } = store.getState().Auth.oauthMfaContext || {};

    store.dispatch(setUserID(auth_user_id));
    store.dispatch(setUST(auth_user_session_token));
    store.dispatch(setRT(refresh_token));

    await handleHydrateUserOrReject();

    const lifespan = 15 * 60; // 15 minutes
    const idToken = await store.dispatch(UserThunks.createDIDTokenForUser(lifespan));
    const isEmailVerified = userInfo?.emailVerified ?? true;

    store.dispatch(setUserEmail((isEmailVerified && userInfo?.email) || null));
    const userMetadata = await store.dispatch(GetMetadataThunks.formatMagicUserMetadata());

    const result = {
      oauth: {
        provider,
        scope,
        userHandle,
        userInfo,
      },
      magic: {
        idToken,
        userMetadata,
      },
    };

    getLogger().info('OAuth V2 resolution success', {
      result,
      payload,
    });

    return resolvePayload(payload as any, result);
  };

  const { loginFlowContext } = store.getState().Auth;

  const enforceMfaPages = useEnforceOAuthMfaPages(
    (successData: MfaVerifySuccessData) => onMfaComplete(successData),
    loginFlowContext,
  );

  const { page } = useController([...enforceMfaPages.routes]);

  return (
    <Modal.RPC>
      <div id="modal-portal">{page}</div>
    </Modal.RPC>
  );
};

export default createFeatureModule.RPC({
  middlewares: [
    atomic(),
    marshallParseOAuthResultParams,
    getStorageMetadata,
    compareOAuthState,
    getToken,
    resolveOAuthFlow,
  ],
  render: () => <PageRender />,
});
