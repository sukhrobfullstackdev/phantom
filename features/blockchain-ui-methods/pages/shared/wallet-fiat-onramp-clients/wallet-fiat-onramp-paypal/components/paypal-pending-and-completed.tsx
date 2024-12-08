import { CallToAction, Flex, Icon, Linkable, Spacer, Typography } from '@magiclabs/ui';
import { ETH_SENDTRANSACTION } from '~/app/constants/eth-rpc-methods';
import { i18n } from '~/app/libs/i18n';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner/loading-spinner';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { CheckMarkIcon, ExternalLink, SuccessCheckmark } from '~/shared/svg/magic-connect';
import styles from '~/features/blockchain-ui-methods/pages/shared/wallet-fiat-onramp-clients/wallet-fiat-onramp-paypal/wallet-fiat-onramp-paypal.less';
import React from 'react';

interface PayPalPendingAndCompleted {
  transactionLink: string | undefined;
  step: 'PENDING' | 'COMPLETED';
}

const PayPalPendingAndCompleted = ({ transactionLink, step }: PayPalPendingAndCompleted) => {
  const { navigateTo } = useControllerContext();
  const { theme } = useTheme();
  const payload = useUIThreadPayload();

  const backNavigationRoute = payload?.method.endsWith(ETH_SENDTRANSACTION) ? 'wallet-send-transaction' : 'wallet-home';
  return (
    <Flex.Column>
      <Flex.Row justifyContent="center" alignItems="center">
        <Icon aria-label={i18n.generic.success.toString()} type={SuccessCheckmark} size={40} />
      </Flex.Row>
      <Spacer size={20} orientation="vertical" />
      <Typography.H4>
        {step === 'PENDING' && 'Processing Purchase...'}
        {step === 'COMPLETED' && 'Purchase complete!'}
      </Typography.H4>
      <Spacer size={28} orientation="vertical" />
      <Flex.Column style={{ maxWidth: '195px', marginLeft: 'auto', marginRight: 'auto' }}>
        <Flex justifyContent="flex-start" alignItems="center">
          <Icon type={CheckMarkIcon} size={21} color={theme.hex.primary.lightest} />
          <Typography.BodySmall
            style={{
              fontWeight: 700,
              color: theme.hex.primary.base,
              fontSize: '16px',
              marginLeft: '18px',
            }}
          >
            Transfer initiated
          </Typography.BodySmall>
          {!!transactionLink && (
            <Linkable>
              <a href={transactionLink} target="_blank" rel="noopener noreferrer">
                <Icon type={ExternalLink} style={{ marginLeft: '6.5px' }} />
              </a>
            </Linkable>
          )}
        </Flex>
        <Spacer size={16} orientation="vertical" />
        <Flex justifyContent="flex-start" alignItems="center">
          {step === 'PENDING' ? (
            <LoadingSpinner small size={20} strokeSize={3} />
          ) : (
            <Icon type={CheckMarkIcon} size={21} color={theme.hex.primary.lightest} />
          )}{' '}
          <Typography.BodySmall
            style={{
              fontWeight: 700,
              color: theme.hex.primary.base,
              fontSize: '16px',
              marginLeft: '18px',
            }}
          >
            Transfer complete
          </Typography.BodySmall>
        </Flex>
      </Flex.Column>
      <Spacer size={28} orientation="vertical" />
      <Typography.BodySmall weight="400" className={styles.note}>
        {step === 'PENDING' &&
          'It may take a few minutes for this page to update, but your purchase may appear in your wallet sooner.'}
        {step === 'COMPLETED' && 'It may take a few minutes for your transaction to finish processing.'}
      </Typography.BodySmall>
      <Spacer size={42} orientation="vertical" />
      <CallToAction style={{ width: '100%' }} onPress={() => navigateTo(backNavigationRoute, eventData)}>
        Done
      </CallToAction>
    </Flex.Column>
  );
};

export default PayPalPendingAndCompleted;
