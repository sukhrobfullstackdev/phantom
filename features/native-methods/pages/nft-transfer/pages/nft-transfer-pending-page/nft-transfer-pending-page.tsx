import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { Flex, Spacer, Typography } from '@magiclabs/ui';

import { getNftAltTag } from '~/features/connect-with-ui/utils/get-nft-alt-tag';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { truncateTitle } from '~/features/native-methods/utils/truncate-title';
import { ExternalLinkIcon } from '~/features/native-methods/ui/icons/ExternalLinkIcon';
import { CountBadge } from '~/features/native-methods/pages/nft-transfer/components/CountBadge';
import { SuccessIcon } from '~/features/native-methods/ui/icons/SuccessIcon';
import { SpinnerIcon } from '~/features/native-methods/ui/icons/SpinnerIcon';
import { ErrorIcon } from '~/features/native-methods/ui/icons/ErrorIcon';
import { useNFT } from '~/features/native-methods/hooks/useNFT';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { Button } from '~/features/native-methods/ui/button/button';
import { usePrimaryColor } from '~/features/native-methods/hooks/usePrimaryColor';
import Color from 'color';
import { NFTImage } from '~/features/native-methods/components/nft-image/nft-image';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { useInterval } from '~/features/native-methods/hooks/use-interval';
import { getLogger } from '~/app/libs/datadog';
import { useAlchemy } from '~/features/blockchain-ui-methods/hooks/use-alchemy';
import { useLinkToTransaction } from '~/features/blockchain-ui-methods/hooks/use-link-to-transaction';
import { useNFTTransferState } from '../../hooks/use-nft-trasnfer-state';
import { MotionLoading } from '~/features/native-methods/components/motion-loading/motion-loading';
import { MAGIC_METHODS, useMagicMethodRouter } from '~/features/native-methods/hooks/use-magic-method-router';
import { includes } from '~/app/libs/lodash-utils';
import { useDispatchResponse } from '~/features/native-methods/hooks/use-dispatch-response';

export const TRANSACTION_STATUS = {
  MINING: 'MINING',
  PROCESSING: 'PROCESSING',
  SUCCESSED: 'SUCCESSED',
  FAILED: 'FAILED',
} as const;

export type TransactionStatus = keyof typeof TRANSACTION_STATUS;

const Resolved = () => {
  const { mode } = useThemeMode();
  const { alchemy } = useAlchemy();
  const { primaryColor } = usePrimaryColor();
  const { dispatchResponse } = useDispatchResponse();

  const { linkToTransaction } = useLinkToTransaction();
  const {
    nftTransferState: { contractAddress, tokenId, tokenType, quantity, txHash },
  } = useNFTTransferState();
  const { push } = useMagicMethodRouter();

  const [status, setStatus] = useState<TransactionStatus>(TRANSACTION_STATUS.MINING);

  const { nft } = useNFT({
    contractAddress,
    tokenId,
    tokenType,
  });

  const handleBackToWallet = useCallback(
    () =>
      push({
        method: MAGIC_METHODS.MAGIC_WALLET,
        params: {},
        pageId: 'wallet-home',
      }),
    [push],
  );

  const handleLinkToTransaction = useCallback(() => {
    linkToTransaction(txHash);
  }, [txHash]);

  useInterval(
    async () => {
      if (!alchemy) {
        getLogger().warn('Warning with NFTTransferPendingPage: No alchemy instance found');
        return;
      }

      if (!txHash) {
        getLogger().warn('Warning with NFTTransferPendingPage: No tx hash found');
        return;
      }

      if (status === TRANSACTION_STATUS.MINING) {
        const recipt = await alchemy.core.getTransactionReceipt(txHash);
        if (!recipt) {
          getLogger().warn('Warning with NFTTransferPendingPage: Transaction is pending');
          return;
        }

        if (recipt.status === 0) {
          setStatus(TRANSACTION_STATUS.FAILED);
          dispatchResponse('declined');
        }

        if (recipt.status === 1) {
          setStatus(TRANSACTION_STATUS.PROCESSING);
        }
      }

      if (status === TRANSACTION_STATUS.PROCESSING) {
        const recipt = await alchemy.core.waitForTransaction(txHash);
        if (recipt && recipt.status === 1) {
          setStatus(TRANSACTION_STATUS.SUCCESSED);
          dispatchResponse('processed');
        } else {
          setStatus(TRANSACTION_STATUS.FAILED);
          dispatchResponse('declined');
        }
      }
    },
    !includes([TRANSACTION_STATUS.SUCCESSED, TRANSACTION_STATUS.FAILED], status) ? 2000 : null,
  );

  useEffect(() => {
    dispatchResponse('pending');
  }, []);

  return (
    <Flex.Column alignItems="center" style={{ marginTop: '32px' }}>
      <Flex.Row style={{ position: 'relative' }}>
        <NFTImage size={96} alt={getNftAltTag(nft)} src={nft.image?.cachedUrl ?? nft.image.originalUrl} />
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
        {truncateTitle(nft.name ?? '(Untitled)')}
      </Typography.H4>

      <Spacer size={24} orientation="vertical" />

      <Flex.Column
        style={{
          gap: '16px',
        }}
      >
        <Flex.Row
          alignItems="center"
          style={{
            gap: '16px',
          }}
        >
          <SuccessIcon
            size={20}
            color={primaryColor}
            style={{ backgroundColor: 'var(--white)', overflow: 'hidden', borderRadius: '100%' }}
          />
          <Flex.Row alignItems="center" style={{ gap: '4px' }}>
            <Typography.BodyMedium weight="700" color={primaryColor}>
              {' '}
              Transfer initiated
            </Typography.BodyMedium>
            {txHash && (
              <ExternalLinkIcon
                size={16}
                color={primaryColor}
                style={{
                  cursor: 'pointer',
                }}
                onClick={handleLinkToTransaction}
              />
            )}
          </Flex.Row>
        </Flex.Row>
        <Flex.Row
          alignItems="center"
          style={{
            gap: '16px',
          }}
        >
          {(status === TRANSACTION_STATUS.PROCESSING || status === TRANSACTION_STATUS.MINING) && (
            <SpinnerIcon size={20} color={new Color(primaryColor).alpha(0.5).toString()} />
          )}
          {status === TRANSACTION_STATUS.SUCCESSED && (
            <SuccessIcon
              size={20}
              color={primaryColor}
              style={{ backgroundColor: 'var(--white)', overflow: 'hidden', borderRadius: '100%' }}
            />
          )}
          {status === TRANSACTION_STATUS.FAILED && <ErrorIcon size={20} color="var(--ink100)" />}

          {status === TRANSACTION_STATUS.SUCCESSED ? (
            <Typography.BodyMedium weight="700" color={primaryColor}>
              Transfer complete
            </Typography.BodyMedium>
          ) : (
            <Typography.BodyMedium weight="400" color={mode('var(--ink100)', 'var(--white)')}>
              Sending collectible
            </Typography.BodyMedium>
          )}
        </Flex.Row>
      </Flex.Column>

      <Spacer size={16} orientation="vertical" />

      <Typography.BodySmall weight="400" color="var(--ink70)" style={{ textAlign: 'center' }}>
        Transfers take about 30 seconds.
        <br /> You can close this window.
      </Typography.BodySmall>

      <Spacer size={32} orientation="vertical" />

      <Button variant="neutral" onClick={handleBackToWallet}>
        <Typography.BodyMedium>Back to Wallet</Typography.BodyMedium>
      </Button>
    </Flex.Column>
  );
};

export const NFTTransferPendingPage = () => {
  return (
    <>
      <ModalHeader rightAction={<CancelActionButton />} />

      <Suspense fallback={<MotionLoading key="nft-transfer-pending-suspense-loading" />}>
        <Resolved />
      </Suspense>
    </>
  );
};
