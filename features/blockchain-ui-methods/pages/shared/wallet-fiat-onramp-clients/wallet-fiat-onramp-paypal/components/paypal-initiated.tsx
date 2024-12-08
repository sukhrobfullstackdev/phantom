import { Flex, Icon, Spacer, TextButton, Typography } from '@magiclabs/ui';
import { ETH_SENDTRANSACTION } from '~/app/constants/eth-rpc-methods';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { MagicGradientIcon, PayPalIconWithBackground, WaitingIcon } from '~/shared/svg/magic-connect';
import styles from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-paypal/wallet-fiat-onramp-paypal.less';
import React from 'react';

interface PayPalInitiatedProps {
  redirectUrl?: string;
}

const PayPalInitiated: React.FC<PayPalInitiatedProps> = ({ redirectUrl }) => {
  const { navigateTo } = useControllerContext();
  const payload = useUIThreadPayload();
  const backNavigationRoute = payload?.method.endsWith(ETH_SENDTRANSACTION) ? 'wallet-send-transaction' : 'wallet-home';
  return (
    <>
      <Spacer size={30} orientation="vertical" />
      <Flex.Row justifyContent="center" alignItems="center">
        <Icon type={MagicGradientIcon} size={48} />
        <Spacer size={15} orientation="horizontal" />
        <Icon type={WaitingIcon} />
        <Spacer size={15} orientation="horizontal" />
        <Icon type={PayPalIconWithBackground} size={48} />
      </Flex.Row>
      <Spacer size={20} orientation="vertical" />
      <Typography.H4>Continue to PayPal</Typography.H4>
      <Spacer size={10} orientation="vertical" />
      <Typography.BodyMedium weight="400" className={styles.note}>
        Please continue to{' '}
        {redirectUrl ? (
          <a
            href={redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontWeight: 600, color: 'var(--magic50)' }}
          >
            PayPal
          </a>
        ) : (
          'PayPal'
        )}{' '}
        to complete the transaction.
      </Typography.BodyMedium>
      <Spacer size={30} orientation="vertical" />
      <TextButton size="sm" onClick={() => navigateTo(backNavigationRoute, eventData)}>
        Back to Wallet
      </TextButton>
    </>
  );
};

export default PayPalInitiated;
