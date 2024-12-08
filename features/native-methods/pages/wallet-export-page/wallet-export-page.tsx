import { CallToAction, Flex, Spacer, Typography, MonochromeIcons } from '@magiclabs/ui';
import React, { useState } from 'react';
import { useAsyncEffect, useClipboard } from 'usable-react';
import { getUserInfo } from '~/app/services/authentication/get-user-info';
import { store } from '~/app/store';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { BackActionButton, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { sendSecretPhraseViewedEmail } from '~/features/connect-with-ui/utils/send-secret-phrase-viewed-email';
import {
  PRIVATE_KEY,
  secretPhraseOrPrivateKeyLabel,
} from '~/features/connect-with-ui/utils/secret-phrase-or-private-key';
import styles from './wallet-export-page.less';
import { getWalletType } from '~/app/libs/network';
import { getLogger } from '~/app/libs/datadog';
import { buildMessageContext } from '~/app/libs/analytics-datadog-helpers';
import { getUserKeysFromUserInfo } from '~/app/libs/get-user-keys-from-user-info';
import { DkmsService } from '~/app/services/dkms';

const { Copy, EyeHidden, EyeOpen } = MonochromeIcons;

export const WalletExportPage = () => {
  const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.hooks.useSelector(state => state.System);
  const { activeAuthWallet } = store.hooks.useSelector(state => state.User);
  const { navigateTo } = useControllerContext();
  const [hidePrivateKey, setHidePrivateKey] = useState(true);
  const [walletExportData, setWalletExportData] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { copy } = useClipboard();
  const [wasCopied, setWasCopied] = useState(false);
  const keyTypeLabel = secretPhraseOrPrivateKeyLabel();
  const isUsingPrivateKey = keyTypeLabel === PRIVATE_KEY;

  useAsyncEffect(async () => {
    const { userID, delegatedWalletInfo, deviceShare } = store.getState().Auth;
    const { systemClockOffset, walletSecretMangementInfo } = store.getState().System;
    const userData = (await getUserInfo(userID, getWalletType())).data;
    const userKeys = getUserKeysFromUserInfo(userData);
    let rawKey = '';

    if (!isUsingPrivateKey) {
      if (!userKeys.encryptedSeedPhrase && !userKeys.encryptedMagicSeedPhraseShare) {
        getLogger().error('Error with encrypted key', buildMessageContext({ message: 'Missing seed phrase' } as Error));
        return;
      }
      rawKey = await DkmsService.reconstructWalletMnemonic(
        userKeys,
        getWalletType(),
        walletSecretMangementInfo,
        delegatedWalletInfo,
        systemClockOffset,
      );
    } else {
      if (!userKeys.encryptedPrivateAddress && !userKeys.encryptedMagicPrivateAddressShare) {
        getLogger().error('Error with encrypted key', buildMessageContext({ message: 'Missing private key' } as Error));
        return;
      }
      rawKey = await DkmsService.reconstructWalletPk(
        userKeys,
        getWalletType(),
        walletSecretMangementInfo,
        delegatedWalletInfo,
        deviceShare,
        systemClockOffset,
      );
    }

    setWalletExportData(rawKey);
    if (LAUNCH_DARKLY_FEATURE_FLAGS['is-third-party-wallets-enabled']) {
      try {
        if (!userKeys.walletId) return;
        sendSecretPhraseViewedEmail(isUsingPrivateKey, userID, userKeys.walletId, !!activeAuthWallet);
      } catch (e) {
        getLogger().error('Error with sendSecretPhraseViewedEmail', buildMessageContext(e));
      }
    }
  }, []).fullfilled(() => {
    setIsLoading(false);
  });

  const navHome = () => navigateTo('wallet-account-info', eventData);
  const toggleHidePrivateKey = () => setHidePrivateKey(!hidePrivateKey);
  const copyWalletToClipboard = () => {
    trackAction(AnalyticsActionType.SeedPhraseCopied, eventData);
    copy(walletExportData);
    setWasCopied(true);
    setTimeout(() => setWasCopied(false), 1200);
  };

  return (
    <>
      <ModalHeader leftAction={<BackActionButton onClick={navHome} />} rightAction={<CancelActionButton />} />
      <BasePage>
        <Spacer size={16} orientation="vertical" />
        <Typography.H4 weight="700" color="inherit">
          Wallet {keyTypeLabel}
        </Typography.H4>
        <Spacer size={8} orientation="vertical" />
        <Typography.BodySmall weight="400" color="inherit">
          Back up {!isUsingPrivateKey ? 'in the correct order ' : null}and store it in a secure place that only you can
          access
        </Typography.BodySmall>
        <Spacer size={32} orientation="vertical" />
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {isUsingPrivateKey && (
              <Flex.Row className={styles.rawPrivateKeyContainer}>
                <Typography.BodyMedium weight="400" style={{ filter: hidePrivateKey ? 'blur(8px)' : '' }}>
                  {walletExportData}
                </Typography.BodyMedium>
              </Flex.Row>
            )}
            {!isUsingPrivateKey && (
              <Flex.Row className={styles.secretPhraseContainer}>
                <div className={styles.secretPhrase} style={{ filter: hidePrivateKey ? 'blur(8px)' : '' }}>
                  {walletExportData.split(' ').map((word, i) => {
                    return (
                      <Typography.BodySmall weight="400" key={word} style={{ paddingBottom: '5px' }}>
                        <span style={{ color: '#77767A' }}>{i + 1}</span> {word}
                      </Typography.BodySmall>
                    );
                  })}
                </div>
              </Flex.Row>
            )}
            <Spacer size={16} orientation="vertical" />
            <Flex.Row justifyContent="space-between" className={styles.callToActionButtonsContainer}>
              <CallToAction
                className={styles.callToAction}
                color="secondary"
                leadingIcon={hidePrivateKey ? EyeOpen : EyeHidden}
                onClick={toggleHidePrivateKey}
                size="sm"
              >
                {hidePrivateKey ? 'Reveal' : 'Hide'}
              </CallToAction>
              <Spacer size={16} orientation="horizontal" />
              <CallToAction
                className={styles.callToAction}
                color="secondary"
                leadingIcon={Copy}
                onClick={copyWalletToClipboard}
                size="sm"
              >
                {wasCopied ? 'Copied!' : 'Copy'}
              </CallToAction>
            </Flex.Row>
          </>
        )}
        <Spacer size={32} orientation="vertical" />
        <CallToAction color="primary" onClick={navHome}>
          Done
        </CallToAction>
      </BasePage>
    </>
  );
};
