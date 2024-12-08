import React, { useCallback, useMemo } from 'react';

import { i18n } from '~/app/libs/i18n';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { Button } from '~/features/native-methods/ui/button/button';
import { Flex, Spacer, Typography } from '@magiclabs/ui';
import { ErrorIcon } from '~/features/native-methods/ui/icons/ErrorIcon';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { ExclamtionIcon } from '~/features/native-methods/ui/icons/ExclamtionIcon';
import { IconOverNFTImage } from '../../components/icon-over-nft-image/icon-over-nft-image';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header/modal-header';
import { Popover, PopoverContent, PopoverTrigger } from '~/features/native-methods/ui/popover/popover';
import { IconButton } from '~/features/native-methods/ui/icon-button/icon-button';
import { UserIcon } from '~/features/native-methods/ui/icons/user-icon';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { useDispatch } from '~/app/ui/hooks/redux-hooks';
import { UIThreadThunks } from '~/app/store/ui-thread/ui-thread.thunks';
import { useNFTCheckoutState } from '../../hooks/use-nft-checkout-state';
import { NFT_ERROR_TYPES, useNFTError } from '~/features/native-methods/hooks/use-nft-error';

type Props = {
  error?: Error & { code?: string };
};

export const NFTCheckoutErrorPage = ({ error }: Props) => {
  const { navigateTo } = useControllerContext();
  const { mode } = useThemeMode();
  const { email } = useUserMetadata();
  const { errorType: initialErrorType } = useNFTError();
  const { nftCheckoutState } = useNFTCheckoutState();

  const dispatch = useDispatch();

  const errorType = useMemo(() => {
    if (error?.code) {
      return error?.code;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return initialErrorType;
  }, [error, initialErrorType]);

  const handleTryAgain = useCallback(() => {
    navigateTo('nft-checkout-home');
  }, []);

  const errorMessage = useMemo(() => {
    if (errorType === NFT_ERROR_TYPES.INVALID_PARAMS) {
      return {
        title: 'Invalid params',
        description: 'Please check your params',
      };
    }

    if (errorType === NFT_ERROR_TYPES.PAYMENT_FAILED) {
      return {
        title: i18n.nft_checkout.payment_failed.toString(),
        description: i18n.nft_checkout.issue_with_your_payment.toString(),
        actionButton: (
          <Button onClick={handleTryAgain} variant="black">
            <Typography.BodyMedium weight="600">{i18n.nft_checkout.try_again.toString()}</Typography.BodyMedium>
          </Button>
        ),
        icon: <ErrorIcon size={40} />,
      };
    }

    if (errorType === NFT_ERROR_TYPES.SOLD_OUT) {
      return {
        title: i18n.nft_checkout.item_sold_out.toString(),
        description: i18n.nft_checkout.no_longer_available_item.toString(),
        icon: <ErrorIcon size={40} />,
      };
    }

    if (errorType === NFT_ERROR_TYPES.INSUFFICIENT_FUNDS) {
      return {
        title: i18n.nft_checkout.insufficient_funds.toString(),
        description: i18n.nft_checkout.not_enough_balance.toString(),
        actionButton: (
          <Button onClick={handleTryAgain} variant="black">
            <Typography.BodyMedium weight="600">{i18n.nft_checkout.try_again.toString()}</Typography.BodyMedium>
          </Button>
        ),
        icon: <ErrorIcon size={40} />,
      };
    }

    if (errorType === NFT_ERROR_TYPES.INTERNAL_SERVER_ERROR) {
      return {
        title: i18n.nft_checkout.internal_server_error.toString(),
        description: i18n.nft_checkout.sorry_internal_server_error.toString(),
        icon: <ErrorIcon size={40} />,
      };
    }

    if (errorType === NFT_ERROR_TYPES.SOMETHING_WENT_WRONG) {
      return {
        title: i18n.nft_checkout.something_went_wrong.toString(),
        description: i18n.nft_checkout.ran_into_a_technical_issue.toString(),
        actionButton: (
          <Button onClick={handleTryAgain} variant="black">
            <Typography.BodyMedium weight="600">{i18n.nft_checkout.try_again.toString()}</Typography.BodyMedium>
          </Button>
        ),
      };
    }

    return {
      title: i18n.nft_checkout.internal_server_error.toString(),
      description: errorType,
    };
  }, [errorType]);

  const handleCancel = useCallback(async () => {
    if (errorType === NFT_ERROR_TYPES.INVALID_PARAMS) {
      await dispatch(UIThreadThunks.releaseLockAndHideUI({ error: sdkErrorFactories.client.malformedPayload() }));
    } else if (errorType === NFT_ERROR_TYPES.PAYMENT_FAILED) {
      await dispatch(UIThreadThunks.releaseLockAndHideUI({ error: sdkErrorFactories.web3.nftCheckoutPaymentFailed() }));
    } else if (errorType === NFT_ERROR_TYPES.SOLD_OUT) {
      await dispatch(UIThreadThunks.releaseLockAndHideUI({ error: sdkErrorFactories.web3.nftCheckoutSoldOut() }));
    } else {
      await dispatch(UIThreadThunks.releaseLockAndHideUI({ error: sdkErrorFactories.web3.unknownError() }));
    }
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
        rightAction={<CancelActionButton onClick={handleCancel} />}
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
          icon={<ExclamtionIcon color="white" />}
        />

        <Spacer size={24} orientation="vertical" />

        <Flex.Column
          alignItems="center"
          style={{
            gap: '8px',
          }}
        >
          <Typography.H3 weight="700" color={mode('var(--ink100)', 'var(--white)')}>
            {errorMessage.title}
          </Typography.H3>
          <Typography.BodyMedium
            weight="400"
            color={mode('var(--ink70)', 'var(--chalk44)')}
            style={{ textAlign: 'center' }}
          >
            {errorMessage.description}
          </Typography.BodyMedium>

          <Spacer size={32} orientation="vertical" />

          {errorMessage.actionButton ?? (
            <Button onClick={handleCancel} variant="black">
              <Typography.BodyMedium weight="600">{i18n.nft_checkout.close.toString()}</Typography.BodyMedium>
            </Button>
          )}
        </Flex.Column>
      </Flex.Column>
    </>
  );
};
