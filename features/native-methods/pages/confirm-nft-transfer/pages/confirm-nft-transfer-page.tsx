import React from 'react';

import { ConfirmActionService } from '~/app/services/confirm-action';
import { ConfirmResponse } from '~/app/services/confirm-action/complete-confirm';
import { useNFTTransferParams } from '../hooks/use-nft-transfer-params';
import { ConfirmNFTTransferLayout } from '../components/confirm-nft-transfer-layout';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { NFTTransferForm } from '../../nft-transfer/components/nft-transfer-form';
import { BigNumber } from 'ethers';

export const ConfirmNFTTransferPage = () => {
  const { navigateTo } = useControllerContext();
  const { nftTransferParams } = useNFTTransferParams();
  const { ak, tct, from, to, estimatedGasFee, nft } = nftTransferParams;
console.log('ConfirmNFTTransferPage');
  const onSuccess = async () => {
    try {
      await ConfirmActionService.completeConfirm(tct, ak, ConfirmResponse.Approved);
      navigateTo('nft-transfer-confirmed');
    } catch (e) {
      navigateTo('nft-transfer-error');
    }
  };

  const onCancel = () => {
    try {
      ConfirmActionService.completeConfirm(tct, ak, ConfirmResponse.Rejected);
      navigateTo('nft-transfer-canceled');
    } catch (err) {
      navigateTo('nft-transfer-error');
    }
  };

  return (
    <>
      <ConfirmNFTTransferLayout>
        <NFTTransferForm
          address={from}
          toAddress={to}
          nft={nft}
          quantity={Number(nft.quantity)}
          estimatedGasFee={BigNumber.from(estimatedGasFee)}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </ConfirmNFTTransferLayout>
    </>
  );
};
