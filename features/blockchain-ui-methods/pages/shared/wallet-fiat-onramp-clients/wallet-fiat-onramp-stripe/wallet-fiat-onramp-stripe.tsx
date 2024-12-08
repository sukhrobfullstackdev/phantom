import React, { useContext, useEffect, useState } from 'react';
import { Flex, Icon, Spacer, TextButton, Typography } from '@magiclabs/ui';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { ExternalLink, LinkIcon, MagicGradientIcon, WaitingIcon } from '~/shared/svg/magic-connect';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { Network } from '~/features/connect-with-ui/components/network';
import { MAGIC_WALLET_DAPP_REFERRER } from '~/shared/constants/env';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import styles from './wallet-fiat-onramp-stripe.less';
import { store } from '~/app/store';
import { HttpService } from '~/app/services/http';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { setFiatOnRampErrorRouteParams } from '~/app/store/user/user.actions';
import { ETH_SENDTRANSACTION } from '~/app/constants/eth-rpc-methods';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import { isMobileSDK } from '~/app/libs/platform';
import { shouldRouteToStripe } from '~/features/connect-with-ui/utils/should-route-to-stripe';
import { MAGIC_SHOW_FIAT_ONRAMP } from '~/app/constants/route-methods';

export const WalletFiatOnrampStripe = () => {
  const { navigateTo } = useControllerContext();
  const payload = useUIThreadPayload();
  const walletAddress = store.hooks.useSelector(state => state.Auth.userKeys.publicAddress);
  const [stripeClientToken, setStripeClientToken] = useState<undefined | string>();
  const chainInfo = useContext(MultiChainInfoContext);
  const backNavigationRoute = payload?.method.endsWith(ETH_SENDTRANSACTION) ? 'wallet-send-transaction' : 'wallet-home';

  const fetchStripeClientToken = async () => {
    const endpoint = `/v1/stripe/onramp/client_secret`;
    const body = {
      is_mainnet: !!chainInfo?.isMainnet,
      public_address: walletAddress,
      supported_destination_networks: [chainInfo?.name.toLocaleLowerCase() || 'ethereum'],
      supported_destination_currencies: [chainInfo?.currency.toLocaleLowerCase() || 'eth'],
      source_exchange_amount: chainInfo?.name === 'Polygon' ? '5' : '100',
      source_currency: 'usd',
    };
    try {
      const res = await HttpService.magic.post<any>(endpoint, body);
      setStripeClientToken(res?.data?.client_secret);
    } catch (error: any) {
      const err = JSON.parse(JSON.stringify(error));
      store.dispatch(setFiatOnRampErrorRouteParams({ errorCode: err?.code }));
      navigateTo('wallet-fiat-onramp-error');
    }
  };

  const handleOpenStripePopup = () => {
    window.open(
      `${MAGIC_WALLET_DAPP_REFERRER}/stripe?address=${walletAddress}&client_token=${stripeClientToken}&is_mainnet=${!!chainInfo?.isMainnet}&open_in_device_browser=${isMobileSDK()}`,
      undefined,
      'width=480,height=800',
    );
  };

  useEffect(() => {
    fetchStripeClientToken();
  }, []);

  useEffect(() => {
    if (!stripeClientToken) return;
    handleOpenStripePopup();
  }, [stripeClientToken]);

  const skipOnRampSelectionPage = shouldRouteToStripe(!!chainInfo?.isMainnet);

  const handleBackButtonClick = () => {
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
    <div>
      <ModalHeader
        leftAction={hideBackButton() ? <div /> : <BackActionButton onClick={handleBackButtonClick} />}
        rightAction={<CancelActionButton />}
        header={<Network />}
      />
      <BasePage className={styles.stripe}>
        <Spacer size={30} orientation="vertical" />
        {!stripeClientToken && (
          <div>
            <LoadingSpinner />
          </div>
        )}
        {stripeClientToken && (
          <div>
            <Flex.Row justifyContent="center" alignItems="center">
              <Icon type={MagicGradientIcon} size={48} />
              <Spacer size={15} orientation="horizontal" />
              <Icon type={WaitingIcon} />
              <Spacer size={15} orientation="horizontal" />
              <Icon type={LinkIcon} />
            </Flex.Row>
            <Spacer size={20} orientation="vertical" />
            <Typography.H4>Continue to Link by Stripe</Typography.H4>
            <Spacer size={10} orientation="vertical" />
            <Typography.BodyMedium weight="400" className={styles.note}>
              Please continue to{' '}
              <TextButton size="sm" onClick={() => handleOpenStripePopup()}>
                <span style={{ marginRight: '5px' }}>Link by Stripe</span>
                <Icon type={ExternalLink} size={12} />
              </TextButton>{' '}
              to complete the transaction.
            </Typography.BodyMedium>
            <Spacer size={30} orientation="vertical" />
            {!hideBackButton() && (
              <TextButton size="sm" onClick={() => navigateTo(backNavigationRoute, eventData)}>
                Back to Wallet
              </TextButton>
            )}
          </div>
        )}
      </BasePage>
    </div>
  );
};
