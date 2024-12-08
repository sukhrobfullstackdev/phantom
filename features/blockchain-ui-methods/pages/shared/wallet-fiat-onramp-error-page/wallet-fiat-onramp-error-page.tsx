import { CallToAction, Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import React, { useEffect, useState } from 'react';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { Network } from '~/features/connect-with-ui/components/network';
import { ErrorIcon } from '~/shared/svg/magic-connect';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import * as FiatOnRampErrors from '~/features/connect-with-ui/constants/fiat-onramp-errors';
import styles from './wallet-fiat-onramp-error-page.less';
import { store } from '~/app/store';
import { setFiatOnRampErrorRouteParams } from '~/app/store/user/user.actions';

export const WalletFiatOnrampErrorPage = () => {
  const [errorMessage, setErrorMessage] = useState('');
  const { navigateTo } = useControllerContext();
  const params = store.hooks.useSelector(state => state.User.fiatOnRampErrorRouteParams);

  useEffect((): any => {
    switch (params?.errorCode) {
      case FiatOnRampErrors.EXTERNAL_PROVIDER_IS_DOWN:
        setErrorMessage(FiatOnRampErrors.STRIPE_UNAVAILABLE);
        break;
      case FiatOnRampErrors.FIAT_ON_RAMP_UNSUPPORTED_LOCATION:
        setErrorMessage(FiatOnRampErrors.STRIPE_UNSUPPORTED_LOCATION);
        break;
      default:
        setErrorMessage(FiatOnRampErrors.DEFAULT_ERROR_MESSAGE);
        break;
    }
    return () => store.dispatch(setFiatOnRampErrorRouteParams(undefined));
  }, []);

  return (
    <div>
      <ModalHeader
        leftAction={<BackActionButton onClick={() => navigateTo('wallet-fiat-onramp-selection', eventData)} />}
        rightAction={<CancelActionButton />}
        header={<Network />}
      />
      <BasePage>
        <Spacer size={45} orientation="vertical" />
        <Flex.Column alignItems="center">
          <Icon type={ErrorIcon} size={50} />
          <Spacer size={25} orientation="vertical" />
          <Typography.H4>Purchase Failed</Typography.H4>
          <Spacer size={15} orientation="vertical" />
          <Typography.BodyMedium weight="400" className={styles.message}>
            {errorMessage && errorMessage}
          </Typography.BodyMedium>
          <Spacer size={10} orientation="vertical" />
          <Spacer size={25} orientation="vertical" />
          <CallToAction
            className={styles.ctaButton}
            onClick={() => navigateTo('wallet-fiat-onramp-selection', eventData)}
          >
            Back to Wallet
          </CallToAction>
        </Flex.Column>
      </BasePage>
    </div>
  );
};
