import React, { useEffect, useState } from 'react';
import { Flex, Spacer, Typography } from '@magiclabs/ui';
import { useAsyncEffect } from 'usable-react';
import styles from './reveal-wallet-credentials-modal.less';
import { useDispatch } from '~/app/ui/hooks/redux-hooks';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { cloneDeep } from '~/app/libs/lodash-utils';
import { getWalletType, isETHWalletType, isLedgerWalletType } from '~/app/libs/network';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { CredentialType, UserThunks } from '~/app/store/user/user.thunks';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { resolvePayload } from '~/app/rpc/utils';
import {
  WCSVGClose,
  WCSVGExclaimation,
  WCSVGWCCopiedIcon,
  WCSVGWCCopyIcon,
  WCSVGWCHideIcon,
  WCSVGWCRevealIcon,
} from './wc-assets/svg';

const CloseButton = () => {
  const payload = useUIThreadPayload();
  const handleCloseButton = () => {
    if (payload) return resolvePayload(payload, true);
  };
  return (
    <button
      onClick={handleCloseButton}
      style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '0' }}
    >
      <WCSVGClose />
    </button>
  );
};

const DisplayWalletCredentials = ({ rawWalletCredentials }) => {
  const [walletCredentialsList, setWalletCredentialsList] = useState([] as string[]);
  useEffect(() => {
    setWalletCredentialsList(rawWalletCredentials.split(' ') as string[]);
  }, [rawWalletCredentials]);

  // if the length of the credentials list is 1, then it is a PK, otherwise it is a seed phrase.
  if (walletCredentialsList.length === 1)
    return <div style={{ margin: '24px', lineHeight: '21px', userSelect: 'text' }}>{walletCredentialsList[0]}</div>;
  return (
    <ul className={styles.flexContainer}>
      {walletCredentialsList.map((word, i) => (
        <li key={word}>
          <Flex.Row style={{ marginBottom: '12px' }}>
            <div
              style={{ color: 'var(--ink50)', width: '24px', textAlign: 'end', marginRight: '8px', userSelect: 'none' }}
            >
              {i + 1}
            </div>
            <div style={{ fontWeight: 500 }}>{word}</div>
          </Flex.Row>
        </li>
      ))}
    </ul>
  );
};

export const RevealWalletCredentialsModal: React.FC<{ credentialType?: CredentialType }> = ({
  credentialType = CredentialType.SeedPhrase,
}) => {
  const dispatch = useDispatch();
  const payload = useUIThreadPayload();
  const [isLoading, setIsLoading] = useState(true);
  const [walletCredentials, setWalletCredentials] = useState(''); // PK or SP
  const [hideSP, setHideSP] = useState(true);
  const [wasCopied, setWasCopied] = useState(false);

  const toggleHideWalletCredentials = () => setHideSP(!hideSP);
  const copyWalletToClipboard = async () => {
    trackAction(
      credentialType === CredentialType.SeedPhrase
        ? AnalyticsActionType.SeedPhraseyCopied
        : AnalyticsActionType.PrivateKeyCopied,
    );
    const textarea = document.createElement('textarea');
    textarea.value = walletCredentials;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    setWasCopied(true);
    setTimeout(() => setWasCopied(false), 1200);
  };

  useEffect(() => {
    /* Override Global Modal Styling for just this one screen for wallet connect */
    const element = document.getElementById('magic-modal');
    if (element) {
      element.style.background = '#191A1A';
      element.style.boxShadow = 'none';
      element.style.borderRadius = '36px';
      element.style.padding = '16px 0';
    }
  }, []);

  useAsyncEffect(async () => {
    if (!payload) return;
    let res = '';
    if (isETHWalletType()) {
      res = (await dispatch(UserThunks.getPKOrSPForUser(credentialType))) || '';
      if (res === 'failed') throw await sdkErrorFactories.client.userDeniedAccountAccess();
    } else if (isLedgerWalletType(payload?.params[0]?.walletType)) {
      const payloadClone = cloneDeep(payload);
      res = (await dispatch(UserThunks.getPKOrSPForUserInLedger(payloadClone, credentialType))) || '';
      if (res === 'failed') throw await sdkErrorFactories.client.userDeniedAccountAccess();
    } else throw await sdkErrorFactories.magic.walletTypeNotSupport();
    trackAction(
      credentialType === CredentialType.SeedPhrase
        ? AnalyticsActionType.SeedPhraseRevealed
        : AnalyticsActionType.RevealPrivateKeyClicked,
      {
        walletType: getWalletType(),
      },
    );
    setWalletCredentials(res);
    setIsLoading(false);
  }, [payload]);
  return (
    <>
      <ModalHeader rightAction={<CloseButton />} />
      <Flex.Column horizontal="center" style={{ margin: '0 -32px -24px -32px' }}>
        <Flex.Row
          alignItems="center"
          justifyContent="center"
          style={{ height: '64px', width: '64px', borderRadius: '20px', backgroundColor: 'rgba(255,166,76,0.1)' }}
        >
          <WCSVGExclaimation />
        </Flex.Row>
        <Spacer size={18} orientation="vertical" />
        <Typography.H3 weight="600" style={{ fontSize: '20px', color: '#E4E7E7' }}>
          {credentialType === CredentialType.SeedPhrase ? 'Recovery Phrase' : 'Wallet Private Key'}
        </Typography.H3>
        <Spacer size={8} orientation="vertical" />
        <Typography.BodyMedium
          weight="500"
          style={{
            textAlign: 'center',
            fontSize: '16px',
            color: '#949E9E',
            margin: '0 32px',
            letterSpacing: '-0.03em',
          }}
        >
          Please only reveal your {credentialType === CredentialType.SeedPhrase ? 'recovery phrase ' : 'private key '}
          privately. Store it in a secure place that only you have access.{' '}
        </Typography.BodyMedium>
        <Spacer size={32} orientation="vertical" />
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            <Flex.Row className={styles.walletCredentialsContainer}>
              <div style={{ filter: hideSP ? 'blur(8px)' : '', width: '100%' }}>
                <DisplayWalletCredentials rawWalletCredentials={walletCredentials} />
              </div>
            </Flex.Row>
            <Spacer size={22} orientation="vertical" />
            <Flex.Column justifyContent="space-between" style={{ width: '90%' }}>
              <button className={`${styles.walletConnectCTA} ${styles.copyCTA}`} onClick={copyWalletToClipboard}>
                {wasCopied ? <WCSVGWCCopiedIcon /> : <WCSVGWCCopyIcon />}
                <div style={{ marginLeft: '4px' }}>{wasCopied ? 'Copied' : 'Copy'}</div>
              </button>
              <Spacer size={12} orientation="vertical" />
              <button
                className={`${styles.walletConnectCTA} ${hideSP ? styles.hideCTA : styles.revealCTA}`}
                onClick={toggleHideWalletCredentials}
              >
                {hideSP ? <WCSVGWCHideIcon /> : <WCSVGWCRevealIcon />}
                <div style={{ marginLeft: '4px' }}>{hideSP ? 'Reveal' : 'Hide'}</div>
              </button>
            </Flex.Column>
          </>
        )}
      </Flex.Column>
    </>
  );
};

RevealWalletCredentialsModal.displayName = 'RevealWalletCredentialsModal';
