import React, { useCallback, useState } from 'react';
import { CallToAction, Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { TrackingButton } from '~/features/connect-with-ui/components/tracking-button';
import { KeyIcon } from '~/shared/svg/reveal-private-key';
import { WalletExportAgreementItem } from '../wallet-export-agreement-item';
import styles from './agreement-view-modal.less';
import { AnalyticsActionType } from '~/app/libs/analytics';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { store } from '~/app/store';
import { useCloseUIThread, useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { useDispatch } from '~/app/ui/hooks/redux-hooks';
import { AuthThunks } from '~/app/store/auth/auth.thunks';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { i18n } from '~/app/libs/i18n';
import { revealStore } from '../../store';
import { setEmailForm, setPhoneNumberForLogin } from '../../store/reveal.actions';

export const AgreementViewModal: React.FC = () => {
  const { navigateTo } = useControllerContext();
  const [isCheckboxOneChecked, setIsCheckboxOneChecked] = useState<boolean>(false);
  const [isCheckboxTwoChecked, setIsCheckboxTwoChecked] = useState<boolean>(false);
  const [isCheckboxThreeChecked, setIsCheckboxThreeChecked] = useState<boolean>(false);
  const dispatch = useDispatch();
  const payload = useUIThreadPayload();
  const close = useCloseUIThread('success');
  const { theme } = useTheme();
  const publicAddress = store.hooks.useSelector(state => state.Auth.userKeys.publicAddress);
  const showLogout = !!payload?.params[0]?.isLegacyFlow;

  const shortenWalletAddress = () => {
    if (!!publicAddress && publicAddress.length > 45) {
      return `${publicAddress.slice(0, 15)}...${publicAddress.slice(-15)}`;
    }
    return publicAddress;
  };

  const logoutAndClose = useCallback(async () => {
    if (payload) {
      await dispatch(AuthThunks.logout());
      if (payload.params[0].isMWS) {
        navigateTo('mws-logout-view');
      } else {
        await close();
        revealStore.dispatch(setEmailForm(''));
        revealStore.dispatch(setPhoneNumberForLogin(''));
      }
    }
  }, [payload, dispatch, close]);

  return (
    <>
      {/* Shows logout button for legacy reveal flow */}
      {showLogout && (
        <button className={styles.logoutButton} onClick={logoutAndClose} aria-label={i18n.generic.close.toString()}>
          Log out
        </button>
      )}
      <BasePage>
        {!showLogout && <ModalHeader rightAction={<CancelActionButton onClick={close} />} />}
        <Flex.Column horizontal="center">
          <Icon type={KeyIcon} color={theme.color.primary.base.toString()} />
        </Flex.Column>
        <Spacer size={30} orientation="vertical" />
        <Typography.H4 className={styles.header}>Before you continue</Typography.H4>
        <Spacer size={8} orientation="vertical" />
        <Typography.BodySmall weight="500">
          By revealing the private key for
          <br />
          <span className={styles.address}>{shortenWalletAddress()}</span>
          <br />
          you agree to the following:
        </Typography.BodySmall>
        <Spacer size={24} orientation="vertical" />
        <WalletExportAgreementItem
          isChecked={isCheckboxOneChecked}
          setIsChecked={setIsCheckboxOneChecked}
          content={[
            'You have read and agreed to ',
            <a
              href="https://magic.link/legal/terms-of-service"
              target="_blank"
              rel="noreferrer"
              style={{ color: `${theme.config.primaryColor}` }}
              className={styles.termsOfServiceLink}
              key="termsOfServiceLink"
            >
              Magic's Terms of Service
            </a>,
            ', including the risks related to owning your private key disclosed in the Terms of Service.',
          ]}
        />
        <Spacer size={14} orientation="vertical" />
        <WalletExportAgreementItem
          isChecked={isCheckboxTwoChecked}
          setIsChecked={setIsCheckboxTwoChecked}
          content="You shall be responsible for the management and security of this key and any assets associated with this key, and that Magic cannot help you recover, access or store your raw private key on your behalf."
        />
        <Spacer size={14} orientation="vertical" />
        <WalletExportAgreementItem
          isChecked={isCheckboxThreeChecked}
          setIsChecked={setIsCheckboxThreeChecked}
          content="Magic is not responsible for and will not provide customer service for any other wallet software you may use this private key with, and that Magic does not represent that any other software or hardware will be compatible with or protect your private key."
        />
        <Spacer size={32} orientation="vertical" />
        <TrackingButton actionName={AnalyticsActionType.RevealPrivateKeyClicked}>
          <CallToAction
            color="primary"
            style={{ width: '100%' }}
            disabled={!isCheckboxOneChecked || !isCheckboxTwoChecked || !isCheckboxThreeChecked}
            onClick={() => navigateTo('reveal-private-key-modal')}
          >
            Reveal private key
          </CallToAction>
        </TrackingButton>
        <Spacer size={15} orientation="vertical" />
      </BasePage>
    </>
  );
};
