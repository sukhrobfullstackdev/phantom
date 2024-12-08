import React, { useCallback, useState } from 'react';
import { Flex, Spacer, CallToAction, Typography, MonochromeIcons, Icon } from '@magiclabs/ui';
import { useAsyncEffect } from 'usable-react';
import styles from './reveal-private-key-modal.less';
import { cloneDeep } from '~/app/libs/lodash-utils';
import { i18n } from '~/app/libs/i18n';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { useDispatch } from '~/app/ui/hooks/redux-hooks';
import { useCloseUIThread, useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { isETHWalletType, isLedgerWalletType, getWalletType } from '~/app/libs/network';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { UserThunks } from '~/app/store/user/user.thunks';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { AuthThunks } from '~/app/store/auth/auth.thunks';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { revealStore } from '~/features/reveal-private-key/store';
import { setEmailForm, setPhoneNumberForLogin } from '~/features/reveal-private-key/store/reveal.actions';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';

const { Copy, EyeHidden, EyeOpen } = MonochromeIcons;

export const RevealPrivateKeyModal: React.FC = () => {
  const { navigateTo } = useControllerContext();
  const { isDefaultTheme } = useTheme();
  const dispatch = useDispatch();
  const payload = useUIThreadPayload();
  const close = useCloseUIThread('success');
  const [isLoading, setIsLoading] = useState(true);
  const [pk, setPk] = useState('');
  const [hidePrivateKey, setHidePrivateKey] = useState(true);
  const [wasCopied, setWasCopied] = useState(false);
  const showLogout = !!payload?.params[0]?.isLegacyFlow;

  const toggleHidePrivateKey = () => setHidePrivateKey(!hidePrivateKey);

  const copyWalletToClipboard = async () => {
    trackAction(AnalyticsActionType.PrivateKeyCopied);
    const textArea = document.createElement('textarea');
    textArea.value = pk;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setWasCopied(true);
    setTimeout(() => setWasCopied(false), 1200);
  };

  const logoutAndClose = useCallback(async () => {
    if (payload) {
      await dispatch(AuthThunks.logout());
      if (payload.params[0].isMWS) {
        navigateTo('mws-logout-modal');
      } else {
        await close();
        revealStore.dispatch(setEmailForm(''));
        revealStore.dispatch(setPhoneNumberForLogin(''));
      }
    }
  }, [payload, dispatch, close]);

  useAsyncEffect(async () => {
    const payloadClone = cloneDeep(payload);
    if (!payloadClone) return;
    let res = '';
    if (isETHWalletType()) {
      // Includes EVM L2s.
      res = (await dispatch(UserThunks.getPKOrSPForUser())) || '';
      if (res === 'failed') throw await sdkErrorFactories.client.userDeniedAccountAccess();
    } else if (isLedgerWalletType(getWalletType())) {
      res = (await dispatch(UserThunks.getPKOrSPForUserInLedger(payloadClone))) || '';
      if (res === 'failed') throw await sdkErrorFactories.client.userDeniedAccountAccess();
    } else {
      throw await sdkErrorFactories.magic.walletTypeNotSupport();
    }
    setPk(res);
    setIsLoading(false);
  }, [payload]);
  return (
    <Flex.Column horizontal="center">
      {!showLogout && <ModalHeader rightAction={<CancelActionButton onClick={close} />} />}
      {!isDefaultTheme('logoImage') && (
        <>
          <ThemeLogo height={69} />
          <Spacer size={20} orientation="vertical" />
        </>
      )}
      <Spacer size={8} orientation="vertical" />
      <Typography.H3 weight="700">Wallet private key</Typography.H3>
      <Spacer size={8} orientation="vertical" />
      <div className={styles.warningDescription}>
        <Typography.BodyMedium weight="400">
          Store this in a secure place that only you can access and do not share it with anyone.
        </Typography.BodyMedium>
      </div>

      <Spacer size={32} orientation="vertical" />

      {isLoading ? (
        <>
          <Spacer size={12} orientation="vertical" />
          <LoadingSpinner />
          <Spacer size={24} orientation="vertical" />
        </>
      ) : (
        <>
          <Flex.Row className={styles.rawPrivateKeyContainer}>
            <Typography.BodyMedium weight="400" style={{ filter: hidePrivateKey ? 'blur(8px)' : '' }}>
              {pk}
            </Typography.BodyMedium>
          </Flex.Row>

          <Spacer size={18} orientation="vertical" />

          <Flex.Row justifyContent="space-between" className={styles.callToActionButtonsContainer}>
            <CallToAction className={styles.callToAction} color="secondary" onClick={toggleHidePrivateKey} size="sm">
              <div className={styles.ctaIcon}>
                {hidePrivateKey ? <Icon type={EyeOpen} /> : <Icon type={EyeHidden} />}
              </div>
              {hidePrivateKey ? 'Reveal' : 'Hide'}
            </CallToAction>

            <Spacer size={16} orientation="horizontal" />
            <CallToAction className={styles.callToAction} color="secondary" onClick={copyWalletToClipboard} size="sm">
              <div className={styles.ctaIcon}>
                <Icon type={Copy} />
              </div>
              {wasCopied ? 'Copied!' : 'Copy'}
            </CallToAction>
          </Flex.Row>
        </>
      )}

      <Spacer size={24} orientation="vertical" />

      <CallToAction className={styles.primaryButton} onPress={showLogout ? logoutAndClose : close}>
        {showLogout ? i18n.reveal_private_key.log_out.toString() : i18n.generic.close.toString()}
      </CallToAction>
    </Flex.Column>
  );
};

RevealPrivateKeyModal.displayName = 'RevealPrivateKeyModal';
