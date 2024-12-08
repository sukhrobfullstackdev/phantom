import { Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import React, { useState } from 'react';
import { useAsyncEffect } from 'usable-react';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { WalletIcon } from '~/shared/svg/magic-connect';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import styles from './request-user-info-page.less';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { connectStore } from '~/features/connect-with-ui/store';
import {
  thirdPartyWalletLoginFlowChallenge,
  thirdPartyWalletLoginFlowVerify,
} from '~/features/connect-with-ui/services/third-party-wallet-login';
import { resolveThirdPartyWalletRPC } from '~/features/connect-with-ui/connect-with-ui.controller';
import { store } from '~/app/store';
import { setUserID, setUST } from '~/app/store/auth/auth.actions';
import { handleHydrateUserOrReject } from '~/app/rpc/utils';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { ETH_ACCOUNTS } from '~/app/constants/eth-rpc-methods';
import { v4 as createUuid } from 'uuid';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';

export const RequestUserInfoThirdPartyWalletPromptPage = () => {
  const { navigateTo } = useControllerContext();
  const { theme } = useTheme();
  const [publicAddress, setPublicAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const activeThirdPartyWallet = connectStore.hooks.useSelector(state => state.activeThirdPartyWallet);

  const thirdPartyWalletLoginFlowStartResponse = connectStore.hooks.useSelector(
    state => state.thirdPartyWalletLoginFlowStartResponse,
  );

  useAsyncEffect(async () => {
    try {
      if (activeThirdPartyWallet) {
        const thirdPartyWalletPublicAddress = await resolveThirdPartyWalletRPC(activeThirdPartyWallet, {
          id: createUuid(),
          jsonrpc: '2.0',
          method: ETH_ACCOUNTS,
        } as any);
        setPublicAddress(thirdPartyWalletPublicAddress || '');
      }
    } catch (e) {
      getLogger().error('Error with resolveThirdPartyWalletRPC', buildMessageContext(e));
    }
  }, []);

  useAsyncEffect(async () => {
    try {
      if (!publicAddress || !activeThirdPartyWallet || !thirdPartyWalletLoginFlowStartResponse?.data.login_flow_context)
        return;

      const challengeResponse = await thirdPartyWalletLoginFlowChallenge(
        thirdPartyWalletLoginFlowStartResponse?.data.login_flow_context,
      );

      const signatureResult = await resolveThirdPartyWalletRPC(activeThirdPartyWallet, {
        id: createUuid(),
        jsonrpc: '2.0',
        method: 'personal_sign',
        params: [challengeResponse.data.message, publicAddress],
      } as any);

      setIsLoading(true);

      const nonce = challengeResponse.data.message
        .split('\n')
        .find(message => message.startsWith('Nonce: '))
        ?.split('Nonce: ')?.[1];

      const verifyResponse = await thirdPartyWalletLoginFlowVerify(
        thirdPartyWalletLoginFlowStartResponse?.data.login_flow_context,
        challengeResponse.data.message,
        signatureResult || '',
        nonce,
      );

      store.dispatch(setUserID(verifyResponse.data.auth_user_id));
      store.dispatch(setUST(verifyResponse.data.auth_user_session_token));
      await handleHydrateUserOrReject();

      navigateTo('request-user-info', eventData);
    } catch (e) {
      getLogger().error(
        'Error with thirdPartyWalletLoginFlowChallenge, resolveThirdPartyWalletRPC, thirdPartyWalletLoginFlowVerify',
        buildMessageContext(e),
      );
      setIsLoading(false);
    }
  }, [publicAddress]);

  return (
    <>
      <ModalHeader
        rightAction={<CancelActionButton />}
        header={<Typography.BodySmall weight="400" color={theme.color.mid.base.toString()} />}
      />
      <BasePage className={styles.requestUserInfoPage}>
        <Spacer size={32} orientation="vertical" />
        <Flex.Row justifyContent="center" style={{ width: '100%' }}>
          <Icon size={48} type={WalletIcon} color={theme.hex.primary.base} />
        </Flex.Row>
        <Spacer size={16} orientation="vertical" />
        <Typography.H4 weight="700" style={{ textAlign: 'center', width: '100%' }}>
          Check your wallet
        </Typography.H4>
        {isLoading && (
          <>
            <Spacer size={16} orientation="vertical" />
            <Flex.Row justifyContent="center" style={{ width: '100%' }}>
              <LoadingSpinner small />
            </Flex.Row>
            <Spacer size={8} orientation="vertical" />
          </>
        )}
        {!isLoading && (
          <>
            <Spacer size={8} orientation="vertical" />
            <Typography.BodyMedium weight="400" style={{ textAlign: 'center' }}>
              Sign the message to verify ownership of your wallet.
            </Typography.BodyMedium>
            <Spacer size={16} orientation="vertical" />
            <Typography.BodySmall color="var(--silk65)" weight="400" style={{ textAlign: 'center' }}>
              This is for verification purposes only. Magic will never take actions on your behalf.
            </Typography.BodySmall>
          </>
        )}
      </BasePage>
    </>
  );
};
