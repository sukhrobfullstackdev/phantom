import React, { useMemo } from 'react';
import { Flex, HoverActivatedTooltip, Icon, Spacer, Typography } from '@magiclabs/ui';

import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { Ethereum } from '~/shared/svg/magic-connect';
import { HelpIcon } from '~/features/native-methods/ui/icons/HelpIcon';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { SpinnerIcon } from '~/features/native-methods/ui/icons/SpinnerIcon';
import { Divider } from '~/features/native-methods/ui/divider/divider';
import { GradientCircle } from '~/features/native-methods/components/gradient-circle/gradient-circle';
import { shortenWalletAddress } from '~/features/native-methods/utils/shorten-wallet-address';
import { useLinkToWallet } from '~/features/blockchain-ui-methods/hooks/use-link-to-wallet';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';
import { useTokenPrice } from '~/features/blockchain-ui-methods/hooks/use-token-price';
import { BigNumber } from 'ethers';
import { formatReadableEther } from '~/features/native-methods/utils/format-readable-ether';
import { formatReadablePrice } from '~/features/native-methods/utils/format-readable-price';
import { formatEther } from 'ethers/lib/utils';

type Props = {
  toAddress?: string;
  estimatedGasFee?: BigNumber;
};

export const ConfirmTransactionDetails = ({ toAddress, estimatedGasFee }: Props) => {
  const { mode } = useThemeMode();
  const { theme } = useTheme();
  const { linkToWallet } = useLinkToWallet();
  const { chainInfo } = useChainInfo();
  const { tokenPrice, isLoading: isPriceLoading } = useTokenPrice();

  const priceInUSD = useMemo(() => {
    if (!tokenPrice || !estimatedGasFee) {
      return 0;
    }

    return Number(formatEther(estimatedGasFee)) * Number(tokenPrice);
  }, [estimatedGasFee, tokenPrice]);

  return (
    <>
      <Typography.H4
        weight="700"
        color={mode('var(--ink100)', 'var(--white)')}
        style={{
          textAlign: 'center',
          wordBreak: 'break-word',
        }}
      >
        Confirm transaction?
      </Typography.H4>

      <Spacer size={24} orientation="vertical" />

      <Flex
        direction="column"
        style={{
          width: '100%',
        }}
      >
        {toAddress && (
          <>
            <Flex direction="row" alignItems="center" justifyContent="space-between">
              <Typography.BodySmall weight="500" color={mode('var(--ink100)', 'var(--chalk44)')}>
                Send To
              </Typography.BodySmall>
              <Flex.Row
                alignItems="center"
                style={{
                  gap: '8px',
                }}
              >
                <Typography.BodySmall
                  weight="400"
                  color={mode('var(--ink100)', 'var(--white)')}
                  onClick={() => linkToWallet(toAddress)}
                  style={{
                    cursor: 'pointer',
                  }}
                >
                  {shortenWalletAddress(toAddress)}
                </Typography.BodySmall>
                <GradientCircle walletAddress={toAddress} />
              </Flex.Row>
            </Flex>

            <Divider
              style={{
                padding: '12px 0',
              }}
            />
          </>
        )}

        <Flex direction="row" alignItems="center" justifyContent="space-between">
          <Typography.BodySmall weight="500" color={mode('var(--ink100)', 'var(--chalk44)')}>
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
            <Typography.BodySmall weight="500" color={mode('var(--ink100)', 'var(--chalk44)')}>
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
                  {estimatedGasFee
                    ? 'This processing fee applies to all blockchain transactions. Prices vary based on network traffic.'
                    : `${theme.appName} is paying the network fee for this transaction`}
                </Typography.BodySmall>
              </HoverActivatedTooltip.Content>
            </HoverActivatedTooltip>
          </Flex.Row>
          {estimatedGasFee && estimatedGasFee.gt(0) ? (
            <>
              {isPriceLoading && <SpinnerIcon size={20} />}
              {!isPriceLoading && (
                <Flex.Row alignItems="center" style={{ gap: '12px' }}>
                  <Typography.BodySmall weight="400" color={mode('var(--ink70)', 'var(--chalk44)')}>
                    {formatReadableEther({
                      ether: estimatedGasFee,
                      fixed: 6,
                    })}{' '}
                    MATIC
                  </Typography.BodySmall>
                  <Typography.BodySmall weight="400" color={mode('var(--ink100)', 'var(--chalk44)')}>
                    {formatReadablePrice({
                      price: priceInUSD,
                    })}
                  </Typography.BodySmall>
                </Flex.Row>
              )}
            </>
          ) : (
            <Flex.Row alignItems="center" style={{ gap: '12px' }}>
              <Typography.BodySmall weight="400" color={mode('var(--ink100)', 'var(--chalk44)')}>
                $0.00
              </Typography.BodySmall>
            </Flex.Row>
          )}
        </Flex>
      </Flex>
    </>
  );
};
