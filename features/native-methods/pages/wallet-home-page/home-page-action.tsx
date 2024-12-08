import React from 'react';
import { Flex, MonochromeIconDefinition } from '@magiclabs/ui';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { Button } from '~/features/connect-with-ui/components/button';
import { ArrowDown, PaperPlaneIcon, QRCodeIcon } from '~/shared/svg/magic-connect';
import { useGetNativeTokenBalance } from '~/features/connect-with-ui/hooks/useGetNativeTokenBalance';
import { TrackingButton } from '~/features/connect-with-ui/components/tracking-button';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { AnalyticsActionType } from '~/app/libs/analytics';
import LedgerBalance from '~/app/libs/ledger-balance';

interface Action {
  onClick: React.MouseEventHandler<HTMLDivElement>;
  label: string;
  iconType: MonochromeIconDefinition;
  disabled?: boolean;
  visible: boolean;
  actionName: AnalyticsActionType;
}

interface HomePageActionsProps {
  isFiatOnRampEnabled: boolean;
  isSendFundsEnabled: boolean;
}

export const HomePageActions = ({ isFiatOnRampEnabled, isSendFundsEnabled }: HomePageActionsProps) => {
  const { navigateTo } = useControllerContext();
  const balance: string | undefined = useGetNativeTokenBalance();
  const ledgerBalance = new LedgerBalance();

  const actions: Action[] = [
    {
      visible: isFiatOnRampEnabled,
      onClick: () => {
        navigateTo('wallet-fiat-onramp-selection', eventData);
      },
      label: 'Buy',
      iconType: ArrowDown,
      actionName: AnalyticsActionType.BuyCryptoClick,
    },
    {
      visible: isSendFundsEnabled,
      disabled: !balance || ledgerBalance.isGreaterThanOrEqualTo()('0', balance),
      onClick: () => {
        navigateTo('wallet-token-selection', eventData);
      },
      label: 'Send',
      iconType: PaperPlaneIcon,
      actionName: AnalyticsActionType.ComposeTransactionStart,
    },
    {
      visible: true,
      onClick: () => {
        navigateTo('wallet-receive-funds', eventData);
      },
      label: 'Receive',
      iconType: QRCodeIcon,
      actionName: AnalyticsActionType.ReceiveClick,
    },
  ];

  const filteredActions = actions.filter(action => action.visible);

  return (
    <Flex.Row justifyContent={filteredActions.length <= 2 ? 'space-around' : 'space-evenly'}>
      {filteredActions.map(action => (
        <TrackingButton actionName={action.actionName} key={action.label} style={{ width: '100px' }}>
          <Button {...action} />
        </TrackingButton>
      ))}
    </Flex.Row>
  );
};
