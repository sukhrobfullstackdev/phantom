import React, { useCallback } from 'react';
import { Flex, HoverActivatedTooltip, Icon, Spacer, Typography } from '@magiclabs/ui';
import { BigNumber as BN } from 'bignumber.js';
import { Divider } from '~/features/native-methods/ui/divider/divider';
import { Button } from '~/features/native-methods/ui/button/button';
import { useForm } from 'react-hook-form';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { HelpIcon } from '~/features/native-methods/ui/icons/HelpIcon';
import { parseInReadableEther } from '~/features/native-methods/utils/parse-to-readable-ether';
import { parseInReadablePrice } from '~/features/native-methods/utils/parse-to-readable-price';
import { usePrimaryColor } from '~/features/native-methods/hooks/usePrimaryColor';
import { FromAddressToAddress } from './from-address-to-address';
import { IMultiChainInfo } from '~/features/connect-with-ui/hooks/multiChainContext';

type SendTransactionFormProps = {
  // transaction info
  from: string;
  to: string;
  value: string;
  data?: string;
  // token info
  tokenPrice: BN.Value;
  networkFee?: BN.Value;
  // chain info
  chainInfo: IMultiChainInfo;
  // Stability only
  freeTransactionCount?: number;
  // form actions
  onSubmit: () => Promise<void> | void;
  onClose?: () => void;
};

export const StabilitySendTransactionForm = ({
  from,
  to,
  value,
  data,
  tokenPrice,
  networkFee = '0',
  chainInfo,
  freeTransactionCount,
  onSubmit,
  onClose,
}: SendTransactionFormProps) => {
  const { mode } = useThemeMode();
  const { primaryColor } = usePrimaryColor();

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, isSubmitSuccessful },
  } = useForm<FormData>({
    mode: 'onBlur',
  });

  const handleOnSubmit = async () => {
    try {
      await onSubmit();
    } catch (e) {
      reset();
      throw e;
    }
  };

  const linkToWallet = useCallback(
    (address: string) => {
      window.open(`${chainInfo.blockExplorer}/address/${address}`, '_blank');
    },
    [chainInfo],
  );

  return (
    <Flex.Column alignItems="center" style={{ width: '100%' }}>
      <Icon size={48} type={chainInfo.tokenIcon} />
      <Spacer size={16} orientation="vertical" />
      {new BN(networkFee).gt(0) ? (
        <Typography.H2>
          {parseInReadablePrice({
            amount: value,
            price: tokenPrice,
          })}
        </Typography.H2>
      ) : (
        <>
          <Typography.H2 color={primaryColor}>Free Transaction!</Typography.H2>
          {freeTransactionCount && (
            <>
              <Typography.BodyMedium color={mode('var(--ink100)', 'var(--chalk44)')}>
                Free Transaction Count: {freeTransactionCount}
              </Typography.BodyMedium>
              <Spacer size={16} orientation="vertical" />
            </>
          )}
        </>
      )}
      <Spacer size={8} orientation="vertical" />
      <FromAddressToAddress from={from} to={to} linkToWallet={linkToWallet} />
      <Spacer size={32} orientation="vertical" />
      <Flex.Column style={{ width: '100%', gap: '16px' }}>
        {new BN(networkFee).gt(0) && (
          <>
            <Flex.Row justifyContent="space-between" alignItems="center">
              <Typography.BodySmall>Amount</Typography.BodySmall>
              <Flex.Row
                alignItems="center"
                style={{
                  gap: '8px',
                }}
              >
                <Typography.BodySmall>
                  {parseInReadableEther({ amount: value })} {chainInfo.currency}
                </Typography.BodySmall>
                <Typography.BodySmall>
                  {parseInReadablePrice({
                    amount: value,
                    price: tokenPrice,
                  })}
                </Typography.BodySmall>
              </Flex.Row>
            </Flex.Row>
            <Flex.Row justifyContent="space-between" alignItems="center">
              <Flex.Row alignItems="center" style={{ gap: '8px' }}>
                <Typography.BodySmall>Network fee</Typography.BodySmall>
                <HoverActivatedTooltip placement="top" style={{ display: 'inline-flex' }} appearance="none">
                  <HoverActivatedTooltip.Anchor>
                    <HelpIcon size={16} color="var(--ink50)" />
                  </HoverActivatedTooltip.Anchor>
                  <HoverActivatedTooltip.Content
                    style={{
                      width: '248px',
                      padding: '8px 12px',
                      borderRadius: '12px',
                      boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.10)',
                      backgroundColor: mode('white', 'black'),
                    }}
                  >
                    <Typography.BodySmall weight="400" color="var(--ink70)">
                      This processing fee applies to all blockchain transactions. Prices vary based on network traffic.
                    </Typography.BodySmall>
                  </HoverActivatedTooltip.Content>
                </HoverActivatedTooltip>
              </Flex.Row>
              <Flex.Row
                alignItems="center"
                style={{
                  gap: '8px',
                }}
              >
                <Typography.BodySmall>
                  {parseInReadableEther({ amount: networkFee })} {chainInfo.currency}
                </Typography.BodySmall>
                <Typography.BodySmall>
                  {parseInReadablePrice({
                    amount: networkFee,
                    price: tokenPrice,
                  })}
                </Typography.BodySmall>
              </Flex.Row>
            </Flex.Row>
          </>
        )}

        {new BN(value).gt(0) && (
          <>
            <Divider />
            <Flex.Row justifyContent="space-between" alignItems="center">
              <Typography.BodySmall>Total</Typography.BodySmall>
              <Flex.Row
                alignItems="center"
                style={{
                  gap: '8px',
                }}
              >
                <Typography.BodySmall>
                  {parseInReadableEther({ amount: new BN(value).plus(networkFee) })} {chainInfo.currency}
                </Typography.BodySmall>
                <Typography.BodySmall>
                  {parseInReadablePrice({
                    amount: networkFee,
                    price: tokenPrice,
                  })}
                </Typography.BodySmall>
              </Flex.Row>
            </Flex.Row>
          </>
        )}
      </Flex.Column>

      <Spacer size={32} orientation="vertical" />
      <Flex.Row alignItems="center" style={{ gap: '12px', width: '100%' }}>
        {onClose && (
          <Button variant="neutral" onClick={onClose} disabled={isSubmitting || isSubmitSuccessful}>
            Close
          </Button>
        )}
        <Button
          onClick={handleSubmit(handleOnSubmit)}
          loading={isSubmitting || isSubmitSuccessful}
          disabled={isSubmitting || freeTransactionCount === 0 || isSubmitSuccessful}
        >
          Send
        </Button>
      </Flex.Row>
    </Flex.Column>
  );
};
