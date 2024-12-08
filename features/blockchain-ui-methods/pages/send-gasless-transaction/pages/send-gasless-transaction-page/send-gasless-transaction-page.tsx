import React, { useEffect, useMemo, useState } from 'react';
import { Flex, HoverActivatedTooltip, Icon, Spacer, Typography } from '@magiclabs/ui';

import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { GasService } from '~/app/services/gas';
import { store } from '~/app/store';
import { UserThunks } from '~/app/store/user/user.thunks';
import { normalizeTypedData } from '~/app/libs/normalize-typed-data';
import { PopulatedTransaction } from 'ethers';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { Button } from '~/features/native-methods/ui/button/button';
import { CheckIcon } from '~/features/native-methods/ui/icons/CheckIcon';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { Divider } from '~/features/native-methods/ui/divider/divider';
import { HelpIcon } from '~/features/native-methods/ui/icons/HelpIcon';
import { Ethereum } from '~/shared/svg/magic-connect';
import { FreeBadge } from '../../components/free-badge/free-badge';
import { DecentralisedNaming } from '../../components/decentralised-naming/decentralised-naming';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { useResolveSendGalssTransaction } from '../../hooks/use-resolve-send-gasless-transaction';
import { useGasApiResponse } from '../../hooks/use-gas-api-response';
import { useConfirmTransaction } from '~/features/hooks/use-confirm-transaction';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { SendGaslessTransactionLayout } from '../../components/send-gasless-transaction-layout/send-gasless-transaction-layout';
import { ConfirmActionType } from '~/features/confirm-action/types';
import { useChainInfo } from '~/features/blockchain-ui-methods/hooks/use-chain-info';

const STATUS = {
  READY: 'READY',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DONE: 'DONE',
} as const;

export const SendGaslessTransactionPage = () => {
  const payload = useUIThreadPayload();
  const { mode } = useThemeMode();
  const [requestId, setRequestId] = useState<string>('');
  const [status, setStatus] = useState<keyof typeof STATUS>(STATUS.READY);

  const { theme } = useTheme();
  const { chainInfo } = useChainInfo();
  const { navigateTo } = useControllerContext();

  const { address } = useUserMetadata();
  const { setGasApiResponse } = useGasApiResponse();
  const { resolveSendGaslessTransaction } = useResolveSendGalssTransaction();
  const { confirmTransaction } = useConfirmTransaction();

  const toAddress = useMemo(() => {
    return (payload?.params?.[1]?.to as string) ?? '';
  }, [payload]);

  const handleConfirm = async () => {
    setStatus(STATUS.PENDING);

    const isConfirmed = await confirmTransaction({
      actionType: ConfirmActionType.ConfirmTransaction,
      payload: {
        to: toAddress,
        from: payload?.params?.[1]?.from ?? address,
        chain_info_uri: `${chainInfo.blockExplorer}/address/`,
        isGasless: true,
      },
    });

    if (!isConfirmed) {
      setStatus(STATUS.READY);
      return;
    }

    try {
      const [signerAddress, transaction] = payload?.params as [string, PopulatedTransaction];
      const message = await GasService.buildForwardPayload(signerAddress, transaction);

      const signedTransaction = await store.dispatch(UserThunks.signTypedDataV4ForUser(normalizeTypedData(message)));
      const magicClientId = store.getState().Auth.clientID;

      const response = await GasService.submitGaslessRequest({
        address: signerAddress,
        payload: message,
        signedTransaction,
        magicClientId,
      });
      setGasApiResponse(response);

      if (!response.success) {
        getLogger().warn("Warning with SendGaslessTransactionPage: Couldn't submit gasless request", {
          ...response,
        });
        navigateTo('eth-send-gasless-transaction-error');
        return;
      }

      setRequestId(response.request_id);
      setStatus(STATUS.APPROVED);
    } catch (e) {
      getLogger().warn('Something went wrong with SendGaslessTransactionPage', buildMessageContext(e));
      navigateTo('eth-send-gasless-transaction-error');
      return;
    }
  };

  useEffect(() => {
    if (status !== STATUS.APPROVED || !payload || !requestId) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const res = await GasService.getRequestState({ requestId });
        setGasApiResponse({
          success: res.success,
          request_id: res.request_id,
          state: res.state,
        });

        if (res.state === 'COMPLETED') {
          clearInterval(intervalId);
          setStatus(STATUS.DONE);
          setTimeout(() => {
            resolveSendGaslessTransaction();
          }, 2000);
        }

        if (res.state === 'FAILED') {
          clearInterval(intervalId);
          getLogger().warn(
            'Failed to submit gasless request',
            buildMessageContext('Failed to submit gasless request', res),
          );
          navigateTo('eth-send-gasless-transaction-error');
        }
      } catch (e) {
        clearInterval(intervalId);
        getLogger().warn('Something went wrong in the middle of getting gasless request state', buildMessageContext(e));
        navigateTo('eth-send-gasless-transaction-error');
      }
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [status, requestId]);

  return (
    <SendGaslessTransactionLayout>
      <Flex.Column alignItems="center" style={{ marginTop: '32px' }}>
        <ThemeLogo width={48} height={48} />

        <Spacer size={16} orientation="vertical" />

        <Typography.H4 weight="700" color={mode('var(--ink100)', 'white')}>
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
              <Flex
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                style={{
                  gap: '16px',
                  width: '100%',
                }}
              >
                <Typography.BodySmall
                  weight="500"
                  color={mode('var(--ink100)', 'var(--chalk44)')}
                  style={{
                    flexShrink: 0,
                  }}
                >
                  Send To
                </Typography.BodySmall>
                <DecentralisedNaming address={toAddress} />
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
                    {theme.appName} is paying the network fee for this transaction
                  </Typography.BodySmall>
                </HoverActivatedTooltip.Content>
              </HoverActivatedTooltip>
            </Flex.Row>

            <FreeBadge />
          </Flex>
        </Flex>
      </Flex.Column>

      <Spacer size={32} orientation="vertical" />

      <Flex.Row style={{ width: '100%' }}>
        {status === STATUS.DONE ? (
          <Button>
            <CheckIcon size={20} />
          </Button>
        ) : (
          <Button
            onClick={handleConfirm}
            variant="primary"
            disabled={status === STATUS.PENDING || status === STATUS.APPROVED}
            loading={status === STATUS.PENDING || status === STATUS.APPROVED}
          >
            <Typography.BodyMedium>Confirm</Typography.BodyMedium>
          </Button>
        )}
      </Flex.Row>
    </SendGaslessTransactionLayout>
  );
};
