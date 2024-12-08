import React, { useEffect, useMemo, useState } from 'react';
import { Flex, Icon, Linkable, Spacer, useSlotID } from '@magiclabs/ui';
import { useClipboard } from 'usable-react';
import { useSelector } from '~/app/ui/hooks/redux-hooks';
import { createGmailQueryLink, outlookLink } from '~/app/libs/link-resolvers';
import { AnalyticsActionType, trackAction } from '~/app/libs/analytics';
import { isMobileSDK } from '~/app/libs/platform';
import { useCloseUIThread } from '~/app/ui/hooks/ui-thread-hooks';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { i18n } from '~/app/libs/i18n';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner/loading-spinner';
import { DeviceVerificationPending } from '~/features/device-verification/components/device-verification-pending';

import styles from './check-email.less';
import { CopyIcon, EnvelopeWithOpenText } from '~/shared/svg/magic-connect';
import { Edit } from '~/shared/svg/email-link';
import { MagicLinkLoginType } from '~/app/store/auth/auth.reducer';
import { CheckmarkIcon } from '~/shared/svg/settings';
import { AuthFlow } from '~/features/device-verification/_rpc/device-verification';

export const CheckEmail: React.FC = () => {
  const userEmail = useSelector(state => state.Auth.userEmail);
  const magicLinkLoginType = useSelector(state => state.Auth.magicLinkLoginType);
  const securityCode = useSelector(state => state.Auth.securityOtp);
  const isDeviceRecognized = useSelector(state => state.Auth.isDeviceRecognized);
  const isSecurityOtpEnabled = useSelector(state => state.System.isSecurityOtpEnabled);
  const cancel = useCloseUIThread(sdkErrorFactories.magic.userRequestEditEmail());
  const { copy, ref } = useClipboard();

  const [isSecurityCopeCopied, setIsSecurityCodeCopied] = useState(false);

  const sniperLinkTarget = useMemo(() => {
    if (isMobileSDK()) return undefined;
    /* eslint-disable-next-line @typescript-eslint/prefer-includes */
    if (/@gmail\.com/.test(userEmail)) return createGmailQueryLink();
    if (/@(outlook|live)\.com/.test(userEmail)) return outlookLink;
    return undefined;
  }, [userEmail]);

  const headingCopy = sniperLinkTarget
    ? i18n.login.confirm_your_email.toMarkdown()
    : i18n.login.check_your_email.toMarkdown();

  useEffect(() => {
    trackAction(AnalyticsActionType.PendingModalUpdated, { userInfo: { email: userEmail }, status: 'default' });
  }, [userEmail]);

  useEffect(() => {
    if (isSecurityCopeCopied) {
      setTimeout(() => {
        setIsSecurityCodeCopied(false);
      }, 2500);
    }
  }, [isSecurityCopeCopied]);

  const { theme } = useTheme();

  const [l1, l2, l3, l4] = [useSlotID(), useSlotID(), useSlotID(), useSlotID()];

  return (
    <Flex.Column
      className={styles.CheckEmail}
      horizontal="center"
      role="dialog"
      aria-labelledby={l1}
      aria-describedby={[l2, l3, l4].join(' ')}
    >
      {isDeviceRecognized === undefined && <LoadingSpinner />}
      {isDeviceRecognized === false && (
        <DeviceVerificationPending authFactor={userEmail} authFlow={AuthFlow.MagicLink} />
      )}
      {isDeviceRecognized === true && (
        <>
          <Icon type={EnvelopeWithOpenText} color={theme.hex.primary.base} size={40} />

          <Spacer size={24} orientation="vertical" />

          <h2 id={l1} aria-hidden="true" className="fontCentered">
            {headingCopy}
          </h2>

          <Spacer size={8} orientation="vertical" />

          <Flex.Column horizontal="center" className="fontDescriptionSmall fontCentered">
            <span id={l2} aria-hidden="true">
              {i18n.login.login_using_the_magic_link_sent_to.toMarkdown()}
            </span>
            <Spacer size={4} orientation="vertical" />
            <Flex.Row vertical="center">
              <b id={l3} className={styles.email} aria-hidden="true">
                {userEmail}
              </b>

              <Spacer size={5} />

              <Linkable>
                <button onClick={cancel} aria-label="Edit your email">
                  <Flex.Item>
                    <Icon type={Edit} color={theme.hex.primary.base} />
                  </Flex.Item>
                </button>
              </Linkable>
            </Flex.Row>

            {magicLinkLoginType === MagicLinkLoginType.OriginalContext && isSecurityOtpEnabled && (
              <>
                <Spacer size={32} orientation="vertical" />
                <span id={l2} aria-hidden="true">
                  {i18n.login.then_enter_this_security_code.toMarkdown()}
                </span>
                <Spacer size={12} orientation="vertical" />
                <Flex.Row
                  className={styles.SecurityCode}
                  style={{ backgroundColor: theme.isDarkTheme ? '#252525' : '#F8F8FA', lineHeight: '27px' }}
                >
                  <div
                    ref={ref}
                    style={{
                      width: '40%',
                      fontSize: '24px',
                      lineHeight: '27px',
                      fontWeight: 500,
                      userSelect: 'text',
                    }}
                    className="fontMonospace"
                  >
                    {securityCode}
                  </div>
                  <div style={{ borderLeft: '1px solid var(--ink30)' }} />
                  {!isSecurityCopeCopied ? (
                    <Linkable style={{ width: '40%' }}>
                      <button
                        onClick={() => {
                          copy();
                          setIsSecurityCodeCopied(true);
                        }}
                        aria-label="Copy security code"
                      >
                        <Flex.Row style={{ alignItems: 'center', justifyContent: 'center' }}>
                          <Icon type={CopyIcon} color={theme.hex.primary.base} size={16} />
                          <Spacer size={8} />
                          <b>{i18n.login.copy.toString()}</b>
                        </Flex.Row>
                      </button>
                    </Linkable>
                  ) : (
                    <Flex.Row style={{ alignItems: 'center', justifyContent: 'center', height: '30px', width: '40%' }}>
                      <Icon color={theme.hex.primary.base} type={CheckmarkIcon} size={12} />
                      <Spacer size={8} />
                      {i18n.mfa.copied.toString()}!
                    </Flex.Row>
                  )}
                </Flex.Row>
              </>
            )}
          </Flex.Column>

          {sniperLinkTarget && (
            <>
              <Spacer size={20} orientation="vertical" />
              <Linkable>
                <a {...sniperLinkTarget}>
                  <b>{i18n.login.check_your_inbox.toMarkdown()}</b>
                </a>
              </Linkable>
            </>
          )}
        </>
      )}
    </Flex.Column>
  );
};
