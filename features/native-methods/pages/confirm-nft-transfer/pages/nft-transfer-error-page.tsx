import React, { useEffect } from 'react';
import { ConfirmNFTTransferLayout } from '../components/confirm-nft-transfer-layout';
import { NFTRequestResult } from '~/features/native-methods/components/NFTRequestResult';
import { useNFTTransferParams } from '../hooks/use-nft-transfer-params';

export const NFTTransferErrorPage = () => {
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
        title="Something went wrong"
        description={`Your transfer could not be completed. Please go back ${
          nftTransferParams?.appName && `to ${nftTransferParams?.appName}`
        } and try again.`}
      />
    </ConfirmNFTTransferLayout>
  );
};
