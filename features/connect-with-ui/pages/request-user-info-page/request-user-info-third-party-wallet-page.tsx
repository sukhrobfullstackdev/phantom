import { Checkbox, Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import React, { useEffect, useState } from 'react';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { BasePage } from '~/features/connect-with-ui/components/base-page/base-page';
import { CallToActionStateful } from '~/features/connect-with-ui/components/call-to-action-overload';
import { EnvelopeIcon } from '~/shared/svg/magic-connect';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { OverlapIcons } from '~/features/connect-with-ui/components/overlap-icons';
import styles from './request-user-info-page.less';
import { OverlapIconWrapper } from './request-user-info-page';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { connectStore } from '~/features/connect-with-ui/store';
import { setThirdPartyWalletRequestUserInfo } from '~/features/connect-with-ui/store/connect.actions';
import { eventData } from '~/features/connect-with-ui/utils/get-login-method';
import { store } from '~/app/store';

export const RequestUserInfoThirdPartyWalletPage = () => {
  const { navigateTo } = useControllerContext();
  const { theme } = useTheme();
  const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.hooks.useSelector(state => state.System);
  const [isChecked, setIsChecked] = useState(false);

  const thirdPartyWalletRequestUserInfoShowPrimerToggle = connectStore.hooks.useSelector(
    state => state.thirdPartyWalletRequestUserInfo?.showPrimer || false,
  );

  useEffect(() => {
    if (thirdPartyWalletRequestUserInfoShowPrimerToggle)
      navigateTo('request-user-info-third-party-wallet-prompt', eventData);
  }, []);

  useEffect(() => {
    if (!LAUNCH_DARKLY_FEATURE_FLAGS['is-request-user-info-third-party-wallet-enabled'])
      navigateTo('request-user-info', eventData);
  }, [LAUNCH_DARKLY_FEATURE_FLAGS['is-request-user-info-third-party-wallet-enabled']]);

  useEffect(() => {
    setIsChecked(thirdPartyWalletRequestUserInfoShowPrimerToggle);
  }, [thirdPartyWalletRequestUserInfoShowPrimerToggle]);

  const onClickContinue = () => {
    navigateTo('request-user-info-third-party-wallet-prompt', eventData);
  };

  const onClickShowPrimerToggle = async () => {
    await connectStore.dispatch(
      setThirdPartyWalletRequestUserInfo({
        showPrimer: !thirdPartyWalletRequestUserInfoShowPrimerToggle,
      }),
    );
  };

  return (
    <>
      <ModalHeader
        rightAction={<CancelActionButton />}
        header={<Typography.BodySmall weight="400" color={theme.color.mid.base.toString()} />}
      />
      <BasePage className={styles.requestUserInfoPage}>
        <Spacer size={32} orientation="vertical" />
        <Flex.Row justifyContent="center" style={{ width: '100%' }}>
          <OverlapIcons
            right={
              <ThemeLogo
                height="56px"
                width="56px"
                style={{
                  borderRadius: '50%',
                }}
              />
            }
            left={
              <OverlapIconWrapper>
                <Icon type={EnvelopeIcon} color={theme.hex.primary.base} />
              </OverlapIconWrapper>
            }
          />
        </Flex.Row>
        <Spacer size={24} orientation="vertical" />
        <Flex.Row className={styles.actionContainer} justifyContent="center">
          <Typography.H4 weight="700" style={{ textAlign: 'center' }}>
            {theme.appName} uses Universal Wallet
          </Typography.H4>
        </Flex.Row>
        <Spacer size={8} orientation="vertical" />
        <Typography.BodyMedium color="var(--silk65)" weight="400" style={{ textAlign: 'center' }}>
          Magic lets you securely store and optionally share your email address across different apps.
        </Typography.BodyMedium>
        <Spacer size={32} orientation="vertical" />
        <Spacer size={8} orientation="vertical" />
        <Flex.Row className={styles.actionContainer}>
          <Spacer size={16} />
          <CallToActionStateful onClick={onClickContinue} color="primary">
            Continue
          </CallToActionStateful>
        </Flex.Row>
        <Spacer size={24} orientation="vertical" />
        <Flex.Row className={styles.actionContainer} justifyContent="center">
          <Checkbox onChange={onClickShowPrimerToggle} checked={isChecked} color="primary">
            Don't show this again
          </Checkbox>
        </Flex.Row>
      </BasePage>
    </>
  );
};
