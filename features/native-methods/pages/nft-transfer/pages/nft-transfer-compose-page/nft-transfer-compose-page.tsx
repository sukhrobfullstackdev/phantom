import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import { useForm } from 'react-hook-form';
import { vestResolver } from '@hookform/resolvers/vest';
import { create, enforce, test } from 'vest';
import { ethers } from 'ethers';

import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { getNftAltTag } from '~/features/connect-with-ui/utils/get-nft-alt-tag';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { truncateTitle } from '~/features/native-methods/utils/truncate-title';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { useOwnedNFT } from '~/features/native-methods/hooks/useOwnedNFT';
import { getReferrer } from '~/app/libs/get-referrer';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { AnalyticsActionType, trackAction } from '~/app/libs/analytics';
import { InsufficientBalanceModal } from './components/InsufficientBalanceModal';
import { Button } from '~/features/native-methods/ui/button/button';
import { usePrimaryColor } from '~/features/native-methods/hooks/usePrimaryColor';
import { TextField } from '~/features/native-methods/ui/text-filed/text-filed';
import { TextArea } from '~/features/native-methods/ui/text-area/text-area';
import { NFTImage } from '~/features/native-methods/components/nft-image/nft-image';
import { IconButton } from '~/features/native-methods/ui/icon-button/icon-button';
import { WalletIcon } from '~/features/native-methods/ui/icons/wallet-icon';
import { store } from '~/app/store';
import { useConfirmNFTTransfer } from '../../hooks/use-confirm-nft-transfer';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';
import { useTransferNFTForEVM } from '../../hooks/use-transfer-nft-for-evm';
import { MAGIC_WALLET_DAPP_REFERRER } from '~/shared/constants/env';
import { useBalanceForEVM } from '~/features/native-methods/hooks/use-balance-for-evm';
import { useEstimatedGasFeeForNFTTransfer } from '../../hooks/use-estimated-gas-fee-for-nft-transfer';
import { formatReadableEther } from '~/features/native-methods/utils/format-readable-ether';
import { useNFTTransferState } from '../../hooks/use-nft-trasnfer-state';
import { wait } from '~/shared/libs/wait';
import { MotionLoading } from '~/features/native-methods/components/motion-loading/motion-loading';
import { MotionContainer } from '~/features/native-methods/components/motion-container/motion-container';
import { MAGIC_METHODS, useMagicMethodRouter } from '~/features/native-methods/hooks/use-magic-method-router';
import { isEmpty } from '~/app/libs/lodash-utils';

type FormData = {
  toAddress: string;
  quantity: number;
  balance: number;
  network: string;
};

const validationSuite = create(({ toAddress, quantity, balance, network }: FormData) => {
  test('toAddress', 'toAddress should be a string', () => {
    enforce(toAddress).isString();
  });

  test('toAddress', `Invalid wallet. Please enter a valid 42-character ${network} wallet address (0x...).`, () => {
    enforce(toAddress).matches(/0x[a-fA-F0-9]{40}/);
  });

  test('toAddress', `Invalid wallet. Pleae enter a valid 42-character ${network} wallet address (0x...).`, () => {
    ethers.utils.getAddress(toAddress);
  });

  test('quantity', `Quantity must be between 1 and ${balance}`, () => {
    const numQuantity = Number(quantity);
    enforce(numQuantity).greaterThan(0);
  });

  test('quantity', `Quantity must be between 1 and ${balance}`, () => {
    const numQuantity = Number(quantity);
    enforce(numQuantity).lessThanOrEquals(balance);
  });
});

const Resolved = () => {
  const { navigateTo } = useControllerContext();
  const { mode } = useThemeMode();
  const { address, email } = useUserMetadata();

  const [isOpen, setIsOpen] = useState(false);
  const { primaryColor } = usePrimaryColor();
  const { chainInfo } = useChainInfo();
  const { transferNFTForEVM } = useTransferNFTForEVM();
  const { confirmNFTTransfer } = useConfirmNFTTransfer();

  const {
    nftTransferState: { contractAddress, tokenId, quantity: initialQuantity, toAddress: initialToAddress },
    setNFTTransferState,
  } = useNFTTransferState();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    mode: 'onBlur',
    resolver: vestResolver(validationSuite),
    defaultValues: {
      toAddress: initialToAddress,
      quantity: initialQuantity,
      balance: 1,
      network: chainInfo.name,
    },
  });

  const quantity = watch('quantity');

  const { ownedNFT } = useOwnedNFT({
    contractAddress,
    tokenId,
  });

  const { balance } = useBalanceForEVM({
    address,
  });

  const { estimatedGasFee } = useEstimatedGasFeeForNFTTransfer({
    contractAddress,
    tokenId,
    tokenType: ownedNFT.tokenType,
    toAddress: address,
    quantity: 1,
  });

  const isMultiple = useMemo(() => {
    return ownedNFT.tokenType === 'ERC1155' && Number(ownedNFT.balance) > 1;
  }, [ownedNFT]);

  const isInsufficient = useMemo(() => {
    if (!balance || !estimatedGasFee) {
      return false;
    }

    return estimatedGasFee.gt(balance);
  }, [balance, estimatedGasFee]);

  const onSubmit = handleSubmit(async (formData: FormData) => {
    debugger;
    trackAction(AnalyticsActionType.PreviewNFTTransferClicked, {
      toAddress: formData.toAddress,
      quantity: formData.quantity,
      tokenType: ownedNFT.tokenType,
    });

    const { appName } = store.getState().Theme.theme;

    setNFTTransferState(prev => ({
      ...prev,
      tokenType: ownedNFT.tokenType,
      quantity: formData.quantity,
      toAddress: formData.toAddress,
    }));

    try {
      if (getReferrer() === MAGIC_WALLET_DAPP_REFERRER) {
        await wait(300);
        navigateTo('nft-transfer-confirm');
        return;
      }

      const isConfirmed = await confirmNFTTransfer({
        transaction_type: 'nft-transfer',
        from: address,
        to: formData.toAddress,
        nft: {
          contract_address: contractAddress,
          token_id: tokenId,
          token_type: ownedNFT.tokenType,
          quantity: formData.quantity,
        },
        estimatedGasFee: estimatedGasFee.toString(),
        request_domain: getReferrer(),
        email,
        appName,
      });

      if (!isConfirmed) {
        return;
      }

      const response = await transferNFTForEVM({
        contractAddress,
        tokenType: ownedNFT.tokenType,
        tokenId,
        toAddress: formData.toAddress,
        quantity: formData.quantity,
      });

      setNFTTransferState(prev => ({
        ...prev,
        txHash: response.hash,
      }));
    } catch (e) {
      getLogger().error('Error with WalletNFTTransferComposePage: ', buildMessageContext(e));
      console.warn("Please allow popups from Magic's domain to continue.");
      return;
    }

    await wait(300);
    navigateTo('nft-transfer-pending');
    return;
  });

  const handleMax = useCallback(() => {
    clearErrors('quantity');
    setValue('quantity', Number(ownedNFT.balance));
  }, [ownedNFT]);

  const handleOnCloseModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isInsufficient) {
      setIsOpen(true);
    }
  }, [isInsufficient]);

  useEffect(() => {
    setValue('balance', Number(ownedNFT.balance));
  }, [ownedNFT]);

  return (
    <>
      {estimatedGasFee && (
        <InsufficientBalanceModal
          isOpen={isOpen}
          onClose={handleOnCloseModal}
          minimumBalance={formatReadableEther({
            ether: estimatedGasFee,
            fixed: 6,
          })}
        />
      )}

      <MotionContainer>
        <Spacer size={32} orientation="vertical" />
        <Flex.Row
          alignItems="center"
          justifyContent="space-between"
          style={{
            gap: '16px',
          }}
        >
          <Flex.Column alignItems="flex-start" style={{ padding: '8px 0', gap: '8px', flex: 1 }}>
            <Typography.BodySmall weight="500" color={mode('var(--ink100)', 'var(--white)')}>
              Collectible
            </Typography.BodySmall>
            <Typography.BodyMedium
              weight="400"
              color={mode('var(--ink100)', 'var(--white)')}
              style={{
                textAlign: 'left',
                wordBreak: 'break-word',
              }}
            >
              {!ownedNFT?.name || isEmpty(ownedNFT?.name) ? '(Untitled)' : truncateTitle(ownedNFT.name)}
            </Typography.BodyMedium>
          </Flex.Column>
          <NFTImage
            size={72}
            alt={getNftAltTag(ownedNFT)}
            src={ownedNFT.image.cachedUrl ?? ownedNFT.image.originalUrl}
            style={{
              borderRadius: '6px',
            }}
          />
        </Flex.Row>

        <Spacer size={24} orientation="vertical" />

        <form onSubmit={onSubmit}>
          <Flex.Column style={{ gap: '24px' }}>
            {isMultiple && (
              <TextField
                disabled={isSubmitting}
                type="number"
                label={
                  <Flex.Row
                    justifyContent="space-between"
                    alignItems="center"
                    style={{
                      width: '100%',
                    }}
                  >
                    <Typography.BodySmall weight="500" color={mode('var(--ink100)', 'var(--white)')}>
                      Quantity
                    </Typography.BodySmall>
                    <Typography.BodySmall weight="400" color={mode('var(--ink70)', 'var(--chalk72)')}>
                      {ownedNFT.balance} available
                    </Typography.BodySmall>
                  </Flex.Row>
                }
                rightIcon={
                  <button
                    disabled={quantity === Number(ownedNFT.balance)}
                    type="button"
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: quantity === Number(ownedNFT.balance) ? 'not-allowed' : 'pointer',
                    }}
                    onClick={handleMax}
                  >
                    <Typography.BodySmall
                      weight="600"
                      color={primaryColor}
                      style={{
                        opacity: quantity === Number(ownedNFT.balance) ? '0.3' : '1',
                      }}
                    >
                      Max
                    </Typography.BodySmall>
                  </button>
                }
                placeholder="Enter quantity"
                errorMessage={errors.quantity?.message}
                {...register('quantity', {
                  valueAsNumber: true,
                })}
              />
            )}
            <TextArea
              disabled={isSubmitting}
              label="Send to"
              rightIcon={<Icon aria-hidden type={chainInfo.blockchainIcon} size={24} opacity={0.5} />}
              placeholder={`Wallet address (${chainInfo.name})`}
              maxLength={42}
              errorMessage={errors.toAddress?.message}
              {...register('toAddress')}
            />
            <Button type="submit" disabled={isInsufficient || isSubmitting} loading={isSubmitting}>
              <Typography.BodyMedium>Preview transfer</Typography.BodyMedium>
            </Button>
          </Flex.Column>
          <Spacer size={16} orientation="vertical" />
          <Typography.BodySmall color="var(--ink70)" weight="400">
            For security purposes, a new tab from Magic will open for you to confirm this transaction.
          </Typography.BodySmall>
        </form>
      </MotionContainer>
    </>
  );
};

export const NFTTransferComposePage = () => {
  const { mode } = useThemeMode();
  const { push, back, hasPrevMethod } = useMagicMethodRouter();

  const handleBackToWallet = useCallback(
    () =>
      push({
        method: MAGIC_METHODS.MAGIC_WALLET,
        params: {},
      }),
    [],
  );

  const handleBack = useCallback(() => back(), []);

  return (
    <>
      <ModalHeader
        leftAction={
          hasPrevMethod ? (
            <BackActionButton onClick={handleBack} />
          ) : (
            <IconButton onClick={handleBackToWallet}>
              <WalletIcon size={16} color={mode('var(--ink40)', 'white')} />
            </IconButton>
          )
        }
        rightAction={<CancelActionButton />}
        header={
          <Typography.BodySmall color="var(--ink70)" weight="500">
            Send Collectible
          </Typography.BodySmall>
        }
      />

      <Suspense fallback={<MotionLoading key="nft-transfer-compose-suspense-loading" />}>
        <Resolved />
      </Suspense>
    </>
  );
};
