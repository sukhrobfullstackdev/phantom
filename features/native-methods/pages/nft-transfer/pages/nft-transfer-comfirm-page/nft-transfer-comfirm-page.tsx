import React, { Suspense, useCallback } from 'react';
import { Typography } from '@magiclabs/ui';

import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { useNFT } from '~/features/native-methods/hooks/useNFT';
import { NFTTransferForm } from '../../components/nft-transfer-form';
import { useTransferNFTForEVM } from '../../hooks/use-transfer-nft-for-evm';
import { useNFTTransferState } from '../../hooks/use-nft-trasnfer-state';
import { MotionLoading } from '~/features/native-methods/components/motion-loading/motion-loading';
import { useEstimatedGasFeeForNFTTransfer } from '../../hooks/use-estimated-gas-fee-for-nft-transfer';

export const Resolved = () => {
  const { navigateTo } = useControllerContext();
  const { address } = useUserMetadata();
  const { transferNFTForEVM } = useTransferNFTForEVM();
  const {
    nftTransferState: { toAddress, contractAddress, tokenType, tokenId, quantity },
    setNFTTransferState,
  } = useNFTTransferState();

  const { nft } = useNFT({
    contractAddress,
    tokenId,
    tokenType,
  });

  const { estimatedGasFee } = useEstimatedGasFeeForNFTTransfer({
    contractAddress,
    tokenId,
    tokenType,
    toAddress: address,
    quantity: 1,
  });

  const onSuccess = useCallback(async () => {
    debugger;
    const response = await transferNFTForEVM({
      contractAddress,
      tokenType,
      tokenId,
      toAddress,
      quantity: Number(quantity),
    });

    setNFTTransferState({
      contractAddress,
      tokenType,
      tokenId,
      quantity,
      toAddress,
      txHash: response.hash,
    });
    navigateTo('nft-transfer-pending');
  }, [contractAddress, tokenType, tokenId, toAddress, quantity]);

  return (
    <NFTTransferForm
      onSuccess={onSuccess}
      address={address}
      toAddress={toAddress}
      nft={nft}
      quantity={Number(quantity)}
      estimatedGasFee={estimatedGasFee}
    />
  );
};

export const NFTTransferConfirmPage = () => {
  const { navigateTo } = useControllerContext();
  const {
    nftTransferState: { quantity },
  } = useNFTTransferState();

  const handleBack = useCallback(() => {
    navigateTo('nft-transfer-compose');
  }, []);

  return (
    <>
      <ModalHeader
        leftAction={<BackActionButton onClick={handleBack} />}
        rightAction={<CancelActionButton />}
        header={
          <Typography.BodySmall color="var(--ink70)">
            {quantity > 1 ? `Send ${quantity} Collectibles` : 'Send Collectible'}
          </Typography.BodySmall>
        }
      />

      <Suspense fallback={<MotionLoading key="nft-transfer-confirm-suspense-loading" />}>
        <Resolved />
      </Suspense>
    </>
  );
};
