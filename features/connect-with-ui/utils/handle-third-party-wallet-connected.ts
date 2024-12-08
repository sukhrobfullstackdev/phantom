import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import { thirdPartyWalletLoginFlowStart } from '../services/third-party-wallet-login';
import { connectStore } from '../store';
import { setThirdPartyWalletLoginFlowStartResponse } from '../store/connect.actions';
import { ThirdPartyWallet } from '../store/connect.reducer';

export const handleThirdPartyWalletConnected = async (
  publicAddress: string,
  chainId: number,
  walletProvider: ThirdPartyWallet,
): Promise<void> => {
  trackAction(AnalyticsActionType.LoginStarted);
  const thirdPartyWalletLoginFlowStartResponse = await thirdPartyWalletLoginFlowStart(
    publicAddress,
    walletProvider,
    'ETH',
    chainId,
  );
  connectStore.dispatch(setThirdPartyWalletLoginFlowStartResponse(thirdPartyWalletLoginFlowStartResponse));
};
