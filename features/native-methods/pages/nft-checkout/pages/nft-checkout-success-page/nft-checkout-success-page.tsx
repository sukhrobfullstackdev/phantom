import React, { useCallback } from 'react';

import { i18n } from '~/app/libs/i18n';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { Button } from '~/features/native-methods/ui/button/button';
import { NFTImage } from '~/features/native-methods/components/nft-image/nft-image';
import { Flex, Spacer, Typography } from '@magiclabs/ui';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { useNFTCheckoutState } from '../../hooks/use-nft-checkout-state';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { Popover, PopoverContent, PopoverTrigger } from '~/features/native-methods/ui/popover/popover';
import { IconButton } from '~/features/native-methods/ui/icon-button/icon-button';
import { UserIcon } from '~/features/native-methods/ui/icons/user-icon';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { useTokenInfo } from '../../hooks/use-token-info';
import { NftTokenType } from 'alchemy-sdk';
import { Confetti } from '~/features/native-methods/components/confetti/confetti';
import { MAGIC_METHODS, useMagicMethodRouter } from '~/features/native-methods/hooks/use-magic-method-router';
import { useResolvePayloadWithResponse } from '~/features/native-methods/hooks/use-resolve-payload-with-response';

export const NFTCheckoutSuccessPage = () => {
  const { theme } = useTheme();
  const { mode } = useThemeMode();
  const { email } = useUserMetadata();

  const { nftCheckoutState } = useNFTCheckoutState();
  const { resolvePayloadWithResponse } = useResolvePayloadWithResponse();
  const { push } = useMagicMethodRouter();

  const { tokenInfo } = useTokenInfo();

  const handleViewInWallet = useCallback(
    () =>
      push({
        method: MAGIC_METHODS.MAGIC_WALLET,
        params: {
          contractAddress: tokenInfo.contractAddress,
          tokenId: tokenInfo.tokenId,
        },
        pageId: tokenInfo.tokenType === NftTokenType.ERC1155 ? 'collectible-details' : 'wallet-home',
      }),
    [tokenInfo, push],
  );

  const handleBackToApp = useCallback(() => {
    resolvePayloadWithResponse();
  }, []);

  return (
    <>
      <ModalHeader
        leftAction={
          <Popover>
            <PopoverTrigger>
              <IconButton>
                <UserIcon />
              </IconButton>
            </PopoverTrigger>
            <PopoverContent>
              <Typography.BodySmall weight="400" color={mode('var(--ink80)}', 'var(--white)')}>
                {email}
              </Typography.BodySmall>
            </PopoverContent>
          </Popover>
        }
        rightAction={<CancelActionButton />}
        title="Checkout"
        header={
          <Flex direction="column" alignItems="center">
            <Typography.BodySmall weight="400" color="var(--ink70)">
              Checkout
            </Typography.BodySmall>
          </Flex>
        }
      />

      <Confetti style={{ position: 'absolute', top: 0, left: 0 }} />
      <Flex.Column alignItems="center">
        <Spacer size={40} orientation="vertical" />

        <NFTImage
          src={nftCheckoutState.imageUrl}
          alt={nftCheckoutState.name}
          size={144}
          quantity={nftCheckoutState.quantity}
        />
        <Spacer size={32} orientation="vertical" />
        <Flex
          direction="column"
          style={{
            gap: '8px',
          }}
        >
          <div
            style={{
              color: mode('var(--ink100)', 'var(--white)'),
              fontWeight: 400,
              fontSize: '1.2rem',
              lineHeight: '1.5rem',
            }}
          >
            <b>{nftCheckoutState.name ?? ''}</b> {i18n.nft_checkout.is_now_available.toString()}
          </div>
        </Flex>
        <Spacer size={40} orientation="vertical" />

        <Flex direction="column" style={{ width: '100%', gap: '16px' }}>
          <Flex direction="row" style={{ gap: '16px' }}>
            <Button variant="neutral" onClick={handleBackToApp}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '1rem',
                  lineHeight: '1.5rem',
                }}
              >
                {i18n.nft_checkout.back_to_app.toMarkdown({ appName: theme.appName })}
              </div>
            </Button>
            <Button onClick={handleViewInWallet} variant="black">
              <Typography.BodyMedium weight="600">{i18n.nft_checkout.view_in_wallet.toString()}</Typography.BodyMedium>
            </Button>
          </Flex>
        </Flex>
      </Flex.Column>
    </>
  );
};
