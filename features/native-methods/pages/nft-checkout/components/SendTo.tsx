import React from 'react';

import { store } from '~/app/store';

import { useIsLoggedInWithMagic } from '../hooks/useIsLoggedInWithMagic';
import { Flex, Typography } from '@magiclabs/ui';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { MagicLogoIcon } from '~/features/native-methods/ui/icons/MagicLogoIcon';
import { GradientCircle } from '~/features/native-methods/components/gradient-circle/gradient-circle';
import { shortenWalletAddress } from '~/features/native-methods/utils/shorten-wallet-address';

export const SendTo = () => {
  const { mode } = useThemeMode();
  const walletAddress = store.hooks.useSelector(state => state.Auth.userKeys.publicAddress);

  const { isLoggedInWithMagic } = useIsLoggedInWithMagic();

  return (
    <Flex
      direction="row"
      alignItems="center"
      style={{
        gap: '8px',
      }}
    >
      {isLoggedInWithMagic ? (
        <>
          <Typography.BodySmall weight="400" color={mode('var(--ink100)', 'var(--white)')}>
            Magic Wallet
          </Typography.BodySmall>
          <MagicLogoIcon />
        </>
      ) : (
        <>
          {walletAddress && (
            <>
              <Typography.BodySmall weight="400" color={mode('var(--ink100)', 'var(--white)')}>
                {shortenWalletAddress(walletAddress)}
              </Typography.BodySmall>
              <GradientCircle walletAddress={walletAddress} />
            </>
          )}
        </>
      )}
    </Flex>
  );
};
