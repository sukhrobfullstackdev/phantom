import React, { useEffect } from 'react';
import { ConfirmNFTTransferLayout } from '../components/confirm-nft-transfer-layout';
import { NFTRequestResult } from '~/features/native-methods/components/NFTRequestResult';
import { useNFTTransferParams } from '../hooks/use-nft-transfer-params';
import { CloseIcon } from '~/features/native-methods/ui/icons/CloseIcon';

export const NFTTransferCanceledPage = () => {
  const {
    nftTransferParams: { nft, appName },
  } = useNFTTransferParams();

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
        title="Transfer canceled"
        description={`You can safely close this tab and go back to ${appName}`}
        nft={nft}
        icon={<CloseIcon color="white" />}
      />
    </ConfirmNFTTransferLayout>
  );
};
