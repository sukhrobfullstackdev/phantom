import React from 'react';

import { useIsLoggedInWithMagic } from '../hooks/useIsLoggedInWithMagic';
import { i18n } from '~/app/libs/i18n';
import { Flex, Typography } from '@magiclabs/ui';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { MagicLogoIcon } from '~/features/native-methods/ui/icons/MagicLogoIcon';
import { GradientCircle } from '~/features/native-methods/components/gradient-circle/gradient-circle';
import { shortenWalletAddress } from '~/features/native-methods/utils/shorten-wallet-address';
import { CopyToClipboard } from '~/features/native-methods/components/copy-to-clipboard/copy-to-clipboard';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';

export const SendingTo = () => {
  const { mode } = useThemeMode();
  const { address } = useUserMetadata();

  const { isLoggedInWithMagic } = useIsLoggedInWithMagic();

  return (
    <>
      <Flex
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        style={{
          position: 'absolute',
          top: 64,
          left: 0,
          right: 0,
          padding: '12px 16px',
          boxSizing: 'border-box',
          width: '100%',
          borderStyle: 'solid',
          borderTopWidth: '1px',
          borderBottomWidth: '1px',
          borderColor: mode('#EDEDF3', 'var(--slate4)'),
        }}
      >
        <Typography.BodySmall weight="400" color={mode('var(--ink80)}', 'var(--white)')}>
          {i18n.nft_checkout.sending_to.toString()}
        </Typography.BodySmall>

        <CopyToClipboard text={address}>
          {isLoggedInWithMagic ? (
            <Flex
              direction="row"
              alignItems="center"
              style={{
                gap: '8px',
              }}
            >
              <MagicLogoIcon />
              <Typography.BodySmall weight="500" color={mode('var(--ink100)', 'var(--white)')}>
                Magic Wallet
              </Typography.BodySmall>
            </Flex>
          ) : (
            <Flex
              direction="row"
              alignItems="center"
              style={{
                gap: '8px',
              }}
            >
              <GradientCircle walletAddress={address} />
              <Typography.BodySmall weight="500" color={mode('var(--ink100)', 'var(--white)')}>
                {shortenWalletAddress(address)}
              </Typography.BodySmall>
            </Flex>
          )}
        </CopyToClipboard>
      </Flex>
    </>
  );
};
