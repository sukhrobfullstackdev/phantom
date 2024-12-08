import React, { useEffect } from 'react';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { Flex, Spacer, Typography } from '@magiclabs/ui';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { i18n } from '~/app/libs/i18n';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { Popover, PopoverContent, PopoverTrigger } from '~/features/native-methods/ui/popover/popover';
import { IconButton } from '~/features/native-methods/ui/icon-button/icon-button';
import { UserIcon } from '~/features/native-methods/ui/icons/user-icon';
import { IconOverNFTImage } from '../../components/icon-over-nft-image/icon-over-nft-image';
import { Spinner } from '~/features/native-methods/ui/spinner/spinner';
import { NFTService } from '~/app/services/nft/nft-service';
import { NFT_CHECKOUT_TYPES, useNFTCheckoutType } from '../../hooks/use-nft-checkout-type';
import { useNFTPaypalCheckoutState } from '../../hooks/use-nft-paypal-checkout-state';
import { useNFTCheckoutState } from '../../hooks/use-nft-checkout-state';
import { NFTError, NFT_ERROR_TYPES, useNFTError } from '~/features/native-methods/hooks/use-nft-error';
import { useMutation } from '@tanstack/react-query';
import { AuthorizePaypalOrderResponse } from '~/app/services/nft/authorizePaypalOrder';

const useAuthorizePaypalOrder = () => {
  const { setErrorType } = useNFTError();
  const { nftCheckoutType } = useNFTCheckoutType();
  const { navigateTo } = useControllerContext();
  const { nftPaypalCheckoutState, setNFTPaypalCheckoutState } = useNFTPaypalCheckoutState();

  const { mutateAsync: authorizePaypalOrder } = useMutation<AuthorizePaypalOrderResponse, Error>({
    mutationFn: async () => {
      if (nftCheckoutType !== NFT_CHECKOUT_TYPES.PAYPAL && nftCheckoutType !== NFT_CHECKOUT_TYPES.CREDIT_OR_DEBIT) {
        throw new NFTError(NFT_ERROR_TYPES.SOMETHING_WENT_WRONG);
      }

      const { error, data } = await NFTService.authorizePaypalOrder({
        orderId: nftPaypalCheckoutState.orderId,
      });

      if (error || !data) {
        throw new NFTError(NFT_ERROR_TYPES.PAYMENT_FAILED);
      }

      return data;
    },
    onSuccess: data => {
      setNFTPaypalCheckoutState({
        ...nftPaypalCheckoutState,
        requestId: data.requestId,
      });
      navigateTo('nft-checkout-confirmed');
    },
    onError: e => {
      setErrorType(e.message);
      navigateTo('nft-checkout-error');
    },
  });

  return { authorizePaypalOrder };
};

export const NFTCheckoutConfirmingPage = () => {
  const { mode } = useThemeMode();
  const { email } = useUserMetadata();
  const { nftCheckoutState } = useNFTCheckoutState();
  const { authorizePaypalOrder } = useAuthorizePaypalOrder();

  useEffect(() => {
    authorizePaypalOrder();
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

        <IconOverNFTImage src={nftCheckoutState.imageUrl} alt={nftCheckoutState.name} icon={<Spinner />} />

        <Spacer size={24} orientation="vertical" />

        <Flex.Column
          alignItems="center"
          style={{
            gap: '8px',
          }}
        >
          <Typography.H3 weight="700" color={mode('var(--ink100)', 'var(--white)')}>
            {i18n.nft_checkout.confirming_order.toString()}
          </Typography.H3>
          <Typography.BodyMedium
            weight="400"
            color={mode('var(--ink70)', 'var(--chalk44)')}
            style={{ textAlign: 'center' }}
          >
            {i18n.nft_checkout.sequred_by_bank_grade.toString()}
          </Typography.BodyMedium>
        </Flex.Column>
      </Flex.Column>
    </>
  );
};
