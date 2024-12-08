import { Icon, Spacer, Typography, CallToAction } from '@magiclabs/ui';
import React, { useContext, useEffect, useState } from 'react';
import { useAsyncEffect } from 'usable-react';
import uuid from 'uuid';
import { sdkErrorFactories, getErrorMessage } from '~/app/libs/exceptions';
import { store } from '~/app/store';
import styled from '@emotion/styled';
import { useCloseUIThread } from '~/app/ui/hooks/ui-thread-hooks';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { ChainInfoContext } from '~/features/connect-with-ui/hooks/chainInfoContext';
import styles from './nft-purchase.less';
import { SARDINE_URL_PROD, SARDINE_URL_TEST } from '~/shared/constants/env';
import { HttpService } from '~/app/services/http';
import { SardineClientTokenRequestBody } from './types';
import { SuccessCheckmark, ErrorIcon } from '~/shared/svg/magic-connect';
import { useNFTPurchaseState } from './hooks/useNFTPurchaseState';
import { resolveNFTPurchaseRequest } from '../../store/nft-purchase/nft-purchase.controller';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';

export const NFTPurchase = () => {
  const email = store.hooks.useSelector(state => state.Auth.userEmail);
  const walletAddress = store.hooks.useSelector(state => state.Auth.userKeys.publicAddress);
  const { setNFTPurchaseState, reset, ...nftPurchase } = useNFTPurchaseState();

  const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.hooks.useSelector(state => state.System);
  const chainInfo = useContext(ChainInfoContext);
  const [sardineClientToken, setSardineClientToken] = useState<string>();
  const [hasValidImageUrl, setHasValidImageUrl] = useState<boolean>(true);
  const [nftPurchaseStatus, setNftPurchaseStatus] = useState<string>();
  const [showError, setShowError] = useState<boolean>();
  const cancel = useCloseUIThread(sdkErrorFactories.magic.userRejectAction());

  const urlParams = [`show_features=true`, `client_token=${sardineClientToken}`];
  const isMainnet = chainInfo?.isMainnet;
  const sardineUrl = isMainnet ? SARDINE_URL_PROD : SARDINE_URL_TEST;

  useEffect(() => {
    setNftPurchaseStatus(nftPurchase?.status);
  }, [nftPurchase?.status]);

  useAsyncEffect(async () => {
    await fetchClientToken();

    return () => {
      reset();
    };
  }, []);

  const completedPurchaseStatuses = ['processed', 'complete'];
  const failedPurchaseStatuses = ['expired', 'declined', 'cancelled'];

  const objectHasValues = obj => {
    return Object.values(obj || {}).filter(value => {
      if (typeof value !== 'string') {
        return false;
      }
      return !!value.length;
    }).length;
  };

  interface NftImageContainerProps {
    src: string;
  }

  const NftImageContainer = styled.div<NftImageContainerProps>`
    width: 50%;
    height: 50%;
    display: inline-block;
    position: relative;
  `;

  const NftImage = ({ alt, src, onError, style }: { alt: string; src: string; onError: any; style: any }) => {
    return (
      <NftImageContainer src={src}>
        <img alt={alt} src={src} className={style} onError={onError} />
      </NftImageContainer>
    );
  };

  const generatePayloadBody = () => {
    const body = {
      reference_id: uuid(),
      nft: {
        name: nftPurchase?.nft?.name,
        image_url: nftPurchase?.nft?.imageUrl,
        blockchain_nft_id: nftPurchase?.nft?.blockchainNftId,
        contract_address: nftPurchase?.nft?.contractAddress,
        recipient_address: walletAddress,
        network: nftPurchase?.nft?.network,
        platform: nftPurchase?.nft?.platform,
        type: nftPurchase?.nft?.type,
      },
      identity_prefill: {
        first_name: nftPurchase?.identityPrefill?.firstName,
        last_name: nftPurchase?.identityPrefill?.lastName,
        date_of_birth: nftPurchase?.identityPrefill?.dateOfBirth,
        email_address: nftPurchase?.identityPrefill?.emailAddress,
        phone: nftPurchase?.identityPrefill?.phone,
        address: {
          street1: nftPurchase?.identityPrefill?.address?.street1,
          street2: nftPurchase?.identityPrefill?.address?.street2,
          city: nftPurchase?.identityPrefill?.address?.city,
          region_code: nftPurchase?.identityPrefill?.address?.regionCode,
          postal_code: nftPurchase?.identityPrefill?.address?.postalCode,
          country_code: nftPurchase?.identityPrefill?.address?.countryCode,
        },
      },
      is_mainnet: !!chainInfo?.isMainnet,
    } as SardineClientTokenRequestBody;

    if (nftPurchase?.identityPrefill && objectHasValues(nftPurchase?.identityPrefill)) {
      // Only pass in identity prefills that have a value
      const { identityPrefill } = nftPurchase;
      body.identity_prefill = Object.keys(identityPrefill).reduce((acc, key) => {
        if (identityPrefill[key] && identityPrefill[key].length > 0) {
          const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          acc[snakeCaseKey] = identityPrefill[key];
        }
        return acc;
      }, {});

      if (nftPurchase?.identityPrefill?.address && objectHasValues(nftPurchase?.identityPrefill?.address)) {
        const { address } = nftPurchase.identityPrefill;
        body.identity_prefill.address = Object.keys(address).reduce((acc, key) => {
          if (address[key] && address[key].length > 0) {
            const snakeCaseKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            acc[snakeCaseKey] = address[key];
          }
          return acc;
        }, {});
      }
    }

    return body;
  };

  const fetchClientToken = async () => {
    // Reset the purchase state
    reset();
    const endpoint = `/v1/sardine/client_token`;
    const body = generatePayloadBody();
    try {
      const res = await HttpService.magic.post<any>(endpoint, body);
      setSardineClientToken(res.data?.client_token);
      setNFTPurchaseState({
        status: 'draft',
      });
    } catch (e) {
      getLogger().error(
        `nft-purchase-page: ${endpoint}`,
        buildMessageContext(e, {
          message: getErrorMessage(e),
          feature: 'nft-purchase',
          isMainnet,
        }),
      );
      setShowError(true);
      let errorMessage = 'unknown error calling the sardine client token endpoint';
      // TODO: once fortmatic returns a proper error code, use that instead of splitting message
      let errorCode = 'unknown';
      if (e instanceof Error) {
        errorMessage = e.message;
        const messageParts = e.message.split(' ');
        errorCode = messageParts[messageParts.length - 1];
      }

      setNFTPurchaseState({
        status: 'error',
        errorMessage,
        errorCode,
      });
    }
  };

  const attachListener = () => {
    window.addEventListener('message', message => {
      getLogger().warn('Warning with nft-purchase-page', { message: `magic_event: received:', ${message}` });
      if (message.origin && message.origin === sardineUrl) {
        try {
          const dataObj = JSON.parse(message.data);
          const referenceId = dataObj?.data?.referenceId;
          getLogger().info('Warning with nft-purchase-page', {
            message: 'magic_event: sardine event identified:',
            ...(dataObj as object),
          });
          setNFTPurchaseState({
            status: dataObj.status,
            referenceId,
          });
          if (completedPurchaseStatuses.includes(dataObj.status)) {
            getLogger().info(`nft-purchase-page: ${sardineUrl}`, {
              message: 'NFT Purchase: purchase completed',
              feature: 'nft-purchase',
              status: dataObj.status,
              nft: {
                blockchainNftId: nftPurchase?.nft?.blockchainNftId,
                contractAddress: nftPurchase?.nft?.contractAddress,
                recipientAddress: walletAddress,
              },
              isMainnet,
              referenceId,
            });
          } else {
            getLogger().info(`nft-purchase-page: ${sardineUrl}`, {
              message: 'NFT Purchase: purchase failed',
              feature: 'nft-purchase',
              status: dataObj.status,
              nft: {
                blockchainNftId: nftPurchase?.nft?.blockchainNftId,
                contractAddress: nftPurchase?.nft?.contractAddress,
                recipientAddress: walletAddress,
              },
              isMainnet,
              referenceId,
            });
          }
        } catch (e) {
          getLogger().error(
            `nft-purchase-page: ${sardineUrl}`,
            buildMessageContext(e, {
              message: getErrorMessage(e),
              feature: 'nft-purchase',
              isMainnet,
              status: 'unknown_error',
              nft: {
                blockchainNftId: nftPurchase?.nft?.blockchainNftId,
                contractAddress: nftPurchase?.nft?.contractAddress,
                recipientAddress: walletAddress,
              },
            }),
          );
          setNFTPurchaseState({
            status: 'error',
            errorMessage: e instanceof Error ? e.message : 'unknown error parsing sardine event data',
          });
          getLogger().error(`Error with magic_event`, buildMessageContext(e));
        }
      }
    });
  };

  const handleClose = () => {
    if (nftPurchaseStatus) {
      getLogger().warn('Warning with nft-purchse-page', {
        message: `magic_event closing modal. status:', ${nftPurchaseStatus}`,
      });
      resolveNFTPurchaseRequest();
    } else {
      cancel();
    }
  };

  const renderSardineWidget = () => {
    if (!sardineClientToken) {
      return (
        <div>
          <LoadingSpinner />
        </div>
      );
    }

    return (
      <iframe
        className={styles.nftPurchaseIframe}
        src={`${sardineUrl}?${urlParams.join('&')}`}
        onLoad={attachListener}
        id="sardine_iframe"
        height="620px"
        width="432px"
        title="Sardine"
        allow="camera *;geolocation *"
      />
    );
  };

  const renderPurchaseOutcome = () => {
    return (
      <div>
        {hasValidImageUrl && completedPurchaseStatuses.includes(nftPurchaseStatus!) && (
          <NftImage
            alt={nftPurchase?.nft?.name || 'NFT Image'}
            src={nftPurchase?.nft?.imageUrl!}
            onError={() => setHasValidImageUrl(false)}
            style={styles.nftImage}
          />
        )}
        {!hasValidImageUrl && completedPurchaseStatuses.includes(nftPurchaseStatus!) && (
          <Icon size={40} type={SuccessCheckmark} />
        )}
        {hasValidImageUrl && failedPurchaseStatuses.includes(nftPurchaseStatus!) && (
          <NftImage
            alt={nftPurchase?.nft?.name || 'NFT Image'}
            src={nftPurchase?.nft?.imageUrl!}
            onError={() => setHasValidImageUrl(false)}
            style={styles.nftImageFailed}
          />
        )}
        {!hasValidImageUrl && failedPurchaseStatuses.includes(nftPurchaseStatus!) && (
          <Icon size={40} type={ErrorIcon} />
        )}
        <Spacer size={24} orientation="vertical" />
        {completedPurchaseStatuses.includes(nftPurchaseStatus!) && (
          <div>
            <Typography.H4>Purchase successful</Typography.H4>
            <Spacer size={10} orientation="vertical" />
            <Typography.BodySmall weight="400">
              <b>{nftPurchase?.nft?.name}</b> is on its way.
            </Typography.BodySmall>
            <Typography.BodySmall weight="400">You can safely close this window.</Typography.BodySmall>
          </div>
        )}
        {failedPurchaseStatuses.includes(nftPurchaseStatus!) && (
          <div>
            <Typography.H4 color="red">Payment Failed</Typography.H4>
            <Spacer size={10} orientation="vertical" />
            <Typography.BodySmall weight="400">Your payment could not be completed.</Typography.BodySmall>
            <Typography.BodySmall weight="400">Please try again.</Typography.BodySmall>
          </div>
        )}

        <Spacer size={40} orientation="vertical" />
        <div className={styles.button}>
          <CallToAction style={{ width: '100%' }} role="link" onClick={handleClose}>
            Close
          </CallToAction>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (!LAUNCH_DARKLY_FEATURE_FLAGS['is-nft-purchase-enabled']) {
      return <Typography.BodyMedium>NFT Purchase Coming Soon!</Typography.BodyMedium>;
    }
    if (
      nftPurchaseStatus &&
      (failedPurchaseStatuses.includes(nftPurchaseStatus) || completedPurchaseStatuses.includes(nftPurchaseStatus))
    ) {
      return renderPurchaseOutcome();
    }
    return renderSardineWidget();
  };

  return (
    <>
      <ModalHeader
        rightAction={<CancelActionButton onClick={handleClose} />}
        header={
          <Typography.BodySmall weight="400" color="#77767A">
            {email}
          </Typography.BodySmall>
        }
      />
      <BasePage>
        <Spacer size={40} orientation="vertical" />
        {!showError && renderContent()}
        {showError && (
          <Typography.BodyMedium>There was an error with your purchase. Please try again.</Typography.BodyMedium>
        )}
      </BasePage>
    </>
  );
};
