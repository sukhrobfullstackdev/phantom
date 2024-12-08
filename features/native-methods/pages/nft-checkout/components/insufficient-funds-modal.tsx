import React, { useCallback } from 'react';
import { Flex, Typography } from '@magiclabs/ui';
import { BottomModal, BottomModalProps } from '~/features/native-methods/components/BottomModal';
import { ExternalLinkIcon } from '~/features/native-methods/ui/icons/ExternalLinkIcon';
import { openInNewTab } from '~/features/native-methods/utils/window-open';
import { Button } from '~/features/native-methods/ui/button/button';
import { CreditCardOutlineIcon } from '~/features/native-methods/ui/icons/CreditCardOutlineIcon';
import { QRCodeIcon } from '~/features/native-methods/ui/icons/qr-code-icon';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { ArrowDownIcon } from '~/features/native-methods/ui/icons/arrow-down-icon';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { i18n } from '~/app/libs/i18n';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';
import { useBalanceForEVM } from '~/features/native-methods/hooks/use-balance-for-evm';
import { formatReadableEther } from '~/features/native-methods/utils/format-readable-ether';
import { MAGIC_METHODS, useMagicMethodRouter } from '~/features/native-methods/hooks/use-magic-method-router';

type Props = BottomModalProps & {
  minimumBalance: string;
};

export const InsufficientFundsModal = ({ isOpen, onClose, minimumBalance }: Props) => {
  const { mode } = useThemeMode();
  const { address } = useUserMetadata();
  const { chainInfo } = useChainInfo();
  const { navigateTo } = useControllerContext();
  const { push } = useMagicMethodRouter();
  const { balance } = useBalanceForEVM({ address });

  const handleGoToRecive = useCallback(() => {
    navigateTo('nft-checkout-receive');
  }, []);

  const handleBuyCrypto = useCallback(() => {
    push({
      method: MAGIC_METHODS.MAGIC_WALLET,
      params: [],
      pageId: 'wallet-fiat-onramp-selection',
    });
  }, [push]);

  const handleGoToFaucet = useCallback(() => {
    if (chainInfo.faucetUrl) {
      openInNewTab(chainInfo.faucetUrl);
    }
  }, [chainInfo]);

  const handleClickCreditOrDebit = useCallback(() => {
    navigateTo('nft-checkout-card-form');
  }, []);

  return (
    <BottomModal isOpen={isOpen} onClose={onClose}>
      <Flex.Column alignItems="flex-start" style={{ width: '100%', gap: '20px' }}>
        <Typography.BodyLarge>{i18n.nft_checkout.insufficient_funds.toString()}</Typography.BodyLarge>
        <Flex.Column alignItems="flex-start" style={{ gap: '8px' }}>
          <Typography.BodyMedium weight="600">
            {i18n.nft_checkout.you_need_minimum_balance.toMarkdown({
              amount: minimumBalance,
              currency: chainInfo.currency,
            })}
          </Typography.BodyMedium>
          <Typography.BodySmall weight="400">
            {i18n.nft_checkout.current_balance.toString()}:{' '}
            {formatReadableEther({
              ether: balance,
            })}{' '}
            {chainInfo.currency}
          </Typography.BodySmall>
        </Flex.Column>
        <Flex.Column style={{ width: '100%', gap: '12px' }}>
          <Flex.Row style={{ gap: '12px' }}>
            <Button style={{ flex: 1, gap: '12px', borderRadius: '8px' }} variant="neutral" onClick={handleGoToRecive}>
              <QRCodeIcon
                style={{
                  filter: `invert(${mode('0%', '100%')}`,
                }}
              />
              <Typography.BodySmall>{i18n.nft_checkout.receive.toString()}</Typography.BodySmall>
            </Button>

            {chainInfo.isMainnet ? (
              <Button style={{ flex: 1, gap: '12px', borderRadius: '8px' }} onClick={handleBuyCrypto} variant="neutral">
                <ArrowDownIcon />
                <Typography.BodySmall>{i18n.nft_checkout.buy.toString()}</Typography.BodySmall>
              </Button>
            ) : (
              <Button
                onClick={handleGoToFaucet}
                variant="neutral"
                style={{ flex: 1, gap: '12px', borderRadius: '8px' }}
              >
                <ExternalLinkIcon size={20} />
                <Typography.BodySmall>{i18n.nft_checkout.faucet.toString()}</Typography.BodySmall>
              </Button>
            )}
          </Flex.Row>
        </Flex.Column>
        <Button
          onClick={handleClickCreditOrDebit}
          variant="black"
          style={{
            position: 'relative',
            maxHeight: '48px',
            borderRadius: '8px',
            gap: '12px',
          }}
        >
          <CreditCardOutlineIcon />
          <Typography.BodyMedium weight="600">{i18n.nft_checkout.credit_or_debit.toString()}</Typography.BodyMedium>
        </Button>
      </Flex.Column>
    </BottomModal>
  );
};
