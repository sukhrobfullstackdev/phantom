import React, { useEffect, useState } from 'react';
import { CallToAction, Flex, Spacer } from '@magiclabs/ui';
import { StandardPage } from '../../../../core/app/ui/components/layout/standard-page';
import { Modal } from '../../../../core/app/ui/components/layout/modal';
import { ConfirmActionService } from '~/app/services/confirm-action';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { ConfirmSendTransactionDetails } from '../confirm-send-transaction-details';
import { AssetLogo } from '../asset-logo';
import styles from './confirm-action-page.less';
import { decodeBase64 } from '~/app/libs/base64';
import { ConfirmActionInfo, DecodedTctPayload } from '../../types';
import { ConfirmResponse } from '~/app/services/confirm-action/complete-confirm';
import { ConfirmSignMessageDetails } from '../confirm-sign-message-details';
import { ConfirmSignTransactionDetails } from '../confirm-sign-transaction-details/confirm-sign-transaction-details';
import { getLogger } from '~/app/libs/datadog';
import { CONFIRM_ACTION_JWT_PUBLIC_KEYS } from '../../constants/keys';
import { DEPLOY_ENV } from '~/shared/constants/env';
// eslint-disable-next-line import/no-extraneous-dependencies
import jwt from 'jsonwebtoken';
import { data } from '~/app/services/web-storage/data-api';
import { isMobileSDK } from '~/app/libs/platform';
import { ActionStatus, ActionType } from '../../constants/confirm-action';
import { getApiKey } from '~/app/libs/api-key';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { ConfirmTransactionDetails } from '../confirm-transaction-details/confirm-transaction-details';
import { BigNumber } from 'ethers';

export const getDecodedTctPayload = (tct: string) => {
  const parts = tct.split('.');
  return JSON.parse(decodeBase64(parts[1])) as DecodedTctPayload;
};

const isTctTokenInvalidOrExpired = (tct: string) => {
  const tctPayload = getDecodedTctPayload(tct);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  // Validate time stamp and show expired state if expired..
  if (currentTimestamp > tctPayload.exp) return true;
  try {
    jwt.verify(tct, CONFIRM_ACTION_JWT_PUBLIC_KEYS[DEPLOY_ENV]);
    return false;
  } catch (e) {
    return true;
  }
};

export const ConfirmActionPage: React.FC = () => {
  // Component info
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestExpired, setIsRequestExpired] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [requestTimeoutId, setRequestTimeoutId] = useState<NodeJS.Timeout | undefined>(undefined);
  const { theme } = useTheme();
  const { appName, logoImage: assetUri } = theme;
  const apiKey = getApiKey();

  // Action information
  const [actionType, setActionType] = useState('');
  const [actionInfo, setActionInfo] = useState({} as ConfirmActionInfo);
  const [actionStatus, setActionStatus] = useState(ActionStatus.PENDING);
  const [confirmationId, setConfirmationId] = useState('');

  // tct
  const [tempConfirmToken, setTempConfirmToken] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const urlParams = new URLSearchParams(window.location.search);
    const tct = urlParams.get('tct') as string;
    if (!tct) return;
    setTempConfirmToken(tct);
    if (isTctTokenInvalidOrExpired(tct)) {
      setIsLoading(false);
      setIsRequestExpired(true);
      return;
    }

    const tctPayload = getDecodedTctPayload(tct);
    ConfirmActionService.getConfirmPayload(tct).then(({ data: payloadData }) => {
      setActionType(payloadData.action);
      setActionInfo(payloadData.payload);
      setConfirmationId(tctPayload.confirmation_id);

      data.getItem(`reqConId-${tctPayload.confirmation_id}`).then((previousResponse: ActionStatus) => {
        if (previousResponse) setActionStatus(previousResponse);
        setIsLoading(false);
      });
    });
  }, []);

  useEffect(() => {
    // Set a timeout of 65 seconds. if no action is taken the request has expired.
    if (!requestTimeoutId && actionStatus === ActionStatus.PENDING) {
      const id = setTimeout(() => {
        setIsRequestExpired(true);
      }, 65000);
      setRequestTimeoutId(id);
    } else if (requestTimeoutId && actionStatus !== ActionStatus.PENDING) {
      clearTimeout(requestTimeoutId as unknown as number); // Need to use browser timeout here not node timeout.
    }
    return () => {
      if (requestTimeoutId) clearTimeout(requestTimeoutId as unknown as number);
    };
  }, [actionStatus]);

  const completeAction = async (response: ConfirmResponse) => {
    setIsConfirming(true);
    getLogger().info(
      `Confirm Action: ${response === ConfirmResponse.Approved ? 'Approve' : 'Reject'} ${actionType} Button Clicked`,
    );
    await ConfirmActionService.completeConfirm(tempConfirmToken, apiKey, response);
    await data.setItem(`reqConId-${confirmationId}`, response);
    setActionStatus(response as unknown as ActionStatus);
    if (!isMobileSDK()) window.close();
    else setIsConfirming(false);
  };

  if (isRequestExpired) {
    return (
      <StandardPage>
        <Modal in>
          <AssetLogo assetUri={assetUri} />
          <Flex.Column
            horizontal="center"
            style={{
              width: '304px',
              height: '125px',
              margin: 'auto',
              justifyContent: 'center',
              fontSize: '20px',
              lineHeight: '32px',
              textAlign: 'center',
            }}
          >
            <b>
              You ran out of time to confirm the signature. <br />
              Please go back to {appName || 'the original window'} and sign the request again.
            </b>
          </Flex.Column>
        </Modal>
      </StandardPage>
    );
  }

  return (
    <StandardPage>
      <Modal in>
        {isLoading ? (
          <Flex.Column horizontal="center" style={{ height: '200px', margin: 'auto', justifyContent: 'center' }}>
            <LoadingSpinner />
          </Flex.Column>
        ) : (
          <Flex.Column horizontal="center" style={{ margin: 'auto' }}>
            <AssetLogo assetUri={assetUri} />
            {actionType === ActionType.CONFIRM_TRANSACTION && (
              <ConfirmTransactionDetails
                toAddress={actionInfo.to}
                estimatedGasFee={actionInfo.estimatedGasFee ? BigNumber.from(actionInfo.estimatedGasFee) : undefined}
              />
            )}
            {actionType === ActionType.SIGN_MESSAGE && (
              <ConfirmSignMessageDetails
                appName={appName}
                requestDomain={actionInfo.request_domain}
                actionStatus={actionStatus}
                message={actionInfo}
              />
            )}
            {actionType === ActionType.SEND_TRANSACTION && (
              <ConfirmSendTransactionDetails
                appName={appName}
                transactionType={actionInfo.transaction_type}
                tokenAmount={actionInfo.token_amount}
                symbol={actionInfo.symbol}
                fiatValue={actionInfo.fiat_value}
                amount={actionInfo.amount}
                currency={actionInfo.token}
                from={actionInfo.from}
                to={actionInfo.to}
                chainInfoUri={actionInfo.chain_info_uri}
                actionStatus={actionStatus}
              />
            )}
            {actionType === ActionType.SIGN_TRANSACTION && (
              <ConfirmSignTransactionDetails
                messageToShow={actionInfo}
                appName={appName}
                requestDomain={actionInfo.request_domain}
                actionStatus={actionStatus}
              />
            )}
            {actionStatus === ActionStatus.PENDING && (
              <>
                <Spacer size={32} orientation="vertical" />
                <Flex.Row horizontal="space-between" style={{ width: '100%' }}>
                  <CallToAction
                    disabled={isConfirming}
                    color="secondary"
                    className={styles.cancelBtn}
                    style={{ width: '144px', height: '46px' }}
                    onClick={() => completeAction(ConfirmResponse.Rejected)}
                  >
                    {isConfirming ? <LoadingSpinner size={20} color="var(--magic)" strokeSize={3} /> : 'Cancel'}
                  </CallToAction>
                  <CallToAction
                    disabled={isConfirming}
                    style={{ width: '144px', height: '46px' }}
                    onClick={() => completeAction(ConfirmResponse.Approved)}
                  >
                    {isConfirming ? <LoadingSpinner size={20} color="var(--white)" strokeSize={3} /> : 'Confirm'}
                  </CallToAction>
                </Flex.Row>
              </>
            )}
          </Flex.Column>
        )}
      </Modal>
    </StandardPage>
  );
};
