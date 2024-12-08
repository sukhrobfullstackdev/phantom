import React, { PropsWithChildren, useEffect } from 'react';
import {
  DISPATCH_ACTION,
  PayPalScriptProvider,
  SCRIPT_LOADING_STATE,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import { useQuery } from '@tanstack/react-query';

import { FetchPaypalClientTokenResponse } from '~/app/services/nft/fetchPaypalClientToken';
import { NFTService } from '~/app/services/nft/nft-service';
import { useNFTCheckoutState } from '../hooks/use-nft-checkout-state';
import { store } from '~/app/store';

const usePaypalClientToken = () => {
  const { nftCheckoutState } = useNFTCheckoutState();

  const { data: paypalClientToken, ...rest } = useQuery<FetchPaypalClientTokenResponse>({
    queryKey: ['paypal-client-token', nftCheckoutState.contractId],
    queryFn: async () => {
      const magicClientId = store.getState().Auth.clientID;

      const response = await NFTService.fetchPaypalClientToken({
        contractId: nftCheckoutState.contractId,
        magicClientId,
      });

      if (!response.data) {
        throw new Error('Failed to fetch paypal client token');
      }

      return response.data;
    },
    suspense: true,
  });

  return { paypalClientToken: paypalClientToken!, ...rest };
};

const Resolved = ({ children }: PropsWithChildren) => {
  const [, dispatch] = usePayPalScriptReducer();

  useEffect(() => {
    dispatch({
      type: DISPATCH_ACTION.LOADING_STATUS,
      value: SCRIPT_LOADING_STATE.PENDING,
    });
  }, []);

  return children;
};

export const PaypalSuspense = ({ children }: PropsWithChildren) => {
  const { paypalClientToken } = usePaypalClientToken();

  return (
    <PayPalScriptProvider
      deferLoading
      options={{
        clientId: paypalClientToken.paypalClientId,
        dataClientToken: paypalClientToken.paypalClientToken,
        merchantId: paypalClientToken.paypalMerchantId,
        dataPartnerAttributionId: paypalClientToken.paypalBnCode,
        components: 'buttons,hosted-fields',
        intent: 'authorize',
        vault: false,
        currency: 'USD',
        dataCspNonce: 'sha256-+W1kP7MnoEBAVMH1OMmL6R4z0JlMf/brhyn+5FTOG60=',
      }}
    >
      <Resolved>{children}</Resolved>
    </PayPalScriptProvider>
  );
};
