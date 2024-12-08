import React, { useEffect } from 'react';

import { i18n } from '~/app/libs/i18n';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { Flex, Spacer, Typography } from '@magiclabs/ui';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { IconOverNFTImage } from '../../components/icon-over-nft-image/icon-over-nft-image';
import { SuccessIcon } from '~/features/native-methods/ui/icons/SuccessIcon';
import { useNFTCheckoutState } from '../../hooks/use-nft-checkout-state';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header/modal-header';
import { UserIcon } from '~/features/native-methods/ui/icons/user-icon';
import { PopoverTrigger, PopoverContent, Popover } from '~/features/native-methods/ui/popover/popover';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { IconButton } from '~/features/native-methods/ui/icon-button/icon-button';
import { NFT_CHECKOUT_TYPES, useNFTCheckoutType } from '../../hooks/use-nft-checkout-type';
import { ViewTransactionLink } from '../../components/view-transaction-link';

export const NFTCheckoutConfirmedPage = () => {
  const { navigateTo } = useControllerContext();
  const { mode } = useThemeMode();
  const { email } = useUserMetadata();
  const { nftCheckoutState } = useNFTCheckoutState();
  const { nftCheckoutType } = useNFTCheckoutType();

  useEffect(() => {
    setTimeout(() => {
      navigateTo('nft-checkout-minting');
    }, 1500);
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
        title="Checkout"
        header={
          <Flex direction="column" alignItems="center">
            <Typography.BodySmall weight="400" color="var(--ink70)">
              Checkout
            </Typography.BodySmall>
          </Flex>
        }
      />

      <Flex.Column alignItems="center">
        <Spacer size={40} orientation="vertical" />

        <IconOverNFTImage
          src={nftCheckoutState.imageUrl}
          alt={nftCheckoutState.name}
          icon={<SuccessIcon color="white" />}
        />

        <Spacer size={24} orientation="vertical" />

        <Flex.Column
          alignItems="center"
          style={{
            gap: '8px',
          }}
        >
          <Typography.H3 weight="700" color={mode('var(--ink100)', 'var(--white)')}>
            {i18n.nft_checkout.payment_confirmed.toString()}
          </Typography.H3>
          {nftCheckoutType === NFT_CHECKOUT_TYPES.CRYPTO ? (
            <ViewTransactionLink />
          ) : (
            <Typography.BodyMedium weight="400" color={mode('var(--ink70)', 'var(--chalk44)')}>
              {i18n.nft_checkout.payment_approved.toString()}
            </Typography.BodyMedium>
          )}
        </Flex.Column>
      </Flex.Column>
    </>
  );
};
