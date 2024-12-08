import React from 'react';
import jwt from 'jsonwebtoken';
import { useQueryClient } from '@tanstack/react-query';

import { getLogger } from '~/app/libs/datadog';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { getDecodedTctPayload } from '~/features/confirm-action/components/confirm-action-page';
import { PendingSpinner } from '~/features/native-methods/ui/PendingSpinner';
import { Endpoint } from '~/server/routes/endpoint';
import { CONFIRM_ACTION_JWT_PUBLIC_KEYS } from '~/features/confirm-action/constants/keys';
import { DEPLOY_ENV } from '~/shared/constants/env';
import { useAsyncEffect } from 'usable-react';
import { NFTTransferParams } from '../hooks/use-nft-transfer-params';
import { useAlchemy } from '~/features/blockchain-ui-methods/hooks/use-alchemy';
import { getApiKey } from '~/app/libs/api-key';

export const NFTTransferLoadingPage = () => {
  const { navigateTo } = useControllerContext();
  const queryClient = useQueryClient();
  const { alchemy } = useAlchemy();

  useAsyncEffect(async () => {
    const ak = getApiKey();
    if (!ak || typeof ak !== 'string') {
      getLogger().warn('Warning with LoadingNFTTransferPage: api key is not provided');
      navigateTo('nft-transfer-error');
      return;
    }

    const { tct } = getOptionsFromEndpoint(Endpoint.Client.ConfirmNFTTransferV1);
    if (!tct) {
      getLogger().warn('Warning with LoadingNFTTransferPage: tct is not provided');
      navigateTo('nft-transfer-error');
      return;
    }

    const decoded = getDecodedTctPayload(tct);
    const { from, to, nft, estimatedGasFee, appName, email } = decoded.payload;
    if (!from || !to || !nft || !estimatedGasFee || !appName) {
      getLogger().warn('Warning with LoadingNFTTransferPage: payload is not valid');
      navigateTo('nft-transfer-error');
      return;
    }

    try {
      const nftMetadata = await alchemy.nft.getNftMetadata(nft.contract_address, nft.token_id);
      queryClient.setQueryData<NFTTransferParams>(['nft-transfer-params'], {
        ak,
        tct,
        from,
        to,
        nft: {
          ...nftMetadata,
          quantity: nft.quantity,
        },
        estimatedGasFee,
        appName,
        email: email ?? '',
      });
    } catch (e) {
      getLogger().warn('Warning with LoadingNFTTransferPage: nft is not valid');
      navigateTo('nft-transfer-error');
      return;
    }

    try {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (currentTimestamp > decoded.exp) {
        throw new Error('tct is expired');
      }
      jwt.verify(tct, CONFIRM_ACTION_JWT_PUBLIC_KEYS[DEPLOY_ENV]);
    } catch (e) {
      getLogger().warn('Warning with LoadingNFTTransferPage: tct is expired or invalid');
      navigateTo('nft-transfer-expired');
      return;
    }

    navigateTo('confirm-nft-transfer');
  }, []);

  return <PendingSpinner />;
};
