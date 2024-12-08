import React, { useCallback } from 'react';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { Flex, Spacer, Typography } from '@magiclabs/ui';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { i18n } from '~/app/libs/i18n';
import { NFTImage } from '~/features/native-methods/components/nft-image/nft-image';
import { Divider } from '~/features/native-methods/ui/divider/divider';
import { Button } from '~/features/native-methods/ui/button/button';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { PaypalSymbolIcon } from '~/features/native-methods/ui/icons/PaypalSymbolIcon';
import { DotDotDot } from '../../components/DotDotDot';
import { CardIconSelector } from '../../components/CardIconSelector';
import { SendTo } from '../../components/SendTo';
import { useTokenInfo } from '../../hooks/use-token-info';
import { NFT_CHECKOUT_TYPES, useNFTCheckoutType } from '../../hooks/use-nft-checkout-type';
import { useNFTCheckoutState } from '../../hooks/use-nft-checkout-state';
import { useNFTPaypalCheckoutState } from '../../hooks/use-nft-paypal-checkout-state';
import { formatReadablePrice } from '~/features/native-methods/utils/format-readable-price';

export const NFTCheckoutPaypalPage = () => {
  const { navigateTo, navigateBackToPrevPage } = useControllerContext();
  const { mode } = useThemeMode();

  const { nftCheckoutType } = useNFTCheckoutType();
  const { nftCheckoutState } = useNFTCheckoutState();

  const { tokenInfo } = useTokenInfo();

  const {
    nftPaypalCheckoutState: { cardType, lastDigits },
  } = useNFTPaypalCheckoutState();
  const { email } = useUserMetadata();

  const handleBuyNow = useCallback(() => {
    navigateTo('nft-checkout-confirming');
  }, []);

  return (
    <>
      <ModalHeader
        leftAction={<BackActionButton onClick={navigateBackToPrevPage} />}
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

        <NFTImage src={nftCheckoutState.imageUrl} alt={nftCheckoutState.name} quantity={nftCheckoutState.quantity} />

        <Spacer size={24} orientation="vertical" />

        <Flex.Column
          alignItems="center"
          style={{
            gap: '8px',
          }}
        >
          <Typography.H3 weight="700" color={mode('var(--ink100)', 'var(--white)')}>
            {i18n.nft_checkout.confirm_purchase.toString()}
          </Typography.H3>
          <Typography.BodyMedium weight="400" color={mode('var(--ink100)', 'var(--white)')}>
            {nftCheckoutState.name}
          </Typography.BodyMedium>
        </Flex.Column>

        <Spacer size={24} orientation="vertical" />

        <Flex
          direction="column"
          style={{
            width: '100%',
          }}
        >
          <Flex direction="row" alignItems="center" justifyContent="space-between">
            <Typography.BodySmall weight="400" color={mode('var(--ink70)', 'var(--chalk44)')}>
              {i18n.nft_checkout.quantity.toString()}
            </Typography.BodySmall>
            <Typography.BodySmall weight="400" color={mode('var(--ink100)', 'var(--white)')}>
              {nftCheckoutState.quantity}
            </Typography.BodySmall>
          </Flex>

          <Divider
            style={{
              padding: '12px 0',
            }}
          />
          <Flex direction="row" alignItems="center" justifyContent="space-between">
            <Typography.BodySmall weight="400" color={mode('var(--ink70)', 'var(--chalk44)')}>
              {i18n.nft_checkout.total_price.toString()}
            </Typography.BodySmall>
            <Typography.BodySmall weight="700" color={mode('var(--ink100)', 'var(--white)')}>
              {`${formatReadablePrice({
                price: tokenInfo.priceInUSD,
              })}`}
            </Typography.BodySmall>
          </Flex>

          <Divider
            style={{
              padding: '12px 0',
            }}
          />

          <Flex direction="row" alignItems="center" justifyContent="space-between">
            <Typography.BodySmall weight="400" color={mode('var(--ink70)', 'var(--chalk44)')}>
              {i18n.nft_checkout.payment.toString()}
            </Typography.BodySmall>

            {nftCheckoutType === NFT_CHECKOUT_TYPES.PAYPAL && (
              <Flex
                alignItems="center"
                style={{
                  gap: '14px',
                }}
              >
                <Typography.BodySmall weight="400" color={mode('var(--ink100)', 'var(--white)')}>
                  {email}
                </Typography.BodySmall>
                <PaypalSymbolIcon />
              </Flex>
            )}
            {nftCheckoutType === NFT_CHECKOUT_TYPES.CREDIT_OR_DEBIT && (
              <Flex alignItems="center">
                <DotDotDot />
                <Spacer size={8} orientation="horizontal" />
                <Typography.BodySmall weight="400" color={mode('var(--ink100)', 'var(--white)')}>
                  {lastDigits}
                </Typography.BodySmall>
                <Spacer size={12} orientation="horizontal" />
                <CardIconSelector type={cardType} />
              </Flex>
            )}
          </Flex>

          <Divider
            style={{
              padding: '12px 0',
            }}
          />

          <Flex direction="row" alignItems="center" justifyContent="space-between">
            <Typography.BodySmall weight="400" color={mode('var(--ink70)', 'var(--chalk44)')}>
              {i18n.nft_checkout.send_to.toString()}
            </Typography.BodySmall>
            <SendTo />
          </Flex>
        </Flex>

        <Spacer size={32} orientation="vertical" />

        <Button onClick={handleBuyNow} variant="black">
          <Typography.BodyMedium weight="600">{i18n.nft_checkout.buy_now.toString()}</Typography.BodyMedium>
        </Button>
      </Flex.Column>
    </>
  );
};
