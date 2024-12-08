import React, { useCallback, useMemo } from 'react';
import { Flex, HoverActivatedTooltip, Icon, Spacer, Typography } from '@magiclabs/ui';
import { Nft } from 'alchemy-sdk';
import { useForm } from 'react-hook-form';

import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { getNftAltTag } from '~/features/connect-with-ui/utils/get-nft-alt-tag';
import { ChevronRightIcon } from '~/features/native-methods/ui/icons/ChevronRightIcon';
import { HelpIcon } from '~/features/native-methods/ui/icons/HelpIcon';
import { truncateTitle } from '~/features/native-methods/utils/truncate-title';
import { Ethereum } from '~/shared/svg/magic-connect';
import { CountBadge } from './CountBadge';
import { CheckIcon } from '~/features/native-methods/ui/icons/CheckIcon';
import { Button } from '~/features/native-methods/ui/button/button';
import { NFTImage } from '~/features/native-methods/components/nft-image/nft-image';
import { shortenWalletAddress } from '~/features/native-methods/utils/shorten-wallet-address';
import { GradientCircle } from '~/features/native-methods/components/gradient-circle/gradient-circle';
import { Divider } from '~/features/native-methods/ui/divider/divider';
import { useLinkToWallet } from '~/features/blockchain-ui-methods/hooks/use-link-to-wallet';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';
import { useTokenPrice } from '~/features/blockchain-ui-methods/hooks/use-token-price';
import { useBalanceForEVM } from '~/features/native-methods/hooks/use-balance-for-evm';
import { formatReadablePrice } from '~/features/native-methods/utils/format-readable-price';
import { formatReadableEther } from '~/features/native-methods/utils/format-readable-ether';
import { formatEther } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';

type Props = {
  address: string;
  toAddress: string;
  nft: Nft;
  quantity: number;
  estimatedGasFee: BigNumber;
  onSuccess: () => void;
  onCancel?: () => void;
};

export const NFTTransferForm = ({ address, toAddress, nft, quantity, estimatedGasFee, onSuccess, onCancel }: Props) => {
  const { mode } = useThemeMode();
  const { chainInfo } = useChainInfo();
  const { linkToWallet } = useLinkToWallet();
  const { balance } = useBalanceForEVM({ address });
  const { tokenPrice } = useTokenPrice();

  const {
    handleSubmit,
    formState: { isSubmitSuccessful, isSubmitting },
  } = useForm<FormData>();

  const priceInUSD = useMemo(() => {
    if (!tokenPrice) {
      return 0;
    }

    return Number(formatEther(estimatedGasFee)) * Number(tokenPrice);
  }, [estimatedGasFee, tokenPrice]);

  const isInsufficient = useMemo(() => {
    if (!estimatedGasFee || !balance) {
      return false;
    }
    return estimatedGasFee.gt(balance);
  }, [balance, estimatedGasFee, tokenPrice]);

  const handleLinkToWallet = useCallback(() => {
    linkToWallet(toAddress);
  }, [toAddress]);

  return (
    <Flex.Column alignItems="center" style={{ marginTop: '32px' }}>
      <Flex.Row style={{ position: 'relative' }}>
        <NFTImage size={96} alt={getNftAltTag(nft)} src={nft.image.cachedUrl ?? nft.image.originalUrl} />
        {quantity > 1 && (
          <CountBadge
            count={quantity}
            style={{
              position: 'absolute',
              bottom: '-12px',
              right: '-8px',
              padding: '4px 6px',
            }}
          />
        )}
      </Flex.Row>

      <Spacer size={24} orientation="vertical" />

      <Typography.H4
        weight="700"
        color={mode('var(--ink100)', 'var(--white)')}
        style={{
          textAlign: 'center',
          wordBreak: 'break-word',
        }}
      >
        {truncateTitle(nft?.name ?? '(Untitled)')}
      </Typography.H4>

      <Spacer size={24} orientation="vertical" />

      <Flex
        direction="column"
        style={{
          width: '100%',
        }}
      >
        <Flex direction="row" alignItems="center" justifyContent="space-between">
          <Typography.BodySmall weight="500" color={mode('var(--ink100)', 'white')}>
            Send To
          </Typography.BodySmall>
          {toAddress && (
            <Flex.Row
              alignItems="center"
              style={{
                gap: '8px',
              }}
            >
              <Typography.BodySmall
                weight="400"
                color={mode('var(--ink100)', 'var(--white)')}
                onClick={handleLinkToWallet}
                style={{
                  cursor: 'pointer',
                }}
              >
                {shortenWalletAddress(toAddress)}
              </Typography.BodySmall>
              <GradientCircle walletAddress={toAddress} />
            </Flex.Row>
          )}
        </Flex>

        <Divider
          style={{
            padding: '12px 0',
          }}
        />

        <Flex direction="row" alignItems="center" justifyContent="space-between">
          <Typography.BodySmall weight="500" color={mode('var(--ink100)', 'white')}>
            Network
          </Typography.BodySmall>
          <Flex.Row alignItems="center" style={{ gap: '8px' }}>
            <Typography.BodySmall
              weight="400"
              color={chainInfo.isMainnet ? mode('var(--ink100)', 'var(--white)') : mode('#a36b14', '#FFD594')}
            >
              {chainInfo?.networkName}
            </Typography.BodySmall>
            <Icon type={chainInfo?.tokenIcon ?? Ethereum} size={24} />
          </Flex.Row>
        </Flex>

        <Divider
          style={{
            padding: '12px 0',
          }}
        />

        <Flex direction="row" alignItems="center" justifyContent="space-between">
          <Flex.Row alignItems="center" style={{ gap: '8px' }}>
            <Typography.BodySmall weight="500" color={mode('var(--ink100)', 'white')}>
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

          <Flex.Row alignItems="center" style={{ gap: '12px' }}>
            <Typography.BodySmall weight="400" color={mode('var(--ink70)', 'var(--chalk44)')}>
              {formatReadableEther({
                ether: estimatedGasFee,
              })}{' '}
              {chainInfo.currency}
            </Typography.BodySmall>
            <Typography.BodySmall weight="400" color={mode('var(--ink100)', 'white')}>
              {formatReadablePrice({
                price: priceInUSD,
              })}
            </Typography.BodySmall>
          </Flex.Row>
        </Flex>
      </Flex>

      <Spacer size={32} orientation="vertical" />

      {isInsufficient && (
        <Flex.Row
          alignItems="center"
          style={{
            gap: '12px',
            backgroundColor: mode('var(--gold10)', 'var(--dark-gold8)'),
            padding: '8px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
          }}
        >
          <Typography.BodySmall color={mode('var(--gold90)', 'var(--dark-gold100)')} weight="400">
            Insufficient funds. Please add at least{' '}
            <b>
              {formatReadableEther({
                ether: estimatedGasFee,
              })}{' '}
              {chainInfo.currency}
            </b>{' '}
            to continue.
          </Typography.BodySmall>
          <ChevronRightIcon color={mode('var(--gold90)', 'var(--dark-gold100)')} size={24} />
        </Flex.Row>
      )}

      <Spacer size={16} orientation="vertical" />

      <form
        onSubmit={handleSubmit(onSuccess)}
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          gap: '16px',
        }}
      >
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="neutral" disabled={isSubmitting || isSubmitSuccessful}>
            <Typography.BodyMedium>Cancel</Typography.BodyMedium>
          </Button>
        )}
        {isSubmitSuccessful ? (
          <Button type="button" disabled>
            <CheckIcon size={20} />
          </Button>
        ) : (
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitSuccessful || isSubmitting || isInsufficient}
            loading={isSubmitting}
          >
            <Typography.BodyMedium>Send</Typography.BodyMedium>
          </Button>
        )}
      </form>
    </Flex.Column>
  );
};
