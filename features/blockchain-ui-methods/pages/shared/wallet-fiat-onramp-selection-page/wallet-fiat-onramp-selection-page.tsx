import React, { useContext, useState } from 'react';
import { Flex, MonochromeIconDefinition, Spacer, Typography } from '@magiclabs/ui';
import { useAsyncEffect } from 'usable-react';
import { Network } from '~/features/connect-with-ui/components/network';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import {
  BankIcon,
  DetailedCreditCardIcon,
  GooglePayIcon,
  LinkByStripeDarkThemeIcon,
  LinkByStripeIcon,
  OnramperIcon,
  PayPalIcon,
  SardineIcon,
} from '~/shared/svg/magic-connect';
import { FiatOnrampSelectionItem } from '~/features/connect-with-ui/components/fiat-onramp-selection-item/fiat-onramp-selection-item';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { isOptimism } from '~/features/connect-with-ui/utils/is-optimism';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { FiatOnRampProviderDrawer } from '~/features/connect-with-ui/components/fiat-onramp-provider-drawer';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { store } from '~/app/store';
import { setOnramperRouteParams } from '~/app/store/user/user.actions';
import { ETH_SENDTRANSACTION } from '~/app/constants/eth-rpc-methods';
import { AppleIcon } from '~/shared/svg/company-logo';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { shouldRouteToOnRamper } from '~/features/connect-with-ui/utils/should-route-to-onramper';
import { AnalyticsActionType } from '~/app/libs/analytics';
import { isGlobalAppScope } from '~/app/libs/connect-utils';
import { IS_DEPLOY_ENV_DEV, IS_DEPLOY_ENV_STAGEF, IS_NODE_ENV_DEV } from '~/shared/constants/env';
import { useSelector } from '~/app/ui/hooks/redux-hooks';
import styles from './wallet-fiat-onramp-selection-page.less';
import { OnRampUnavailableBanner } from '~/features/connect-with-ui/components/on-ramp-unavailable-banner';
import { isAndroidDevice, isIosDevice } from '~/app/libs/platform';
import { EthRpcMethodRerouteMapping } from '~/app/rpc/controllers/feature-route.controller';
import { isSafariAgent } from '~/features/connect-with-ui/utils/get-user-agent';
import { MAGIC_WALLET, MC_WALLET } from '~/app/constants/route-methods';
import { shouldRouteToStripe } from '~/features/connect-with-ui/utils/should-route-to-stripe';

interface WalletFiatOnRampSelectionPageProps {
  isFiatOnRampEnabled: boolean;
  isFiatOnRampSardineEnabled: boolean;
  isFiatOnRampStripeEnabled: boolean;
  isFiatOnRampPayPalEnabled: boolean;
}

export const WalletFiatOnRampSelectionPage = ({
  isFiatOnRampEnabled,
  isFiatOnRampSardineEnabled,
  isFiatOnRampStripeEnabled,
  isFiatOnRampPayPalEnabled,
}: WalletFiatOnRampSelectionPageProps) => {
  const payload = useUIThreadPayload();
  const isHawaii = useSelector(state => state.User.userLocation?.subdivision === 'Hawaii');
  const { navigateTo } = useControllerContext();
  const { theme } = useTheme();
  const chainInfo = useContext(MultiChainInfoContext);
  const isSardineEnabled = isFiatOnRampEnabled && isFiatOnRampSardineEnabled && !isOptimism(chainInfo?.network);
  const isStripeEnabled = isFiatOnRampEnabled && isFiatOnRampStripeEnabled && !isOptimism(chainInfo?.network);
  const isProd = !(IS_NODE_ENV_DEV || IS_DEPLOY_ENV_DEV || IS_DEPLOY_ENV_STAGEF);
  const areOnRampsDisabled = !chainInfo?.isMainnet && isProd;

  const isPayPalEnabled =
    isFiatOnRampPayPalEnabled &&
    isGlobalAppScope() &&
    (chainInfo?.network === 'ethereum' || (!isProd && chainInfo?.network === 'goerli')) && // for local + dev + stagef testing
    payload?.method !== EthRpcMethodRerouteMapping[ETH_SENDTRANSACTION]; // don't show when insufficient funds error is thrown (RPC method mwui_eth_sendTransaction)
  const isBankTransferEnabled = isSardineEnabled || isStripeEnabled;
  const [isBankTransferDrawerOpen, setIsBankTransferDrawerOpen] = useState(false);
  const [isCreditCardDrawerOpen, setIsCreditCardDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const backNavigationRoute = payload?.method.endsWith(ETH_SENDTRANSACTION) ? 'wallet-send-transaction' : 'wallet-home';
  const shouldShowBackBtn =
    payload?.method.endsWith(ETH_SENDTRANSACTION) || payload?.method === MAGIC_WALLET || payload?.method === MC_WALLET;

  // On page load, route to OnRamper if we should
  useAsyncEffect(async () => {
    const routeToStripe = shouldRouteToStripe(!!chainInfo?.isMainnet);
    if (routeToStripe) {
      return navigateTo('wallet-fiat-onramp-stripe', eventData);
    }
    const routeToOnRamper = await shouldRouteToOnRamper(
      !!chainInfo?.isMainnet,
      chainInfo?.network,
      isFiatOnRampEnabled,
      isFiatOnRampSardineEnabled,
      isFiatOnRampStripeEnabled,
    );
    if (routeToOnRamper) {
      return navigateTo('wallet-fiat-onramp-on-ramper', eventData);
    }
    setIsLoading(false);
  }, []);

  /**
   * Bank Transfer Drawer Logic
   */
  const handleOpenBankTransferDrawer = () => {
    setIsBankTransferDrawerOpen(!isBankTransferDrawerOpen);
  };

  const handleBankTransferClick = () => {
    store.dispatch(setOnramperRouteParams({ defaultPaymentMethod: 'banktransfer' }));
    if (isStripeEnabled && isSardineEnabled) {
      return handleOpenBankTransferDrawer();
    }
    if (isStripeEnabled) {
      return navigateTo('wallet-fiat-onramp-stripe', eventData);
    }
    return navigateTo('wallet-fiat-onramp-sardine', eventData);
  };

  const handlePayPalClick = () => {
    return navigateTo('wallet-fiat-onramp-paypal', eventData);
  };

  const bankTransferProviders = [
    isSardineEnabled && {
      name: 'sardine',
      event: AnalyticsActionType.SardineClick,
      providerIcon: SardineIcon,
      limit: '$3,000 daily limit',
    },
    {
      name: 'on-ramper',
      event: AnalyticsActionType.OnramperClick,
      providerIcon: OnramperIcon,
      limit: 'Limits vary',
    },
    isStripeEnabled && {
      name: 'stripe',
      event: AnalyticsActionType.StripeClick,
      providerIcon: theme.isDarkTheme ? LinkByStripeDarkThemeIcon : LinkByStripeIcon,
      limit: '$1,500 weekly limit',
    },
  ].filter(provider => !!provider);

  /**
   * Credit Card Drawer Logic
   */
  const handleOpenCreditCardDrawer = () => {
    setIsCreditCardDrawerOpen(!isCreditCardDrawerOpen);
  };

  const handleCreditCardClick = () => {
    store.dispatch(setOnramperRouteParams({ defaultPaymentMethod: 'creditcard' }));
    if (isStripeEnabled || isSardineEnabled) {
      return handleOpenCreditCardDrawer();
    }
    navigateTo('wallet-fiat-onramp-on-ramper', eventData);
  };

  const creditCardProviders = [
    isSardineEnabled && {
      name: 'sardine',
      event: AnalyticsActionType.SardineClick,
      providerIcon: SardineIcon,
      limit: '$3,000 daily limit',
    },
    {
      name: 'on-ramper',
      event: AnalyticsActionType.OnramperClick,
      providerIcon: OnramperIcon,
      limit: 'Limits vary',
    },
    isStripeEnabled && {
      name: 'stripe',
      event: AnalyticsActionType.StripeClick,
      providerIcon: theme.isDarkTheme ? LinkByStripeDarkThemeIcon : LinkByStripeIcon,
      limit: '$1,500 weekly limit',
    },
  ].filter(provider => !!provider);

  interface PaymentOptionButton {
    event: AnalyticsActionType;
    title: string;
    onClick: () => void;
    paymentTypeIcon: MonochromeIconDefinition;
    isEnabled: boolean;
    label: string;
  }

  const paymentMethodButtons: PaymentOptionButton[] = [
    {
      event: AnalyticsActionType.PayPalClick,
      title: 'PayPal',
      onClick: handlePayPalClick,
      paymentTypeIcon: PayPalIcon,
      isEnabled: isPayPalEnabled,
      label: 'ETH only',
    },
    {
      event: AnalyticsActionType.BankTransferClick,
      title: 'Instant Bank Transfer',
      onClick: handleBankTransferClick,
      paymentTypeIcon: BankIcon,
      isEnabled: isBankTransferEnabled,
      label: '',
    },
    {
      event: AnalyticsActionType.CreditCardClick,
      title: 'Credit or Debit',
      onClick: handleCreditCardClick,
      paymentTypeIcon: DetailedCreditCardIcon,
      isEnabled: isFiatOnRampEnabled,
      label: '',
    },
    {
      event: AnalyticsActionType.ApplePayClick,
      title: 'Apple Pay',
      onClick: () => {
        store.dispatch(setOnramperRouteParams({ defaultPaymentMethod: 'applepay' }));
        navigateTo('wallet-fiat-onramp-on-ramper', eventData);
      },
      paymentTypeIcon: AppleIcon,
      isEnabled: isFiatOnRampEnabled && (isIosDevice() || isSafariAgent()),
      label: '',
    },
    {
      event: AnalyticsActionType.GooglePayClick,
      title: 'Google Pay',
      onClick: () => {
        store.dispatch(setOnramperRouteParams({ defaultPaymentMethod: 'googlepay' }));
        navigateTo('wallet-fiat-onramp-on-ramper', eventData);
      },
      paymentTypeIcon: GooglePayIcon,
      isEnabled: isFiatOnRampEnabled && isAndroidDevice(),
      label: '',
    },
  ];

  // Position PayPal at the bottom if a user is in Hawaii
  if (isHawaii && isPayPalEnabled) {
    paymentMethodButtons.push(paymentMethodButtons.shift() as PaymentOptionButton);
  }

  return (
    <div>
      <ModalHeader
        leftAction={
          shouldShowBackBtn ? <BackActionButton onClick={() => navigateTo(backNavigationRoute, eventData)} /> : <div />
        }
        rightAction={<CancelActionButton />}
        header={<Network />}
      />
      {isLoading ? (
        <Flex.Row alignItems="center" justifyContent="center" style={{ minHeight: '250px' }}>
          <LoadingSpinner />
        </Flex.Row>
      ) : (
        <>
          {areOnRampsDisabled ? (
            <>
              <Spacer size={16} orientation="vertical" />
              <OnRampUnavailableBanner />
            </>
          ) : null}
          <div>
            <Spacer size={30} orientation="vertical" />
            <Typography.H4 weight="700">Payment Method</Typography.H4>
            <Spacer size={20} orientation="vertical" />
            {paymentMethodButtons
              .filter(({ isEnabled }) => isEnabled)
              .map(paymentMethod => {
                return (
                  <FiatOnrampSelectionItem
                    key={paymentMethod.title}
                    event={paymentMethod.event}
                    title={paymentMethod.title}
                    onClick={paymentMethod.onClick}
                    paymentTypeIcon={paymentMethod.paymentTypeIcon}
                    label={paymentMethod.label}
                    isDisabled={areOnRampsDisabled}
                  />
                );
              })}
          </div>
          {isHawaii && isPayPalEnabled ? (
            <>
              <Spacer size={10} orientation="vertical" />
              <Typography.BodySmall weight="400" className={styles.subText}>
                PayPal is not available for Hawaii residents.
              </Typography.BodySmall>
            </>
          ) : null}
          {/* Bank Transfer Drawer */}
          <FiatOnRampProviderDrawer
            providers={bankTransferProviders}
            isDrawerOpen={isBankTransferDrawerOpen}
            setIsDrawerOpen={setIsBankTransferDrawerOpen}
            handleOpenDrawer={handleOpenBankTransferDrawer}
          />
          {/* Credit Card Drawer */}
          <FiatOnRampProviderDrawer
            providers={creditCardProviders}
            isDrawerOpen={isCreditCardDrawerOpen}
            setIsDrawerOpen={setIsCreditCardDrawerOpen}
            handleOpenDrawer={handleOpenCreditCardDrawer}
          />
        </>
      )}
    </div>
  );
};
