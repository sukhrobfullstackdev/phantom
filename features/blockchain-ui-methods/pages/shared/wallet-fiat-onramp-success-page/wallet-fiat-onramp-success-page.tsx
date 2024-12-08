import { CallToAction, Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import React from 'react';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { Network } from '~/features/connect-with-ui/components/network';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import styles from './wallet-fiat-onramp-success-page.less';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { ETH_SENDTRANSACTION } from '~/app/constants/eth-rpc-methods';
import { SuccessCheckmark } from '~/shared/svg/magic-connect';

export const WalletFiatOnrampSuccessPage = () => {
  const { navigateTo } = useControllerContext();
  const payload = useUIThreadPayload();
  const buttonText = payload?.method.endsWith(ETH_SENDTRANSACTION) ? 'Back to transaction' : 'Back to wallet';
  const backNavigationRoute = payload?.method.endsWith(ETH_SENDTRANSACTION) ? 'wallet-send-transaction' : 'wallet-home';

  return (
    <div>
      <ModalHeader
        leftAction={<BackActionButton onClick={() => navigateTo(backNavigationRoute, eventData)} />}
        rightAction={<CancelActionButton />}
        header={<Network />}
      />
      <BasePage>
        <Spacer size={45} orientation="vertical" />
        <Flex.Column alignItems="center">
          <Icon type={SuccessCheckmark} size={40} />
          <Spacer size={25} orientation="vertical" />
          <Typography.H4>Purchase Complete</Typography.H4>
          <Spacer size={15} orientation="vertical" />
          <Typography.BodyMedium weight="400" className={styles.message}>
            It may take a few minutes for your transaction to finish processing.
          </Typography.BodyMedium>
          <Spacer size={10} orientation="vertical" />
          <Spacer size={25} orientation="vertical" />
          <CallToAction className={styles.ctaButton} onClick={() => navigateTo(backNavigationRoute, eventData)}>
            {buttonText}
          </CallToAction>
        </Flex.Column>
      </BasePage>
    </div>
  );
};
