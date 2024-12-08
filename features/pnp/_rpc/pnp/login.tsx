/* eslint-disable react/jsx-pascal-case */

import React, { useMemo } from 'react';
import { createFeatureModule } from '~/features/framework';
import { showUI } from '~/app/rpc/controllers/ui.controller';
import { LoginPage } from '../../components/login-page';
import { Modal } from '~/app/ui/components/layout/modal';
import { useActiveControlFlowErrorCode, useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { LoginPageDebug } from '../../components/login-page/login-page-demo-view';
import { pnpStore } from '../../store';
import { LoginMethodType } from '~/app/constants/flags';
import { atomic } from '~/app/rpc/controllers/atomic-lock.controller';
import { useGenericErrorPages } from '~/app/ui/components/partials/pending-modal/generic-errors';
import { useController } from '~/app/ui/hooks/use-controller';
import { store } from '~/app/store';
import { getProviders } from '~/features/config/utils/config-utils';

// At the time of PnP release, support for `EmailLink`, `SMS`, and `OAuth2` is
// baked-in.
//
// For future releases, we need to check that the PnP SDK which invoked this RPC
// method supports a given auth method type. We do this to avoid reference
// errors when the PnP SDK is updated, but still cached in the CDN or a user's
// browser.
const defaultSDKSupport: string[] = [LoginMethodType.EmailLink, LoginMethodType.SMS, LoginMethodType.OAuth2];

interface Params {
  lastUsedProvider?: string;
  sdkSupport: string[];
  debug: boolean;
  termsOfServiceURI: string;
  privacyPolicyURI: string;
}

export default createFeatureModule.RPC({
  middlewares: [atomic(), showUI.force],

  render: () => {
    const payload = useUIThreadPayload();
    const {
      lastUsedProvider,
      sdkSupport = defaultSDKSupport,
      debug,
      termsOfServiceURI,
      privacyPolicyURI,
    }: Params = payload?.params?.[0] ?? {};

    const {
      configuredAuthProviders: { primaryLoginProviders, socialLoginProviders },
      isLoadingClientConfig,
    } = store.getState().System;

    const providers = useMemo(
      () => getProviders(sdkSupport, primaryLoginProviders, socialLoginProviders),
      [sdkSupport, primaryLoginProviders, socialLoginProviders],
    );

    const globalError = useActiveControlFlowErrorCode();
    const genericErrorPages = useGenericErrorPages(globalError);

    const { page, resolvePage } = useController([
      {
        id: 'pnp-login',
        content: (
          <LoginPage
            providers={providers}
            lastUsedProvider={lastUsedProvider}
            termsOfServiceURI={termsOfServiceURI}
            privacyPolicyURI={privacyPolicyURI}
          />
        ),
      },
      ...genericErrorPages.routes,
    ]);

    resolvePage(genericErrorPages.resolver);

    return (
      <pnpStore.Provider>
        {isLoadingClientConfig ? null : (
          <Modal.RPC debugSlot={debug && <LoginPageDebug />} obfuscateBackground={false}>
            {page}
          </Modal.RPC>
        )}
      </pnpStore.Provider>
    );
  },
});
