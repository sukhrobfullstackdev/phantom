import React, { useEffect, useState } from 'react';
import { CallToAction, Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import { motion } from 'framer-motion';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { useCloseUIThread, useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { AppName } from '~/features/connect-with-ui/components/app-name';
import { TransactionDataContent } from './transaction-data-content';
import { Network } from '~/features/connect-with-ui/components/network';
import { CallToActionStateful } from '~/features/connect-with-ui/components/call-to-action-overload';
import styles from './multi-chain-sign-transaction-page.less';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { AngleDown } from '~/shared/svg/magic-connect';
import { getReferrer } from '~/app/libs/get-referrer';
import { ConfirmActionType } from '~/features/confirm-action/types';
import { useDispatch, useSelector } from '~/app/ui/hooks/redux-hooks';
import { isRnOrIosSDK, isRnSDK } from '~/app/libs/platform';
import { rejectPayload } from '~/app/rpc/utils';
import {
  ConfirmActionErrorCodes,
  beginActionConfirmation,
  waitForActionConfirmed,
} from '~/features/confirm-action/store/confirm-action.thunks';
import { getLogger } from '~/app/libs/datadog';
import { getApiKey } from '~/app/libs/api-key';

const Message = ({ messageToShow }) => {
  if (!messageToShow) {
    return null;
  }
  return <TransactionDataContent content={messageToShow} />;
};

export const MultiChainSignTransactionSignatureInfo: React.FC<{
  messageToShow: any;
  appName?: string;
  requestDomain?: string;
}> = ({ messageToShow, appName, requestDomain }) => {
  const [isShowCode, setIsShowCode] = useState(false);
  const {
    theme: { isDarkTheme },
  } = useTheme();
  return (
    <div className={styles.signatureInfo}>
      <Flex.Row justifyContent="space-between" style={{ padding: '17px' }}>
        <Flex.Column>
          <AppName override={appName} />
          <Typography.BodySmall weight="400" className={styles.referrer}>
            {requestDomain || getReferrer()}
          </Typography.BodySmall>
        </Flex.Column>
        <Flex.Column
          onClick={() => setIsShowCode(!isShowCode)}
          style={{ float: 'right', position: 'relative', cursor: 'pointer' }}
        >
          <Typography.BodySmall style={{ fontWeight: 500, marginRight: '15px' }}>
            <span style={{ marginRight: '5px' }}>Code</span>
            <Icon
              className={isShowCode ? styles.codeIconUp : styles.codeIconDown}
              type={AngleDown}
              size={18}
              color={isDarkTheme ? '#FFFFFFB8' : '#B6B4BA'}
            />
          </Typography.BodySmall>
        </Flex.Column>
      </Flex.Row>
      <motion.div
        transition={{ duration: 0.3 }}
        animate={{ height: isShowCode ? '100%' : '0px' }}
        aria-expanded={isShowCode}
      >
        <div
          className={styles.messageContainer}
          style={{ backgroundColor: isDarkTheme ? '#303030' : '#F8F8FA', fontFamily: 'monospace' }}
        >
          <Message messageToShow={messageToShow} />
        </div>
      </motion.div>
    </div>
  );
};

interface MultiChainSignTransactionPage {
  contract: any;
  onComplete: Function;
  onSignRequest: () => Promise<void>;
}

export const MultiChainSignTransactionPage: React.FC<MultiChainSignTransactionPage> = ({
  contract,
  onComplete,
  onSignRequest,
}) => {
  const { LAUNCH_DARKLY_FEATURE_FLAGS, CLIENT_FEATURE_FLAGS } = useSelector(state => state.System);
  const [isLoadingSig, setIsLoadingSig] = useState(false);
  const theme = useTheme();
  const payload = useUIThreadPayload();
  const isConfirmActionFlowEnabled: boolean =
    LAUNCH_DARKLY_FEATURE_FLAGS['is-confirm-action-flow-enabled'] &&
    CLIENT_FEATURE_FLAGS.is_transaction_confirmation_enabled;
  const [confirmUrl, setConfirmUrl] = useState('');
  const dispatch = useDispatch();

  // Mobile: popup only works inside of a useEffect
  useEffect(() => {
    if (!confirmUrl || !isRnOrIosSDK()) return;
    window.open(confirmUrl);
    setConfirmUrl('');
  }, [confirmUrl]);

  const messageToShow = contract;

  const rejectSignature: () => Promise<void> = useCloseUIThread(sdkErrorFactories.magic.userRejectAction());

  const signMessage = async () => {
    getLogger().info('Modal: Sign Transaction Button Clicked');
    setIsLoadingSig(true);
    try {
      if (isConfirmActionFlowEnabled) {
        let confirmWindow;
        if (!isRnSDK()) confirmWindow = window.open(`${window.location.origin}/confirm-action?ak=${getApiKey()}`);
        const curl = await dispatch(
          beginActionConfirmation(ConfirmActionType.SignTransaction, {
            message: messageToShow,
            request_domain: getReferrer(),
          }),
        );
        setConfirmUrl(curl);
        if (confirmWindow) confirmWindow.location = curl;
        await dispatch(waitForActionConfirmed());
      }
      await onSignRequest();
      getLogger().info('Modal: Sign Transaction Button Succeeded');
      setIsLoadingSig(false);
    } catch (e) {
      if (e === ConfirmActionErrorCodes.USER_REJECTED_CONFIRMATION && payload) {
        return rejectPayload(payload, sdkErrorFactories.magic.userRejectAction());
      }
      // TODO: Show error state, action expired and what not.
      setIsLoadingSig(false);
    }
  };

  const handleHideSuccessIcon = () => {
    onComplete();
  };

  return (
    <div>
      <ModalHeader rightAction={<CancelActionButton />} header={<Network />} />
      <Flex.Column>
        <Spacer size={15} orientation="vertical" />
        <ThemeLogo height="54px" style={{ maxWidth: 'inherit', textAlign: 'center' }} />
        <Spacer size={15} orientation="vertical" />
        <div>
          <Typography.H4 style={{ textAlign: 'center' }}>
            <span style={{ fontWeight: 700 }}>{theme.theme.appName}</span>
            <span style={{ fontWeight: 400 }}> wants to interact with your wallet</span>
          </Typography.H4>
        </div>
        <Spacer size={15} orientation="vertical" />
        <MultiChainSignTransactionSignatureInfo messageToShow={messageToShow} isDarkTheme={theme.theme.isDarkTheme} />
        <Spacer size={30} orientation="vertical" />
        <Flex.Row>
          <CallToAction
            className={styles.cancelBtn}
            disabled={isLoadingSig}
            onClick={rejectSignature}
            color="secondary"
          >
            Reject
          </CallToAction>
          <Spacer size={16} />
          <CallToActionStateful
            className={styles.signBtn}
            isLoading={isLoadingSig}
            disabled={isLoadingSig}
            onClick={signMessage}
            onHideSuccess={handleHideSuccessIcon}
            color="primary"
          >
            Approve
          </CallToActionStateful>
        </Flex.Row>
      </Flex.Column>
    </div>
  );
};
