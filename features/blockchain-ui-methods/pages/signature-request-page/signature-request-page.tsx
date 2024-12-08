import React, { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Alert, CallToAction, Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { getReferrer } from '~/app/libs/get-referrer';
import { useCloseUIThread, useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { AppName } from '~/features/connect-with-ui/components/app-name';
import { SignatureDataContent } from './signature-data-content';
import { SignatureDataLabel } from './signature-data-label';
import { Network } from '~/features/connect-with-ui/components/network';
import { CallToActionStateful } from '~/features/connect-with-ui/components/call-to-action-overload';
import styles from './signature-request-page.less';
import { ConfirmActionType } from '~/features/confirm-action/types';
import { useDispatch, useSelector } from '~/app/ui/hooks/redux-hooks';
import { rejectPayload } from '~/app/rpc/utils';
import { isRnOrIosSDK } from '~/app/libs/platform';
import {
  ConfirmActionErrorCodes,
  beginActionConfirmation,
  waitForActionConfirmed,
} from '~/features/confirm-action/store/confirm-action.thunks';
import { getLogger } from '~/app/libs/datadog';
import { isUnsupportedBrowser } from '~/features/connect-with-ui/utils/device';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { ActionOtpChallenge } from '../../components/action-otp-challenge';
import { isNumber } from '~/app/libs/lodash-utils';
import { getApiKey } from '~/app/libs/api-key';
import { AngleDown } from '~/shared/svg/magic-connect';
import { motion } from 'framer-motion';

export const UnsupportedBrowserError = () => {
  const theme = useTheme();
  return (
    <>
      <Typography.H4 style={{ textAlign: 'center' }}>
        To ensure your security, <br />
        log in from a web browser.
      </Typography.H4>
      <Spacer size={8} orientation="vertical" />
      <Typography.BodyMedium style={{ fontWeight: 400, textAlign: 'center', fontSize: '16px' }}>
        Please open this page in a web browser to log into {theme.theme.appName}.
      </Typography.BodyMedium>
    </>
  );
};

const isString = d => typeof d === 'string';
const isArray = d => Array.isArray(d);
const isObject = d => d.constructor.name === 'Object';
const isMessageHexString = msg => typeof msg === 'string' && msg.startsWith('0x') && !ethers.utils.isAddress(msg);

function recursivelyDisplayDataToSign(data: any) {
  if (!data) return <SignatureDataContent content="undefined" />;

  if (isArray(data)) {
    return data.map(m => {
      if (isString(m) || isNumber(m)) {
        return <SignatureDataContent content={m} key={m} />;
      }
      return recursivelyDisplayDataToSign(m);
    });
  }
  if (isObject(data)) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    return keys.map((key, i) => {
      if (isString(values[i]) || isNumber(values[i])) {
        return (
          <div key={key}>
            <SignatureDataLabel label={key} />
            <SignatureDataContent content={values[i]} />
          </div>
        );
      }
      return (
        <div key={key}>
          <SignatureDataLabel label={key} />
          {recursivelyDisplayDataToSign(data[key])}
        </div>
      );
    });
  }
}

const getFormattedMessageForConfirmTab = (m: string): string => {
  if (isMessageHexString(m)) {
    try {
      return ethers.utils.toUtf8String(m);
    } catch (e) {
      // If hex is from uint8array, the above will throw an error
      return m;
    }
  }
  return m;
};

const Message: React.FC<{ m: string }> = ({ m }) => {
  if (!m) {
    return null;
  }
  // web3.personal.sign(msg) comes in hex-encoded, need to decode for user
  if (isMessageHexString(m)) {
    try {
      return ethers.utils.toUtf8String(m);
    } catch (e) {
      // If hex is from uint8array, the above will throw an error
      return m;
    }
  }
  if (isString(m) || isNumber(m)) {
    return <SignatureDataContent content={m} />;
  }
  return recursivelyDisplayDataToSign(m);
};

const AppNameAndDomain = ({
  appName,
  referrer,
  children,
}: {
  appName: string | undefined;
  referrer: string | undefined;
  children?: React.ReactNode;
}) => {
  return (
    <Flex.Row style={{ padding: '15px' }} justifyContent="space-between">
      <Flex.Column>
        <AppName override={appName} />
        <Typography.BodySmall weight="400" className={styles.referrer}>
          {referrer || getReferrer()}
        </Typography.BodySmall>
      </Flex.Column>
      {children}
    </Flex.Row>
  );
};

const AppNameCollapsible = ({
  appName,
  referrer,
  children,
}: {
  appName: string | undefined;
  referrer: string | undefined;
  children?: React.ReactNode;
}) => {
  const {
    theme: { isDarkTheme },
  } = useTheme();
  const [isShowMsg, setIsShowMsg] = useState(false);

  const toggleDetails = useCallback(() => setIsShowMsg(prev => !prev), [])

  const toggleMarkup = (
    <Flex.Column onClick={toggleDetails} style={{ float: 'right', position: 'relative', cursor: 'pointer' }}>
      <Flex.Row justifyContent="flex-end" alignItems="center">
        <Typography.BodySmall className={styles.toggle} weight={'400'}>
          Details
        </Typography.BodySmall>
        <Icon
          className={styles.toggleIcon}
          type={AngleDown}
          size={18}
          color={isDarkTheme ? '#FFFFFFB8' : '#B6B4BA'}
          style={{ transform: isShowMsg ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </Flex.Row>
    </Flex.Column>
  )

  const collapsibleContentMarkup = (
    <>
      <hr className={styles.hr} />

      <div className={styles.messageContainer} style={{ backgroundColor: isDarkTheme ? '#303030' : '#F8F8FA' }}>
        {children}
      </div>
    </>
  )

  return (
    <>
      <AppNameAndDomain appName={appName} referrer={referrer}>
        {toggleMarkup}
      </AppNameAndDomain>
      <motion.div
        transition={{ duration: 0.3 }}
        animate={{ height: isShowMsg ? '100%' : '0px' }}
        aria-expanded={isShowMsg}
        style={{ overflow: 'hidden' }}
      >
        {collapsibleContentMarkup}
      </motion.div>
    </>
  );
};

export const SignatureInfo: React.FC<{ messageToSign: string; appName?: string; referrer?: string }> = ({
  messageToSign,
  appName,
  referrer,
}) => {
  return (
    <div className={styles.signatureInfo}>
      <AppNameCollapsible appName={appName} referrer={referrer}>
        <Message m={messageToSign} />
      </AppNameCollapsible>
    </div>
  );
};

interface SignatureRequestPageProps {
  message: string;
  onComplete: Function;
  onSignRequest: () => Promise<void>;
}

export const SignatureRequestPage: React.FC<SignatureRequestPageProps> = ({ message, onComplete, onSignRequest }) => {
  const [isLoadingSig, setIsLoadingSig] = useState(false);
  const { LAUNCH_DARKLY_FEATURE_FLAGS, CLIENT_FEATURE_FLAGS } = useSelector(state => state.System);
  const payload = useUIThreadPayload();
  const [messageToSign, setMessageToSign] = useState(message as any);
  const isConfirmActionFlowEnabled: boolean =
    LAUNCH_DARKLY_FEATURE_FLAGS['is-confirm-action-flow-enabled'] &&
    CLIENT_FEATURE_FLAGS.is_transaction_confirmation_enabled;
  const isActionOtpChallengeEnforced: boolean = LAUNCH_DARKLY_FEATURE_FLAGS['is-action-otp-challenge-enforced'];
  const [confirmUrl, setConfirmUrl] = useState('');
  const dispatch = useDispatch();
  const [showTransactionChallenge, setShowTransactionChallenge] = useState(false);
  const [showTransactionChallengeError, setShowTransactionChallengeError] = useState(false);

  // Mobile: popup only works inside of a useEffect
  useEffect(() => {
    if (!confirmUrl || !isRnOrIosSDK()) return;
    window.open(confirmUrl);
    setConfirmUrl('');
  }, [confirmUrl]);

  useEffect(() => {
    if (
      (payload?.method === 'mwui_eth_signTypedData_v4' || payload?.method === 'mwui_eth_signTypedData_v3') &&
      typeof message === 'string'
    ) {
      setMessageToSign(JSON.parse(message));
    }
  }, []);
  const rejectSignature: () => Promise<void> = useCloseUIThread(sdkErrorFactories.magic.userRejectAction());

  const handleSignMessage = async () => {
    await onSignRequest();
    getLogger().info('Modal: Approve Signature Request Succeeded');
    setIsLoadingSig(false);
  };

  const handleSignButtonClick = async () => {
    getLogger().info('Modal: Approve Signature Request Clicked');
    try {
      setIsLoadingSig(true);
      if (isConfirmActionFlowEnabled) {
        let confirmWindow;
        if (!isRnOrIosSDK()) confirmWindow = window.open(`${window.location.origin}/confirm-action?ak=${getApiKey()}`);
        const curl = await dispatch(
          beginActionConfirmation(ConfirmActionType.SignMessage, {
            message: getFormattedMessageForConfirmTab(message),
            request_domain: getReferrer(),
          }),
        );
        setConfirmUrl(curl);
        if (confirmWindow) confirmWindow.location = curl;
        await dispatch(waitForActionConfirmed());
      }
      await handleSignMessage();
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
  const { userAgent: ua } = navigator;
  const shouldOtpChallenge = isUnsupportedBrowser(ua) && isActionOtpChallengeEnforced;
  return (
    <div>
      {showTransactionChallenge && (
        <ActionOtpChallenge
          transactionAmount={0}
          onSuccess={async () => {
            setIsLoadingSig(true);
            setShowTransactionChallenge(false);
            await handleSignMessage();
          }}
          onError={() => {
            setIsLoadingSig(false);
            setShowTransactionChallenge(false);
            setShowTransactionChallengeError(true);
          }}
        />
      )}
      <ModalHeader rightAction={<CancelActionButton />} header={<Network />} />
      <Flex.Column horizontal="center">
        <Spacer size={15} orientation="vertical" />
        <ThemeLogo height="54px" style={{ maxWidth: 'inherit' }} />
        <Spacer size={15} orientation="vertical" />
        {isUnsupportedBrowser(ua) && !shouldOtpChallenge ? (
          <UnsupportedBrowserError />
        ) : (
          <>
            <Typography.H4>Confirm Request</Typography.H4>
            <Spacer size={15} orientation="vertical" />
            <SignatureInfo messageToSign={messageToSign} />
            <Spacer size={30} orientation="vertical" />
            {showTransactionChallengeError && (
              <>
                <Alert type="warning" icon={false}>
                  The security code you entered is incorrect. Please try again.
                </Alert>
                <Spacer size={30} orientation="vertical" />
              </>
            )}
            <Flex.Row style={{ width: '100%' }}>
              <CallToAction
                className={styles.cancelBtn}
                disabled={isLoadingSig}
                onClick={rejectSignature}
                color="secondary"
              >
                Cancel
              </CallToAction>
              <Spacer size={16} />
              <CallToActionStateful
                className={styles.signBtn}
                isLoading={isLoadingSig}
                disabled={isLoadingSig}
                onClick={
                  shouldOtpChallenge
                    ? () => {
                      setShowTransactionChallengeError(false);
                      setShowTransactionChallenge(true);
                    }
                    : handleSignButtonClick
                }
                onHideSuccess={handleHideSuccessIcon}
                color="primary"
              >
                Sign
              </CallToActionStateful>
            </Flex.Row>
          </>
        )}
      </Flex.Column>
    </div>
  );
};
