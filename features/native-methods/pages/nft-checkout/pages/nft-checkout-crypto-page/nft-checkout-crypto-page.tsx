import React, { Suspense, useEffect, useMemo } from 'react';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { Flex, HoverActivatedTooltip, Spacer, Typography } from '@magiclabs/ui';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { useForm } from 'react-hook-form';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { i18n } from '~/app/libs/i18n';
import { NFTImage } from '~/features/native-methods/components/nft-image/nft-image';
import { Divider } from '~/features/native-methods/ui/divider/divider';
import { Button } from '~/features/native-methods/ui/button/button';
import { useNFTCryptoCheckoutState } from '../../hooks/use-nft-crypto-checkout-state';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';
import { useEstimatedGasFeeForMinting } from '../../hooks/use-estimated-gas-for-minting';
import { formatReadableEther } from '~/features/native-methods/utils/format-readable-ether';
import { formatReadablePrice } from '~/features/native-methods/utils/format-readable-price';
import { NFT_CHECKOUT_TYPES, useNFTCheckoutType } from '../../hooks/use-nft-checkout-type';
import { useTokenInfo } from '../../hooks/use-token-info';
import { useNFTCheckoutState } from '../../hooks/use-nft-checkout-state';
import { useMintNFTForEVM } from '../../hooks/use-mint-nft-for-evm';
import { BigNumber } from 'ethers';
import { formatEther, parseEther } from 'ethers/lib/utils';
import { NFT_ERROR_TYPES, useNFTError } from '~/features/native-methods/hooks/use-nft-error';
import { wait } from '~/shared/libs/wait';
import { MotionLoading } from '~/features/native-methods/components/motion-loading/motion-loading';
import { MotionContainer } from '~/features/native-methods/components/motion-container/motion-container';
import { HelpIcon } from '~/features/native-methods/ui/icons/HelpIcon';

const Resolved = () => {
  const { navigateTo } = useControllerContext();
  const { chainInfo } = useChainInfo();
  const { address } = useUserMetadata();
  const { mode } = useThemeMode();
  const { tokenInfo } = useTokenInfo();
  const { nftCheckoutState } = useNFTCheckoutState();
  const { setNFTCryptoCheckoutState } = useNFTCryptoCheckoutState();
  const { mintNFTForEVM } = useMintNFTForEVM();
  const { setNFTCheckoutType } = useNFTCheckoutType();
  const { setErrorType } = useNFTError();

  const { estimatedGasFee } = useEstimatedGasFeeForMinting({
    contractAddress: tokenInfo.contractAddress,
    tokenId: tokenInfo.tokenId,
    tokenType: tokenInfo.tokenType,
    quantity: nftCheckoutState.quantity,
    value: (Number(tokenInfo.price) * nftCheckoutState.quantity).toString(),
  });

  const prices = useMemo(() => {
    const priceInNativeToken = parseEther(tokenInfo.price).mul(nftCheckoutState.quantity);

    const estimatedGasFeeInNativeToken = BigNumber.from(estimatedGasFee ?? '0');
    const estimatedGasFeeInUSD = Number(formatEther(estimatedGasFee)) * tokenInfo.usdRate;

    const totalInNativeToken = priceInNativeToken.add(estimatedGasFeeInNativeToken);
    const totalInUSD = tokenInfo.priceInUSD * nftCheckoutState.quantity + estimatedGasFeeInUSD;

    return {
      priceInNativeToken: formatReadableEther({
        ether: priceInNativeToken,
      }),
      priceInUSD: formatReadablePrice({
        price: tokenInfo.priceInUSD * nftCheckoutState.quantity,
      }),
      estimatedGasFeeInNativeToken: formatReadableEther({
        ether: estimatedGasFeeInNativeToken,
      }),
      estimatedGasFeeInUSD: formatReadablePrice({
        price: estimatedGasFeeInUSD,
      }),
      totalInNativeToken: formatReadableEther({
        ether: totalInNativeToken,
      }),
      totalInUSD: formatReadablePrice({
        price: totalInUSD,
      }),
    };
  }, [tokenInfo, estimatedGasFee]);

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({
    mode: 'onSubmit',
  });

  const onSubmit = handleSubmit(async () => {
    try {
      const response = await mintNFTForEVM({
        contractAddress: tokenInfo.contractAddress,
        tokenType: tokenInfo.tokenType,
        tokenId: tokenInfo.tokenId,
        quantity: nftCheckoutState.quantity,
        toAddress: address,
        value: (Number(tokenInfo.price) * nftCheckoutState.quantity).toString(),
      });

      setNFTCryptoCheckoutState({ txHash: response.txHash });
      await wait(300);
      navigateTo('nft-checkout-confirmed');
    } catch (e) {
      const error = e as { code?: string };
      setErrorType(error.code ? error.code : NFT_ERROR_TYPES.SOMETHING_WENT_WRONG);
      navigateTo('nft-checkout-error');
    }
  });

  useEffect(() => {
    setNFTCheckoutType(NFT_CHECKOUT_TYPES.CRYPTO);
  }, []);

  return (
    <MotionContainer style={{ alignItems: 'center' }}>
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

      <div
        style={{
          display: 'grid',
          rowGap: '12px',
          columnGap: '16px',
          gridTemplateColumns: 'auto 1fr auto',
          width: '100%',
        }}
      >
        <Typography.BodySmall weight="500" style={{ textAlign: 'left' }} color={mode('var(--ink100)', 'white')}>
          {i18n.nft_checkout.quantity.toString()}
        </Typography.BodySmall>
        <div />
        <Typography.BodySmall weight="400" color={mode('var(--ink100)', 'var(--white)')} style={{ textAlign: 'right' }}>
          {nftCheckoutState.quantity}
        </Typography.BodySmall>
        <Typography.BodySmall weight="500" style={{ textAlign: 'left' }}>
          {i18n.nft_checkout.total.toString()}
        </Typography.BodySmall>
        <Typography.BodySmall
          weight="400"
          style={{ textAlign: 'right' }}
          color={mode('var(--ink70)', 'var(--chalk72)')}
        >
          {prices.priceInNativeToken} {chainInfo.currency}
        </Typography.BodySmall>

        <Typography.BodySmall weight="400" style={{ textAlign: 'right' }} color={mode('var(--ink100)', 'white')}>
          {prices.priceInUSD}
        </Typography.BodySmall>

        <Flex.Row alignItems="center" style={{ gap: '8px' }}>
          <Typography.BodySmall
            weight="500"
            color={mode('var(--ink100)', 'var(--chalk44)')}
            style={{ textAlign: 'left' }}
          >
            Network fee
          </Typography.BodySmall>
          <HoverActivatedTooltip placement="top" style={{ display: 'inline-flex' }} appearance="none">
            <HoverActivatedTooltip.Anchor>
              <HelpIcon size={16} color="var(--ink50)" />
            </HoverActivatedTooltip.Anchor>
            <HoverActivatedTooltip.Content
              style={{
                width: '248px',
                padding: '8px 12px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, .1)',
              }}
            >
              <Typography.BodySmall weight="400" color="var(--ink70)">
                This processing fee applies to all blockchain transactions. Prices vary based on network traffic.
              </Typography.BodySmall>
            </HoverActivatedTooltip.Content>
          </HoverActivatedTooltip>
        </Flex.Row>
        <Typography.BodySmall
          weight="400"
          style={{ textAlign: 'right' }}
          color={mode('var(--ink70)', 'var(--chalk72)')}
        >
          {prices.estimatedGasFeeInNativeToken} {chainInfo.currency}
        </Typography.BodySmall>

        <Typography.BodySmall weight="400" style={{ textAlign: 'right' }} color={mode('var(--ink100)', 'white')}>
          {prices.estimatedGasFeeInUSD}
        </Typography.BodySmall>
      </div>

      <Divider
        style={{
          width: '100%',
          padding: '12px 0',
        }}
      />

      <div
        style={{
          display: 'grid',
          rowGap: '12px',
          columnGap: '16px',
          gridTemplateColumns: 'auto 1fr auto',
          width: '100%',
        }}
      >
        <Typography.BodySmall weight="500" style={{ textAlign: 'left' }}>
          Total
        </Typography.BodySmall>
        <Typography.BodySmall
          weight="400"
          style={{ textAlign: 'right' }}
          color={mode('var(--ink70)', 'var(--chalk72)')}
        >
          {prices.totalInNativeToken} {chainInfo.currency}
        </Typography.BodySmall>

        <Typography.BodySmall
          weight="700"
          style={{ textAlign: 'right', color: mode('black', 'whtie') }}
          color={mode('var(--ink70)', 'var(--chalk72)')}
        >
          {prices.totalInUSD}
        </Typography.BodySmall>
      </div>
      <Spacer size={32} orientation="vertical" />

      <Button onClick={onSubmit} variant="black" loading={isSubmitting} disabled={isSubmitting}>
        <Typography.BodyMedium weight="600">{i18n.nft_checkout.buy_now.toString()}</Typography.BodyMedium>
      </Button>
    </MotionContainer>
  );
};

export const NFTCheckoutCryptoPage = () => {
  const { navigateBackToPrevPage } = useControllerContext();

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
      <Suspense fallback={<MotionLoading key="crypto-suspense-loading" />}>
        <Resolved />
      </Suspense>
    </>
  );
};
