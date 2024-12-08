import React, { Suspense, useCallback, useMemo } from 'react';

import { i18n } from '~/app/libs/i18n';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { Button } from '~/features/native-methods/ui/button/button';
import { Flex, Spacer, Typography } from '@magiclabs/ui';
import { ErrorIcon } from '~/features/native-methods/ui/icons/ErrorIcon';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { ExclamtionIcon } from '~/features/native-methods/ui/icons/ExclamtionIcon';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header/modal-header';
import { Popover, PopoverContent, PopoverTrigger } from '~/features/native-methods/ui/popover/popover';
import { IconButton } from '~/features/native-methods/ui/icon-button/icon-button';
import { UserIcon } from '~/features/native-methods/ui/icons/user-icon';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { useDispatch } from '~/app/ui/hooks/redux-hooks';
import { UIThreadThunks } from '~/app/store/ui-thread/ui-thread.thunks';
import { NFTError, NFT_ERROR_TYPES, useNFTError } from '~/features/native-methods/hooks/use-nft-error';
import { IconOverNFTImage } from '../../../nft-checkout/components/icon-over-nft-image/icon-over-nft-image';
import { useNFTTransferState } from '../../hooks/use-nft-trasnfer-state';
import { useNFT } from '~/features/native-methods/hooks/useNFT';
import { getNftAltTag } from '~/features/connect-with-ui/utils/get-nft-alt-tag';
import { MotionLoading } from '~/features/native-methods/components/motion-loading/motion-loading';

type Props = {
  error?: Error;
  reset?: () => void;
};

type ResolvedProps = {
  errorType: NFTError | string;
  onClose: () => void;
  reset?: () => void;
};

const Resolved = ({ errorType, onClose, reset }: ResolvedProps) => {
  const { navigateTo } = useControllerContext();
  const { mode } = useThemeMode();
  const {
    nftTransferState: { contractAddress, tokenId, tokenType },
  } = useNFTTransferState();

  const { nft } = useNFT({
    contractAddress,
    tokenId,
    tokenType,
  });

  const handleTryAgain = useCallback(() => {
    if (reset) {
      reset();
    } else {
      navigateTo('nft-transfer-compose');
    }
  }, []);

  const errorMessage = useMemo(() => {
    if (errorType === NFT_ERROR_TYPES.INVALID_PARAMS) {
      return {
        title: 'Invalid NFT',
        description: 'Please check your NFT, it may be invalid or you may not own it.',
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

    return {
      title: i18n.nft_checkout.something_went_wrong.toString(),
      description: i18n.nft_checkout.ran_into_a_technical_issue.toString(),
      actionButton: (
        <Button onClick={handleTryAgain} variant="black">
          <Typography.BodyMedium weight="600">{i18n.nft_checkout.try_again.toString()}</Typography.BodyMedium>
        </Button>
      ),
    };
  }, [errorType]);

  return (
    <Flex.Column alignItems="center">
      <Spacer size={40} orientation="vertical" />

      <IconOverNFTImage
        src={nft?.image.cachedUrl ?? nft?.image.originalUrl}
        alt={nft ? getNftAltTag(nft) : 'sorry'}
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
          <Button onClick={onClose} variant="black">
            <Typography.BodyMedium weight="600">{i18n.nft_checkout.close.toString()}</Typography.BodyMedium>
          </Button>
        )}
      </Flex.Column>
    </Flex.Column>
  );
};

export const NFTTransferErrorPage = ({ error, reset }: Props) => {
  const { email } = useUserMetadata();
  const { mode } = useThemeMode();
  const dispatch = useDispatch();
  const { errorType: initialErrorType } = useNFTError();

  const errorType = useMemo(
    () => (error instanceof Error ? error.message : initialErrorType),
    [error, initialErrorType],
  );

  const handleCancel = useCallback(async () => {
    if (errorType === NFT_ERROR_TYPES.INVALID_PARAMS) {
      await dispatch(UIThreadThunks.releaseLockAndHideUI({ error: sdkErrorFactories.client.malformedPayload() }));
    } else if (errorType === NFT_ERROR_TYPES.INSUFFICIENT_FUNDS) {
      await dispatch(UIThreadThunks.releaseLockAndHideUI({ error: sdkErrorFactories.web3.insufficientFunds() }));
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
        header={
          <Flex direction="column" alignItems="center">
            <Typography.BodySmall weight="400" color="var(--ink70)">
              Send Collectible
            </Typography.BodySmall>
          </Flex>
        }
      />

      <Suspense fallback={<MotionLoading key="nft-transfer-error-suspense-loading" />}>
        <Resolved errorType={errorType} onClose={handleCancel} reset={reset} />
      </Suspense>
    </>
  );
};
