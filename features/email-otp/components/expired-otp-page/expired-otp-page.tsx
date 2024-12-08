import React from 'react';
import { CallToAction, Flex, Icon, Spacer, useTheme } from '@magiclabs/ui';
import styles from './expired-otp-page.less';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { CancelActionButton } from '~/app/ui/components/widgets/modal-action-button';
import { ModalPageContainer } from '../modal-page-container';
import { i18n } from '~/app/libs/i18n';
import { AlarmIcon } from '~/shared/svg/auth';
import { useControllerContext } from '~/app/ui/hooks/use-controller';

export const ExpiredOtpPage = () => {
  const theme = useTheme();
  const { resetToDefaultPage } = useControllerContext();

  const handleRequestCode = () => {
    resetToDefaultPage();
  };

  return (
    <Flex.Column horizontal="center">
      <ModalHeader rightAction={<CancelActionButton />} />
      <ModalPageContainer className={styles.expiredOtpPageContainer}>
        <Icon color={theme.color.primary.base.toString()} type={AlarmIcon} size={48} />
        <Spacer size={16} orientation="vertical" />
        <div className={styles.contentWrapper}>
          <p className={styles.title}>{i18n.login.login_code_expired.toString()}</p>
          <p className={styles.description}>{i18n.login.request_new_login_code.toString()}</p>
        </div>
        <Spacer size={32} orientation="vertical" />
        <CallToAction onPress={handleRequestCode} className={styles.cta}>
          {i18n.login.request_new_code_cta.toString()}
        </CallToAction>
      </ModalPageContainer>
    </Flex.Column>
  );
};
