import React, { useCallback, useState } from 'react';
import { Flex, HoverActivatedTooltip, Icon, Spacer, useSlotID } from '@magiclabs/ui';
import { useAsyncEffect } from 'usable-react';
import { i18n } from '~/app/libs/i18n';
import styles from './auth-settings-page.less';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { CheckmarkIcon, TooltipIcon } from '~/shared/svg/settings';
import { AuthenticationService } from '~/app/services/authentication';
import { store } from '~/app/store';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner';
import { Divider } from '~/features/settings/components/divider';
import { getSmsRecovery } from '~/features/recovery/hooks/getSmsRecoveryHooks';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { AppNameHeader, CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { resolveUserCloseSettings } from '~/features/settings/hooks/resolveUserCloseHooks';
import { RecencyCheckService } from '~/features/recency-check/services';
import {
  setDestinationAfterVerified,
  setNeedPrimaryFactorVerification,
} from '~/features/recency-check/store/recency.actions';
import { recencyStore } from '~/features/recency-check/store';

export const AuthSettingsPage = () => {
  const { navigateTo } = useControllerContext();
  const { LAUNCH_DARKLY_FEATURE_FLAGS } = store.hooks.useSelector(state => state.System);
  const { isMfaEnabled, isMfaLoading } = useIsMfaEnabled();
  const { isSmsRecoveryEnabled, formattedPhoneNumber, isRecoveryFactorLoading } = getSmsRecovery();
  const { userID, userEmail } = store.hooks.useSelector(state => state.Auth);
  const { configuredAuthProviders } = store.hooks.useSelector(state => state.System);
  const [l1] = [useSlotID()];

  const isLoading = isMfaLoading && isRecoveryFactorLoading;
  const clientHasMfa = configuredAuthProviders.secondaryLoginProviders.includes('mfa');

  const startUpdateEmailFlow = useCallback(async () => {
    const nextPage = 'update-email-input-address';
    try {
      recencyStore.dispatch(setDestinationAfterVerified(nextPage));
      await RecencyCheckService.probeRecencyCheck(userID, userEmail);
      navigateTo(nextPage);
    } catch (e) {
      recencyStore.dispatch(setNeedPrimaryFactorVerification(true));
      navigateTo('verify-primary-factor');
    }
  }, [userID, userEmail]);

  const startRecoveryFlow = useCallback(async () => {
    const nextPage = isSmsRecoveryEnabled ? 'edit-phone-number' : 'add-phone-number';
    // recency check
    try {
      recencyStore.dispatch(setDestinationAfterVerified(nextPage));
      await RecencyCheckService.probeRecencyCheck(userID, userEmail);
      navigateTo(nextPage);
    } catch (e) {
      recencyStore.dispatch(setNeedPrimaryFactorVerification(true));
      navigateTo('verify-primary-factor');
    }
  }, [isSmsRecoveryEnabled, userID, userEmail]);

  return (
    <>
      <ModalHeader
        header={<AppNameHeader />}
        rightAction={<CancelActionButton onClick={resolveUserCloseSettings()} />}
      />
      <div className={styles.authSettingsPage}>
        <Spacer size={28} orientation="vertical" />
        <ThemeLogo height={48} />
        <Spacer size={24} orientation="vertical" />
        <h1 className={styles.title}>{i18n.settings.title.toString()}</h1>
        <Spacer size={40} orientation="vertical" />
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {userEmail && (
              <>
                {/* Email Address */}
                <Flex.Row alignItems="center" className={styles.mfaSectionTitle} aria-describedby={l1}>
                  Email Address
                  <Spacer size={8} />
                </Flex.Row>
                <Spacer size={12} orientation="vertical" />
                <Flex.Row justifyContent="space-between">
                  <span className={styles.phoneNumber}>{userEmail} </span>

                  <button className={styles.mfaLinkButton} onClick={startUpdateEmailFlow}>
                    Edit
                  </button>
                </Flex.Row>
                <Divider />

                {/* Phone Number */}
                {LAUNCH_DARKLY_FEATURE_FLAGS['is-sms-recovery-enabled'] && (
                  <>
                    <Flex.Row alignItems="center" className={styles.mfaSectionTitle} aria-describedby={l1}>
                      {i18n.recovery.phone_number.toString()}
                      <Spacer size={8} />
                    </Flex.Row>
                    <Spacer size={12} orientation="vertical" />
                    <Flex.Row justifyContent="space-between">
                      {isSmsRecoveryEnabled ? (
                        <span className={styles.phoneNumber}>{formattedPhoneNumber} </span>
                      ) : (
                        <span className={styles.phoneNumberNone}>None</span>
                      )}
                      <button className={styles.mfaLinkButton} onClick={startRecoveryFlow}>
                        {isSmsRecoveryEnabled ? 'Edit' : 'Add now'}
                      </button>
                    </Flex.Row>
                    <Divider />
                  </>
                )}
              </>
            )}
            {/* MFA */}
            {clientHasMfa && (
              <>
                <Flex.Row alignItems="center" className={styles.mfaSectionTitle} aria-describedby={l1}>
                  {i18n.settings.two_step_verification.toString()}
                  <Spacer size={8} />
                  <HoverActivatedTooltip placement="top" portalize id={l1}>
                    <HoverActivatedTooltip.Anchor
                      tabIndex={0}
                      role="tooltip"
                      aria-label={i18n.settings.two_step_verification.toString()}
                    >
                      <Icon type={TooltipIcon} />
                    </HoverActivatedTooltip.Anchor>
                    <HoverActivatedTooltip.Content
                      // because this is only way to style this -_-
                      style={{
                        fontWeight: 'normal',
                        fontSize: '14px',
                        lineHeight: '24px',
                        maxWidth: '250px',
                      }}
                    >
                      {i18n.settings.mfa_tooltip.toString()}
                    </HoverActivatedTooltip.Content>
                  </HoverActivatedTooltip>
                </Flex.Row>
                <Spacer size={12} orientation="vertical" />
                <Flex.Row justifyContent="space-between">
                  <span className={styles.mfaLabel} data-active={isMfaEnabled}>
                    {isMfaEnabled && <Icon type={CheckmarkIcon} />}
                    {isMfaEnabled ? i18n.settings.on.toString() : i18n.settings.off.toString()}
                  </span>
                  <button
                    className={styles.mfaLinkButton}
                    onClick={() => navigateTo(isMfaEnabled ? 'mfa-disable-totp' : 'mfa-prompt-authenticator')}
                  >
                    {isMfaEnabled ? i18n.settings.turn_off.toString() : i18n.settings.turn_on.toString()}
                  </button>
                </Flex.Row>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

const useIsMfaEnabled = () => {
  const userId = store.hooks.useSelector(state => state.Auth.userID);
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  useAsyncEffect(async () => {
    setIsLoading(true);
    try {
      const res = await AuthenticationService.getUser(userId);
      setIsMfaEnabled(res.data.auth_user_mfa_active);
    } catch (e) {
      getLogger().warn('Warning with getSmsRecovery', buildMessageContext(e));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  return { isMfaEnabled, isMfaLoading: isLoading };
};
