import React, { useEffect, useState } from 'react';

import { i18n } from '~/app/libs/i18n';
import { SpinnerIcon } from '~/features/native-methods/ui/icons/SpinnerIcon';
import { NFTImage } from '~/features/native-methods/components/nft-image/nft-image';
import { Flex, Spacer, Typography } from '@magiclabs/ui';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { useInterval } from '~/features/native-methods/hooks/use-interval';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { Popover, PopoverContent, PopoverTrigger } from '~/features/native-methods/ui/popover/popover';
import { IconButton } from '~/features/native-methods/ui/icon-button/icon-button';
import { UserIcon } from '~/features/native-methods/ui/icons/user-icon';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { useNFTCheckoutState } from '../../hooks/use-nft-checkout-state';
import { SuccessIcon } from '~/features/native-methods/ui/icons/SuccessIcon';
import { NFT_CHECKOUT_TYPES, useNFTCheckoutType } from '../../hooks/use-nft-checkout-type';
import { useNFTPaypalCheckoutState } from '../../hooks/use-nft-paypal-checkout-state';
import { isEmpty } from '~/app/libs/lodash-utils';
import { NFTService } from '~/app/services/nft/nft-service';
import { REQUEST_STATUS } from '../../constants';
import { useNFTCryptoCheckoutState } from '../../hooks/use-nft-crypto-checkout-state';
import { useAlchemy } from '~/features/blockchain-ui-methods/hooks/use-alchemy';
import { useNFTError } from '~/features/native-methods/hooks/use-nft-error';
import { Animate } from '~/features/native-methods/components/animate/animate';
import { MotionDiv } from '~/features/native-methods/components/motion-div/motion-div';
import { ViewTransactionLink } from '../../components/view-transaction-link';
import { useDispatchResponse } from '~/features/native-methods/hooks/use-dispatch-response';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';

const MINTING_STATUS = {
  CREATING_ITEM: 'CREATING_ITEM',
  PREPARING: 'PREPARING',
  DELIVERING: 'DELIVERING',
  DELIVERED: 'DELIVERED',
  DONE: 'DONE',
} as const;

type MintingStatus = keyof typeof MINTING_STATUS;

export const NFTCheckoutMintingPage = () => {
  const { email } = useUserMetadata();
  const { mode } = useThemeMode();
  const { navigateTo } = useControllerContext();
  const { dispatchResponse } = useDispatchResponse();

  const { alchemy } = useAlchemy();
  const { nftCheckoutState } = useNFTCheckoutState();
  const { nftCheckoutType } = useNFTCheckoutType();
  const {
    nftPaypalCheckoutState: { orderId, requestId },
  } = useNFTPaypalCheckoutState();
  const {
    nftCryptoCheckoutState: { txHash },
  } = useNFTCryptoCheckoutState();
  const { setErrorType } = useNFTError();

  const [status, setStatus] = useState<MintingStatus>(MINTING_STATUS.CREATING_ITEM);

  useInterval(
    async () => {
      if (status === MINTING_STATUS.CREATING_ITEM) {
        setStatus(MINTING_STATUS.PREPARING);
        return;
      }

      if (status === MINTING_STATUS.PREPARING) {
        setStatus(MINTING_STATUS.DELIVERING);
        return;
      }

      if (status === MINTING_STATUS.DELIVERING) {
        if (nftCheckoutType === NFT_CHECKOUT_TYPES.CRYPTO) {
          if (isEmpty(txHash)) {
            setErrorType('something-went-wront');
            navigateTo('nft-checkout-error');
            return;
          }

          const receipt = await alchemy.core.waitForTransaction(txHash);
          if (receipt?.status !== 1) {
            dispatchResponse('declined');
            setErrorType('something-went-wront');
            navigateTo('nft-checkout-error');
            return;
          }

          setStatus(MINTING_STATUS.DELIVERED);
          return;
        }

        if (nftCheckoutType === NFT_CHECKOUT_TYPES.PAYPAL || nftCheckoutType === NFT_CHECKOUT_TYPES.CREDIT_OR_DEBIT) {
          if (isEmpty(requestId)) {
            setErrorType('something-went-wront');
            navigateTo('nft-checkout-error');
            return;
          }

          const { error, data } = await NFTService.fetchRequestStatus({
            requestId,
          });

          if (error || !data) {
            setErrorType('something-went-wront');
            navigateTo('nft-checkout-error');
            return;
          }

          if (data.status === REQUEST_STATUS.MINTED || data.status === REQUEST_STATUS.WEBHOOK_SUCCESS_SENT) {
            dispatchResponse('processed');
            setStatus(MINTING_STATUS.DELIVERED);
          } else if (data.status === REQUEST_STATUS.MINT_FAILED || data.status === REQUEST_STATUS.WEBHOOK_FAILED_SENT) {
            dispatchResponse('declined');
            setErrorType('something-went-wront');
            navigateTo('nft-checkout-error');
          }
        }

        return;
      }

      if (status === MINTING_STATUS.DELIVERED) {
        setStatus(MINTING_STATUS.DONE);
        navigateTo('nft-checkout-success');
      }
    },
    status !== MINTING_STATUS.DONE ? 2000 : null,
  );

  useEffect(() => {
    dispatchResponse('pending');
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

      <Flex.Column alignItems="center">
        <Spacer size={40} orientation="vertical" />
        <NFTImage
          src={nftCheckoutState.imageUrl}
          alt={nftCheckoutState.name}
          size={144}
          quantity={nftCheckoutState.quantity}
        />
        <Spacer size={24} orientation="vertical" />
        <Typography.H3 weight="700" color={mode('var(--ink100)', 'var(--white)')}>
          {i18n.nft_checkout.order_confirmed.toString()}
        </Typography.H3>
        <Spacer size={24} orientation="vertical" />
        <Flex.Column
          alignItems="center"
          style={{
            width: '100%',
            borderRadius: '12px',
            backgroundColor: mode('var(--ink10)', 'var(--slate1)'),
            padding: '16px',
            gap: '8px',
          }}
        >
          <Animate initial={false} exitBeforeEnter>
            {status === MINTING_STATUS.CREATING_ITEM && (
              <MotionDiv
                key={MINTING_STATUS.CREATING_ITEM}
                depth={10}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <SpinnerIcon size={20} color={mode('var(--ink100)', 'white')} />
                <Typography.BodySmall weight="600" color={mode('var(--ink100)', 'var(--white)')}>
                  {i18n.nft_checkout.creating_item.toString()}
                </Typography.BodySmall>
              </MotionDiv>
            )}
            {status === MINTING_STATUS.PREPARING && (
              <MotionDiv
                key={MINTING_STATUS.PREPARING}
                depth={10}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <SpinnerIcon size={20} color={mode('var(--ink100)', 'white')} />
                <Typography.BodySmall weight="600" color={mode('var(--ink100)', 'var(--white)')}>
                  {i18n.nft_checkout.preparing_for_delivery.toString()}
                </Typography.BodySmall>
              </MotionDiv>
            )}
            {status === MINTING_STATUS.DELIVERING && (
              <MotionDiv
                key={MINTING_STATUS.DELIVERING}
                depth={10}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <SpinnerIcon size={20} color={mode('var(--ink100)', 'white')} />
                <Typography.BodySmall weight="600" color={mode('var(--ink100)', 'var(--white)')}>
                  {i18n.nft_checkout.delivering_item.toString()}
                </Typography.BodySmall>
              </MotionDiv>
            )}
            {status === MINTING_STATUS.DELIVERED && (
              <MotionDiv
                key={MINTING_STATUS.DELIVERED}
                depth={10}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <SuccessIcon size={20} color={mode('var(--ink100)', 'white')} />
                <Typography.BodySmall weight="600" color={mode('var(--ink100)', 'var(--white)')}>
                  {i18n.nft_checkout.item_delivered.toString()}
                </Typography.BodySmall>
              </MotionDiv>
            )}
          </Animate>

          <Typography.BodySmall
            color={mode('var(--ink80)', 'var(--chalk72)')}
            weight="400"
            style={{
              maxWidth: '222px',
              textAlign: 'center',
              opacity: status === MINTING_STATUS.DELIVERED ? '0.3' : '1',
            }}
          >
            {i18n.nft_checkout.delivery_may_take_a_few_minutes.toString()}
          </Typography.BodySmall>
        </Flex.Column>
        <Spacer size={16} orientation="vertical" />
        {nftCheckoutType === NFT_CHECKOUT_TYPES.CRYPTO ? (
          <ViewTransactionLink />
        ) : (
          <Typography.BodySmall
            weight="400"
            color={mode('var(--ink70)', 'var(--chalk44)')}
            style={{
              textAlign: 'center',
            }}
          >
            Order ID: {orderId}
          </Typography.BodySmall>
        )}
      </Flex.Column>
    </>
  );
};
