import React, { useCallback } from 'react';
import { Icon, Spacer, Typography } from '@magiclabs/ui';
import { BottomModal, BottomModalProps } from '~/features/native-methods/components/BottomModal';
import { Ethereum } from '~/shared/svg/magic-connect';
import { ExternalLinkIcon } from '~/features/native-methods/ui/icons/ExternalLinkIcon';
import { openInNewTab } from '~/features/native-methods/utils/window-open';
import { useIsMagicAuth } from '~/features/native-methods/hooks/useIsMagicAuth';
import { Button } from '~/features/native-methods/ui/button/button';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';
import { MAGIC_METHODS, useMagicMethodRouter } from '~/features/native-methods/hooks/use-magic-method-router';

type Props = BottomModalProps & {
  minimumBalance: string;
};

export const InsufficientBalanceModal = ({ isOpen, onClose, minimumBalance }: Props) => {
  const { chainInfo } = useChainInfo();
  const { isMagicAuth } = useIsMagicAuth();
  const { push } = useMagicMethodRouter();

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

  return (
    <BottomModal isOpen={isOpen} onClose={onClose}>
      {chainInfo.isMainnet ? (
        <>
          <Icon type={chainInfo?.tokenIcon ?? Ethereum} size={48} />
          <Spacer size={16} orientation="vertical" />
          <Typography.H4>You need more {chainInfo.currency}</Typography.H4>
          <Spacer size={12} orientation="vertical" />
          <Typography.BodyMedium weight="400" style={{ textAlign: 'center' }}>
            You’ll need at least {minimumBalance} {chainInfo.currency} to cover the required network fee
          </Typography.BodyMedium>
          {!isMagicAuth && (
            <>
              <Spacer size={32} orientation="vertical" />

              <Button onClick={handleBuyCrypto}>
                <Typography.BodyMedium>Buy {chainInfo.currency}</Typography.BodyMedium>
              </Button>
            </>
          )}
        </>
      ) : (
        <>
          <Icon type={chainInfo?.tokenIcon ?? Ethereum} size={48} />
          <Spacer size={16} orientation="vertical" />
          <Typography.H4>You need more {chainInfo.currency}</Typography.H4>
          <Spacer size={12} orientation="vertical" />
          <Typography.BodyMedium weight="400" style={{ textAlign: 'center' }}>
            Visit a {chainInfo.currency} faucet to top up with at least {minimumBalance} {chainInfo.currency}.
          </Typography.BodyMedium>
          <Spacer size={32} orientation="vertical" />
          {chainInfo?.faucetUrl && (
            <Button onClick={handleGoToFaucet}>
              <Typography.BodyMedium>{chainInfo.name} faucet</Typography.BodyMedium>
              <ExternalLinkIcon size={24} />
            </Button>
          )}
        </>
      )}
    </BottomModal>
  );
};
