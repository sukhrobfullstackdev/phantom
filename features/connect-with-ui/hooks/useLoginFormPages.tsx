import React from 'react';
import { useController } from '~/app/ui/hooks/use-controller';
import { connectStore } from '../store';
import { LoginFormPagesOptions } from '../_rpc/mc_login';
import { tryResolvePublicAddress } from '~/features/connect-with-ui/connect-with-ui.controller';
import { useLoginWithEmailOtpPages } from '~/features/email-otp/_rpc/magic_auth_login_with_email_otp';
import { store } from '~/app/store';
import { setReturnRoutePageId } from '~/app/store/ui-thread/ui-thread.actions';
import { storeChainId } from '~/features/connect-with-ui/utils/store-chain-id';
import { getWalletConnections } from '../utils/get-wallet-connections';
import { setWalletConnectionsInfo } from '../store/connect.actions';
import { WelcomePage } from '../pages/welcome-page';
import { WalletSelectionPage } from '../pages/wallet-selection-page';
import { WalletQuickConnectPage } from '../pages/wallet-quick-connect-page';
import { ThirdPartyWalletSelectionPage } from '../pages/third-party-wallet-selection-page';
import { ThirdPartyWalletQrCodePage } from '../pages/third-party-wallet-qr-code-page';
import { ThirdPartyWalletPendingPage } from '../pages/third-party-wallet-pending-page';
import { ThirdPartyWalletConnectionFailedPage } from '../pages/third-party-wallet-connection-failed-page';
import { NewLoginPromptPage } from '../pages/new-login-prompt-page';
import { isGlobalAppScope } from '~/app/libs/connect-utils';
import { UserThunks } from '~/app/store/user/user.thunks';
import { SystemThunks } from '~/app/store/system/system.thunks';
import { getReferrer } from '~/app/libs/get-referrer';
import { AccessAllowlists } from '~/app/store/system/system.reducer';

export const emitIdToken = async () => {
  const { UIThread } = store.getState();
  const { accessAllowlists } = store.getState().System;
  if (!UIThread.payload || !accessAllowlists || !anyDomainMatchesReferrer(accessAllowlists)) return;
  const idToken = await store.dispatch(UserThunks.createDIDTokenForUser(90)); // 1.5 mins as seconds
  store.dispatch(
    SystemThunks.emitJsonRpcEvent({ payload: UIThread.payload, event: 'id-token-created', params: [{ idToken }] }),
  );
};

const anyDomainMatchesReferrer = (accessAllowlists: AccessAllowlists): boolean => {
  for (const domain of accessAllowlists.domain) {
    const domainURL = new URL(domain);
    const referrerURL = new URL(getReferrer());
    // handle wildcard domains (new URL does url encoding on the asterisk)
    if (domainURL.hostname.startsWith('%2A.')) {
      // make sure end of hostname matches + scheme
      return (
        referrerURL.hostname.endsWith(domainURL.hostname.substring(4)) && referrerURL.protocol === domainURL.protocol
      );
    }
    // handle exact matches
    if (domainURL.origin === getReferrer()) {
      return true;
    }
  }
  return false;
};

export const handleLoginComplete = async onLoginComplete => {
  // if we login, make sure to clear any return route.
  // @TODO maybe clear this on payload resolve or on any rpc call start?
  await store.dispatch(setReturnRoutePageId(''));
  const { Auth } = store.getState();
  storeChainId(Auth.userID, Auth.userKeys.walletId, Auth.chainId);

  let hasAuthWallets;
  if (isGlobalAppScope()) {
    const walletConnections = await getWalletConnections(Auth.userID);
    connectStore.dispatch(setWalletConnectionsInfo(walletConnections));
    hasAuthWallets = walletConnections?.authWallets && walletConnections?.authWallets?.length > 0;
  }
  if (!hasAuthWallets || !isGlobalAppScope()) {
    await emitIdToken();
    await onLoginComplete();
  }
};

export function useLoginFormPages(
  { onLoginComplete }: LoginFormPagesOptions = {
    onLoginComplete: tryResolvePublicAddress,
  },
) {
  const { routes: otpRoutes } = useLoginWithEmailOtpPages({
    onLoginComplete: () => handleLoginComplete(onLoginComplete),
  });

  const { routes, createPageResolver } = useController([
    {
      id: 'login-prompt',
      content: <NewLoginPromptPage onComplete={() => handleLoginComplete(onLoginComplete)} />,
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
    { id: 'third-party-wallet-connection-page', content: <ThirdPartyWalletSelectionPage /> },
    { id: 'third-party-wallet-pending-page', content: <ThirdPartyWalletPendingPage /> },
    { id: 'third-party-wallet-qr-code-page', content: <ThirdPartyWalletQrCodePage /> },
    { id: 'third-party-wallet-failed-page', content: <ThirdPartyWalletConnectionFailedPage /> },
    ...otpRoutes,
  ]);
  const resolver = createPageResolver(() => 'login-prompt');

  return { routes, resolver };
}
