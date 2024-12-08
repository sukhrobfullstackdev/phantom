import React, { useContext } from 'react';
import { Spacer, Typography } from '@magiclabs/ui';
import {
  MC_FIAT_ON_RAMP_ONRAMPER_API_KEY_DAPPS,
  MC_FIAT_ON_RAMP_ONRAMPER_API_KEY_WALLET_HUB,
} from '~/shared/constants/env';
import { store } from '~/app/store';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { Network } from '~/features/connect-with-ui/components/network';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import { isETHWalletType } from '~/app/libs/network';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { ETH_SENDTRANSACTION } from '~/app/constants/eth-rpc-methods';
import { isMagicWalletDapp } from '~/app/libs/connect-utils';
import styles from './styles.less';
import { isOptimism } from '~/features/connect-with-ui/utils/is-optimism';
import { MAGIC_SHOW_FIAT_ONRAMP } from '~/app/constants/route-methods';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { Endpoint } from '~/server/routes/endpoint';

/*
  https://docs.onramper.com/docs/parameter-wallet

wallets
  wallets: string
  isAddressEditable: string
cryptos
  defaultCrypto: string
  excludeCryptos: string
  onlyCryptos: string
fiat
  defaultAmount: number
  defaultFiat: string
  isAmountEditable: boolean
  onlyFiat: string
  excludeFiat: string
*/

interface WalletFiatOnRampOnRamperProps {
  isFiatOnRampEnabled: boolean;
  isFiatOnRampSardineEnabled: boolean;
  isFiatOnRampStripeEnabled: boolean;
}

export const WalletFiatOnRampOnRamper = ({
  isFiatOnRampEnabled,
  isFiatOnRampSardineEnabled,
  isFiatOnRampStripeEnabled,
}: WalletFiatOnRampOnRamperProps) => {
  const { navigateTo } = useControllerContext();
  const payload = useUIThreadPayload();

  const walletAddress = store.hooks.useSelector(state => state.Auth.userKeys.publicAddress);
  const routeParams = store.hooks.useSelector(state => state.User.onramperRouteParams);
  const chainInfo = useContext(MultiChainInfoContext);

  // API key for Wallet hub has Moonpay enabled
  // API key for dapps has Moonpay disabled (due to CSP policy on Moonpay's side)
  const onramperKey = isMagicWalletDapp()
    ? MC_FIAT_ON_RAMP_ONRAMPER_API_KEY_WALLET_HUB
    : MC_FIAT_ON_RAMP_ONRAMPER_API_KEY_DAPPS;

  const options = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);

  const srcUrl = 'https://buy.onramper.com?';

  const urlParams = [
    `apiKey=${(options?.meta as Record<string, string>)?.onRamperApiKey || onramperKey}`,
    `wallets=ETH:${walletAddress},MATIC:${walletAddress},ETH_OPTIMISM:${walletAddress},FLOW:${walletAddress}`,
    `isAddressEditable=true`,
    `defaultCrypto=${isETHWalletType() ? chainInfo?.onramperCurrency || 'ETH' : 'FLOW'}`,
    `defaultAmount=${chainInfo?.name === 'Polygon' ? '30' : '100'}`,
    `defaultPaymentMethod=${routeParams?.defaultPaymentMethod || 'creditcard'}`,
    `isAmountEditable=true`,
  ];

  // We don't want the back button to navigate to the on-ramp selection page if the
  // user only has access to OnRamper - so navigate to wallet home in that case
  const skipOnRampSelectionPage =
    !isETHWalletType() || isOptimism(chainInfo?.network) || !store.getState().User.userLocation?.is_usa;
  const handleBackButtonClick = async () => {
    let route = 'wallet-fiat-onramp-selection';
    if (payload?.method.endsWith(ETH_SENDTRANSACTION)) {
      if (skipOnRampSelectionPage) {
        route = 'wallet-send-transaction';
      }
    } else if (skipOnRampSelectionPage) {
      route = 'wallet-home';
    }
    navigateTo(route, eventData);
  };

  const hideBackButton = () => {
    return payload?.method === MAGIC_SHOW_FIAT_ONRAMP && skipOnRampSelectionPage;
  };

  return (
    <>
      <ModalHeader
        leftAction={hideBackButton() ? <div /> : <BackActionButton onClick={handleBackButtonClick} />}
        rightAction={<CancelActionButton />}
        header={<Network />}
      />

      <BasePage className={styles.onRamper}>
        <Spacer size={40} orientation="vertical" />
        {isFiatOnRampEnabled && (
          <iframe
            src={`${srcUrl}${urlParams.join('&')}`}
            height="600px"
            width="400px"
            title="OnRamper"
            allow="accelerometer; autoplay; camera; gyroscope; payment"
          />
        )}
        {!isFiatOnRampEnabled && <Typography.BodyMedium>Fiat On Ramp Coming Soon!</Typography.BodyMedium>}
      </BasePage>
    </>
  );
};
