import React from 'react';
import { Modal } from '../../../layout/modal';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { EnvelopeWithOpenText, SuccessCheckmark, SuccessCheckmarkDarkmode } from '~/shared/svg/magic-connect';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { ModalPageContainer } from '~/features/email-otp/components/modal-page-container';
import styles from '~/features/email-otp/components/verification-page/verification-page.less';
import { Icon, Spacer } from '@magiclabs/ui';
import { i18n } from '~/app/libs/i18n';
import { EmailWbr } from '~/app/ui/components/widgets/email-wbr';

const EmailVerificationPage = ({ email }) => {
  const theme = useTheme();

  const renderSuccessCheckmark = () => {
    return theme.theme.isDarkTheme ? SuccessCheckmarkDarkmode : SuccessCheckmark;
  };

  return (
    <>
      <ModalHeader />
      <ModalPageContainer className={styles.verificationPageWrapper}>
        <Icon color={theme.theme.color.primary.base.toString()} type={EnvelopeWithOpenText} size={44} />
        <Spacer size={24} orientation="vertical" />
        <div className={styles.sentMessageTitle}>
          {i18n.login_sms.enter_verification_code.toMarkdown()}
          <br />
          <strong>
            <EmailWbr email={email} />
          </strong>
        </div>
        <Spacer size={40} orientation="vertical" />
        <Icon aria-label={i18n.generic.success.toString()} type={renderSuccessCheckmark()} />
      </ModalPageContainer>
    </>
  );
};

export const VerifySuccessPreview: React.FC = () => {
  return (
    <Modal in noAnimation>
      <EmailVerificationPage email="hiro@magic.link" />
    </Modal>
  );
};
