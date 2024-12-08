import React, { useEffect } from 'react';
import { ConfirmNFTTransferLayout } from '../components/confirm-nft-transfer-layout';
import { NFTRequestResult } from '~/features/native-methods/components/NFTRequestResult';
import { useNFTTransferParams } from '../hooks/use-nft-transfer-params';
import { CloseIcon } from '~/features/native-methods/ui/icons/CloseIcon';

export const NFTTransferNotSupportedPage = () => {
  const { nftTransferParams } = useNFTTransferParams();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      window.close();

      return () => {
        clearTimeout(timeoutId);
      };
    }, 2000);
  }, []);

  return (
    <ConfirmNFTTransferLayout>
      <NFTRequestResult
        title="Not Supported"
        description="Sorry! This network is not suppored yet."
        nft={nftTransferParams?.nft}
        icon={<CloseIcon color="white" />}
      />
    </ConfirmNFTTransferLayout>
  );
};
