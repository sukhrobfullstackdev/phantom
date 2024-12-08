import { Spacer } from '@magiclabs/ui';
import { useMutation } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { isMobileSDK } from '~/app/libs/platform';
import { store } from '~/app/store';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { Network } from '~/features/connect-with-ui/components/network';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import PayPalComposePurchase from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-paypal/components/paypal-compose-purchase';
import PayPalInitiated from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-paypal/components/paypal-initiated';
import PayPalPendingAndCompleted from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-paypal/components/paypal-pending-and-completed';
import {
  createOrder,
  openURLInNewTab,
} from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-paypal/service/create-order';

import styles from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-paypal/wallet-fiat-onramp-paypal.less';
import usePollOrder from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-paypal/hooks/use-poll-order';
import { Step } from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-paypal/types/paypal-types';

import { isIosSafariOrFirefox } from '~/features/connect-with-ui/utils/device';

const ERROR_MESSAGE = 'Something went wrong, please try again';

const constructRedirectUrl = (url: string, openInDeviceBrowser: boolean) =>
  `${url}&open_in_device_browser=${openInDeviceBrowser}`;

export const WalletFiatOnrampPaypal: React.FC = () => {
  const [fiatAmount, setFiatAmount] = useState('0');
  const [validationError, setValidationError] = useState('');

  const { navigateTo } = useControllerContext();
  const navigateToError = () => navigateTo('wallet-fiat-onramp-error');

  const authUserId = store.hooks.useSelector(state => state.Auth.userID);

  const [redirectUrl, setRedirectUrl] = useState('');

  const [windowReference, setWindowReference] = useState<Window | null>(null);

  const { userAgent: ua } = navigator;

  const handleIosRedirect = isIosSafariOrFirefox(ua);

  const {
    isLoading: createOrderIsLoading,
    data: createOrderData,
    mutate: mutateCreateOrder,
  } = useMutation({
    mutationFn: () => {
      if (handleIosRedirect) setWindowReference(window.open());
      return createOrder({
        auth_user_id: authUserId,
        value: String(fiatAmount),
        channel: isMobileSDK() ? 'APP' : 'WEB',
      });
    },
    onSuccess: data => {
      if (data?.redirect_url) {
        const redirectUrlWithParams = constructRedirectUrl(data?.redirect_url, isMobileSDK());

        if (handleIosRedirect) {
          // window.open would not work here directly on iOS Safari / iOS Firefox
          // the state -> useEffect pattern with windowReference.location worked
          // https://stackoverflow.com/questions/20696041/window-openurl-blank-not-working-on-imac-safari
          setRedirectUrl(redirectUrlWithParams);
        } else {
          openURLInNewTab(redirectUrlWithParams);
        }

        setStep('INITIATED');
      } else {
        setValidationError(ERROR_MESSAGE); // user needs a redirect URL to proceed
      }
    },
    onError: () => setValidationError(ERROR_MESSAGE),
  });

  // Mobile: popup only works inside of a useEffect
  useEffect(() => {
    if (handleIosRedirect && redirectUrl && windowReference) {
      windowReference.location = redirectUrl;
    }
  }, [redirectUrl]);

  const [step, setStep] = useState<Step>('COMPOSE');
  const [transactionLink, setTransactionLink] = useState('');

  const { orderStatus, orderTransactionLink } = usePollOrder(createOrderData?.id, authUserId, navigateToError, step);

  useEffect(() => {
    if (orderStatus) setStep(orderStatus);
    if (orderTransactionLink) setTransactionLink(orderTransactionLink);
  }, [orderStatus, orderTransactionLink]);

  return (
    <div>
      <ModalHeader
        leftAction={<BackActionButton onClick={() => navigateTo('wallet-fiat-onramp-selection', eventData)} />}
        rightAction={<CancelActionButton />}
        header={<Network />}
      />

      <BasePage className={styles.paypal}>
        <Spacer size={15} orientation="vertical" />
        {step === 'COMPOSE' && (
          <PayPalComposePurchase
            fiatAmount={fiatAmount}
            setFiatAmount={setFiatAmount}
            validationError={validationError}
            setValidationError={setValidationError}
            isLoading={createOrderIsLoading}
            isButtonDisabled={createOrderIsLoading || !!validationError}
            createOrder={mutateCreateOrder}
          />
        )}
        {step === 'INITIATED' && <PayPalInitiated redirectUrl={createOrderData?.redirect_url} />}
        {step === 'PENDING' && <PayPalPendingAndCompleted transactionLink={transactionLink} step="PENDING" />}
        {step === 'COMPLETED' && <PayPalPendingAndCompleted transactionLink={transactionLink} step="COMPLETED" />}
      </BasePage>
    </div>
  );
};
