import { FUNDING, PayPalButtons } from '@paypal/react-paypal-js';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { Popover, PopoverContent, PopoverTrigger } from '~/features/native-methods/ui/popover/popover';
import { IconButton } from '~/features/native-methods/ui/icon-button/icon-button';
import { UserIcon } from '~/features/native-methods/ui/icons/user-icon';
import { Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import { SendingTo } from '../../components/SendingTo';
import { useTokenInfo } from '../../hooks/use-token-info';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';
import { useForm } from 'react-hook-form';
import { formatEther } from 'ethers/lib/utils';
import { ethers } from 'ethers';
import { NFTImage } from '~/features/native-methods/components/nft-image/nft-image';
import { DotIcon } from '~/features/native-methods/ui/icons/dot-icon';
import { i18n } from '~/app/libs/i18n';
import styles from './nft-checkout-home-page.less';
import { NFTService } from '~/app/services/nft/nft-service';
import { useNFTPaypalCheckoutState } from '../../hooks/use-nft-paypal-checkout-state';
import { Button } from '~/features/native-methods/ui/button/button';
import { CreditCardOutlineIcon } from '~/features/native-methods/ui/icons/CreditCardOutlineIcon';
import { SpinnerIcon } from '~/features/native-methods/ui/icons/SpinnerIcon';
import { useNFTCheckoutState } from '../../hooks/use-nft-checkout-state';
import { wait } from '~/shared/libs/wait';
import { formatReadableEther } from '~/features/native-methods/utils/format-readable-ether';
import { NFT_CHECKOUT_TYPES, useNFTCheckoutType } from '../../hooks/use-nft-checkout-type';
import { formatReadablePrice } from '~/features/native-methods/utils/format-readable-price';
import { useBalanceForEVM } from '~/features/native-methods/hooks/use-balance-for-evm';
import { NFT_ERROR_TYPES, useNFTError } from '~/features/native-methods/hooks/use-nft-error';
import { MotionContainer } from '~/features/native-methods/components/motion-container/motion-container';
import { InsufficientFundsModal } from '../../components/insufficient-funds-modal';
import { PaypalPending } from '../../components/paypal-pending';
import { PreloadPaypalLogo } from '../../components/preload-paypal-button';

export const NFTCheckoutHomePage = () => {
  const { mode } = useThemeMode();
  const { email, address } = useUserMetadata();
  const { navigateTo } = useControllerContext();
  const { chainInfo } = useChainInfo();

  const { setNFTCheckoutType } = useNFTCheckoutType();
  const { nftCheckoutState } = useNFTCheckoutState();
  const { setErrorType } = useNFTError();

  const [isOpen, setIsOpen] = useState(false);
  const [isPaypalPending, setIsPaypalPending] = useState(false);
  const { updateNFTPaypalCheckoutState } = useNFTPaypalCheckoutState();

  const { balance } = useBalanceForEVM({ address });
  const { tokenInfo } = useTokenInfo();

  const isCryptoCheckoutEnabled = useMemo(() => {
    return tokenInfo.isCryptoMintable && nftCheckoutState.isCryptoCheckoutEnabled;
  }, [tokenInfo]);

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    mode: 'onChange',
  });

  const handleBuyInCrypto = handleSubmit(() => {
    const etherBalance = formatEther(ethers.BigNumber.from(balance));

    if (Number(etherBalance) < Number(tokenInfo.price)) {
      // insufficient funds
      setIsOpen(true);
      return;
    }

    navigateTo('nft-checkout-crypto');
  });

  const handleClickCreditOrDebit = useCallback(() => {
    navigateTo('nft-checkout-card-form');
  }, []);

  const handleloseModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    setNFTCheckoutType(NFT_CHECKOUT_TYPES.PAYPAL);
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
          <>
            <Flex direction="column" alignItems="center">
              <Typography.BodySmall weight="400" color="var(--ink70)">
                Checkout
              </Typography.BodySmall>
            </Flex>
            <SendingTo />
          </>
        }
      />
      <InsufficientFundsModal isOpen={isOpen} onClose={handleloseModal} minimumBalance={tokenInfo.price.toString()} />
      <MotionContainer>
        <Spacer size={90} orientation="vertical" />
        {isPaypalPending ? (
          <PaypalPending
            key="pending"
            style={{
              position: 'absolute',
              zIndex: 999999,
              left: 0,
              top: 48,
              backgroundColor: mode('var(--white)', '#323233'),
            }}
          />
        ) : (
          <div>
            <Flex.Row
              alignItems="center"
              style={{
                height: '88px',
                gap: '24px',
              }}
            >
              <NFTImage
                size={80}
                src={nftCheckoutState.imageUrl}
                alt={nftCheckoutState.name}
                quantity={nftCheckoutState.quantity}
              />
              <Flex
                direction="column"
                alignItems="flex-start"
                justifyContent="center"
                style={{
                  gap: '12px',
                }}
              >
                <Typography.H4
                  color={mode('var(--ink100)', 'var(--white)')}
                  style={{
                    textAlign: 'left',
                  }}
                >
                  {nftCheckoutState?.name}
                </Typography.H4>
                {tokenInfo && (
                  <Flex.Column style={{ gap: '4px' }}>
                    <Flex.Row alignItems="center" style={{ gap: '8px' }}>
                      <Typography.BodyMedium weight="500" color={mode('var(--ink100)', 'var(--white)')}>
                        {`${formatReadablePrice({
                          price: tokenInfo.priceInUSD * nftCheckoutState.quantity,
                        })}`}
                      </Typography.BodyMedium>
                      <DotIcon />
                      <Typography.BodyMedium weight="500" color={mode('var(--ink100)', 'var(--white)')}>
                        {`${formatReadableEther({
                          ether: tokenInfo.price,
                          quantity: nftCheckoutState.quantity,
                        })} ${chainInfo.currency}`}
                      </Typography.BodyMedium>
                    </Flex.Row>
                    <Typography.BodySmall weight="400" color={mode('var(--ink70)', 'var(--chalk72)')}>
                      {i18n.nft_checkout.usd_price_includes_all_fees.toString()}
                    </Typography.BodySmall>
                  </Flex.Column>
                )}
              </Flex>
            </Flex.Row>
            <Spacer size={40} orientation="vertical" />
          </div>
        )}
        <Flex
          direction="column"
          justifyContent="flex-end"
          style={{ gap: '16px', height: isPaypalPending ? '100px' : isCryptoCheckoutEnabled ? '180px' : '120px' }}
        >
          <div
            style={{
              position: 'relative',
              height: '48px',
              width: '100%',
            }}
          >
            <PreloadPaypalLogo />
            <PayPalButtons
              className={styles.paypalContainer}
              fundingSource={FUNDING.PAYPAL}
              style={{
                shape: 'pill',
                tagline: false,
                height: 48,
                layout: 'horizontal',
              }}
              onShippingChange={(data, actions) => {
                // if not needed do nothing..
                return actions.resolve();
              }}
              onError={e => {
                if (e?.message === 'Not enough available tokens') {
                  setErrorType(NFT_ERROR_TYPES.SOLD_OUT);
                  navigateTo('nft-checkout-error');
                } else if (e?.message === 'Detected popup close') {
                } else {
                  setErrorType('payment-failed');
                  navigateTo('nft-checkout-error');
                }
              }}
              createOrder={async () => {
                setIsPaypalPending(true);

                const { error, data } = await NFTService.createPaypalOrder({
                  contractId: nftCheckoutState.contractId,
                  toAddress: nftCheckoutState.walletAddress,
                  tokenId: nftCheckoutState.tokenId,
                  quantity: nftCheckoutState.quantity.toString(),
                });

                if (error || !data) {
                  throw new Error(error ?? 'Error creating order');
                }

                return data.paymentProviderOrderId;
              }}
              onApprove={async data => {
                updateNFTPaypalCheckoutState({
                  orderId: data.orderID,
                });
                await wait(1600);
                navigateTo('nft-checkout-paypal');
              }}
              onCancel={() => {
                setIsPaypalPending(false);
              }}
            />
          </div>
          <Button
            onClick={handleClickCreditOrDebit}
            variant="black"
            style={{
              position: 'relative',
              maxHeight: '48px',
              zIndex: 13,
            }}
          >
            <CreditCardOutlineIcon
              style={{
                position: 'absolute',
                left: 20,
              }}
            />
            <Typography.BodyMedium weight="600">Credit or Debit</Typography.BodyMedium>
          </Button>
          {isCryptoCheckoutEnabled && (
            <Button
              onClick={handleBuyInCrypto}
              variant="neutral"
              style={{
                position: 'relative',
                maxHeight: '48px',
                zIndex: 10,
                backgroundColor: mode('var(--ink20)', 'var(--slate40)'),
              }}
            >
              {isSubmitting ? (
                <SpinnerIcon
                  style={{
                    position: 'absolute',
                    left: 20,
                    width: '24px',
                    height: '24px',
                  }}
                />
              ) : (
                <Icon
                  type={chainInfo.tokenIcon}
                  size={20}
                  style={{
                    position: 'absolute',
                    left: 20,
                    filter: `invert(${mode('0', chainInfo.currency === 'ETH' ? '100%' : '0')})`,
                  }}
                />
              )}
              <Typography.BodyMedium weight="600">{chainInfo.name}</Typography.BodyMedium>
            </Button>
          )}
        </Flex>
      </MotionContainer>
    </>
  );
};
