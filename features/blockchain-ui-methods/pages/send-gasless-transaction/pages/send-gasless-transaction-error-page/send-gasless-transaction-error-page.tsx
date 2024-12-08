import React from 'react';
import { Flex, Spacer, Typography } from '@magiclabs/ui';
import { ExclamtionIcon } from '~/features/native-methods/ui/icons/ExclamtionIcon';
import { useThemeMode } from '~/features/native-methods/hooks/useThemeMode';
import { Button } from '~/features/native-methods/ui/button/button';
import { useResolveSendGalssTransaction } from '../../hooks/use-resolve-send-gasless-transaction';
import { SendGaslessTransactionLayout } from '../../components/send-gasless-transaction-layout/send-gasless-transaction-layout';

export const SendGaslessTransactionErrorPage = () => {
  const { mode } = useThemeMode();

  const { resolveSendGaslessTransaction } = useResolveSendGalssTransaction();

  return (
    <SendGaslessTransactionLayout>
      <Flex.Column alignItems="center" style={{ marginTop: '32px' }}>
        <ExclamtionIcon width={48} height={48} color="var(--gold50)" />

        <Spacer size={16} orientation="vertical" />

        <Typography.H4 weight="700" color={mode('var(--ink100)', 'white')}>
          Something went wrong
        </Typography.H4>

        <Spacer size={8} orientation="vertical" />

        <Typography.BodyMedium
          weight="400"
          color={mode('var(--ink70)', 'white')}
          style={{
            textAlign: 'center',
          }}
        >
          We ran into a technical issue. Your request could not be completed. Please try again.
        </Typography.BodyMedium>

        <Spacer size={32} orientation="vertical" />

        <Button onClick={() => resolveSendGaslessTransaction()} variant="neutral">
          <Typography.BodyMedium weight="600">Close</Typography.BodyMedium>
        </Button>
      </Flex.Column>
    </SendGaslessTransactionLayout>
  );
};
