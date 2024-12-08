import React from 'react';
import { Flex, Typography } from '@magiclabs/ui';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { shortenWalletAddress } from '~/features/native-methods/utils/shorten-wallet-address';
import { GradientCircle } from '~/features/native-methods/components/gradient-circle/gradient-circle';
import { useQuery } from '@tanstack/react-query';
import { SpinnerIcon } from '~/features/native-methods/ui/icons/SpinnerIcon';
import { truncateTitle } from '~/features/native-methods/utils/truncate-title';
import { useAlchemy } from '~/features/blockchain-ui-methods/hooks/use-alchemy';
import { useLinkToWallet } from '~/features/blockchain-ui-methods/hooks/use-link-to-wallet';

type Props = {
  address: string;
};

export const DecentralisedNaming = ({ address }: Props) => {
  const { alchemy } = useAlchemy();
  const { mode } = useThemeMode();
  const { linkToWallet } = useLinkToWallet();

  const { data: contractMetadata, isLoading } = useQuery(['collectable', address], async () => {
    if (!alchemy) {
      throw new Error('Alchemy is not initialized');
    }

    const metadata = await alchemy.nft.getContractMetadata(address);
    return metadata;
  });

  if (isLoading) {
    return <SpinnerIcon size={24} />;
  }

  return contractMetadata?.name ? (
    <Typography.BodySmall
      weight="400"
      color={mode('var(--ink100)', 'var(--white)')}
      onClick={() => linkToWallet(address)}
      style={{
        cursor: 'pointer',
        wordBreak: 'break-word',
      }}
    >
      {truncateTitle(contractMetadata.name, 32)}
    </Typography.BodySmall>
  ) : (
    <Flex.Row
      alignItems="center"
      style={{
        gap: '8px',
      }}
    >
      <Typography.BodySmall
        weight="400"
        color={mode('var(--ink100)', 'var(--white)')}
        onClick={() => linkToWallet(address)}
        style={{
          cursor: 'pointer',
        }}
      >
        {shortenWalletAddress(address)}
      </Typography.BodySmall>
      <GradientCircle walletAddress={address} />
    </Flex.Row>
  );
};
