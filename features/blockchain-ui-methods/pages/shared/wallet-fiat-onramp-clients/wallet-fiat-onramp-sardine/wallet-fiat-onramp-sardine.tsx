import React, { useContext, useState } from 'react';
import { Spacer, Typography } from '@magiclabs/ui';
import { useAsyncEffect } from 'usable-react';
import { store } from '~/app/store';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { Network } from '~/features/connect-with-ui/components/network';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import styles from './wallet-fiat-onramp-sardine.less';
import { HttpService } from '~/app/services/http';
import { SARDINE_URL_TEST, SARDINE_URL_PROD } from '~/shared/constants/env';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { MultiChainInfoContext } from '~/features/connect-with-ui/hooks/multiChainContext';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';

interface WalletFiatOnrampSardineProps {
  isFiatOnRampEnabled: boolean;
}

export const WalletFiatOnrampSardine = ({ isFiatOnRampEnabled }: WalletFiatOnrampSardineProps) => {
  const chainInfo = useContext(MultiChainInfoContext);
  const { navigateTo } = useControllerContext();
  const walletAddress = store.hooks.useSelector(state => state.Auth.userKeys.publicAddress);
  const [sardineClientToken, setSardineClientToken] = useState();
  const urlParams = [
    `address=${walletAddress}`,
    `network=${chainInfo?.name.toLowerCase() || 'ethereum'}`,
    `client_token=${sardineClientToken}`,
    `fiat_amount=${chainInfo?.name === 'Polygon' ? '50' : '100'}`,
    `asset_type=${chainInfo?.currency.toLowerCase() || 'eth'}`,
  ];
  const sardineUrl = chainInfo?.isMainnet ? SARDINE_URL_PROD : SARDINE_URL_TEST;

  useAsyncEffect(async () => {
    await fetchClientToken();
  }, []);

  const fetchClientToken = async () => {
    const endpoint = `/v1/sardine/client_token`;
    const body = {
      is_mainnet: !!chainInfo?.isMainnet,
      payment_method_type_config: {
        default: 'ach',
        enabled: ['ach', 'us_debit'],
      },
    };
    const res = await HttpService.magic.post<any>(endpoint, body);
    setSardineClientToken(res.data?.client_token);
  };

  const attachListener = () => {
    window.addEventListener('message', sardineEvent => {
      if (typeof sardineEvent?.data === 'string') {
        try {
          const dataObj = JSON.parse(sardineEvent.data);
          if (dataObj.status === 'processed') {
            navigateTo('wallet-fiat-onramp-success', eventData);
          }
        } catch (e) {
          getLogger().error(`Error with parsing sardineEvent`, buildMessageContext(e));
        }
      }
    });
  };

  return (
    <div>
      <ModalHeader
        leftAction={<BackActionButton onClick={() => navigateTo('wallet-fiat-onramp-selection', eventData)} />}
        rightAction={<CancelActionButton />}
        header={<Network />}
      />

      <BasePage className={styles.sardine}>
        <Spacer size={40} orientation="vertical" />
        {sardineClientToken && (
          <iframe
            className={styles.sardineIframe}
            src={`${sardineUrl}/?${urlParams.join('&')}`}
            onLoad={attachListener}
            id="sardine_iframe"
            height="620px"
            width="419px"
            title="Sardine"
            allow="camera *;geolocation *"
          />
        )}
        {!sardineClientToken && (
          <div>
            <LoadingSpinner />
          </div>
        )}
        {!isFiatOnRampEnabled && <Typography.BodyMedium>Fiat On Ramp Coming Soon!</Typography.BodyMedium>}
      </BasePage>
    </div>
  );
};
