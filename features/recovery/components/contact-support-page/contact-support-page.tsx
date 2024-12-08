/* eslint-disable react/destructuring-assignment */

import React from 'react';
import { CallToAction, Spacer } from '@magiclabs/ui';
import styles from './contact-support-page.less';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { ModalHeader } from '~/app/ui/components/widgets/modal-header';
import { BackActionButton, CancelActionButton, AppNameHeader } from '~/app/ui/components/widgets/modal-action-button';
import { useCloseUIThread } from '~/app/ui/hooks/ui-thread-hooks';
import { sdkErrorFactories } from '~/app/libs/exceptions';

export const ContactSupportPage: React.FC = () => {
  const { theme } = useTheme();
  const { navigateBackToPrevPage } = useControllerContext();

  const close = useCloseUIThread(sdkErrorFactories.magic.userRejectAction());
  return (
    <>
      <ModalHeader
        leftAction={<BackActionButton onClick={() => navigateBackToPrevPage()} />}
        rightAction={<CancelActionButton />}
        header={<AppNameHeader />}
      />
      <div className={styles.contactSupportPage}>
        <Spacer size={32} orientation="vertical" />
        <ThemeLogo height={48} width={48} />
        <Spacer size={24} orientation="vertical" />
        <h1 className={styles.title}>Contact {theme.appName} support</h1>
        <div className={styles.description}>
          For help recovering your account, please contact the {theme.appName} support team
        </div>
        <Spacer size={32} orientation="vertical" />
        <CallToAction onClick={close} style={{ width: '100%' }}>
          Contact Support
        </CallToAction>
      </div>
    </>
  );
};
