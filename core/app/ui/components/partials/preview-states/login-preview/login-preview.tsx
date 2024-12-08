import React from 'react';
import { Modal } from '../../../layout/modal';
import { CallToAction, Flex, Icon, Spacer, TextField, Typography } from '@magiclabs/ui';
import styles from '~/features/connect-with-ui/pages/new-login-prompt-page/new-login-prompt-page.less';
import { ThemeLogo } from '~/app/ui/components/widgets/theme-logo';
import { BadgeIcon, CheckIcon } from '~/shared/svg/magic-connect';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { i18n } from '~/app/libs/i18n';

export const LoginPreview: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Modal in>
      <Flex.Column horizontal="center">
        <Typography.BodySmall weight="400" className={styles.text} tagOverride="span">
          Sign in to&nbsp;
          <Typography.BodySmall tagOverride="span" style={{ color: `${theme.hex.primary.base}` }}>
            {theme.appName}
            <Icon type={BadgeIcon} style={{ position: 'relative', left: '3px', top: '2px' }} />
            <Icon type={CheckIcon} style={{ position: 'relative', left: '-8px', top: '-3px' }} />
          </Typography.BodySmall>
        </Typography.BodySmall>
        <Spacer size={32} orientation="vertical" />
        <ThemeLogo height={69} />
        <Spacer size={10} orientation="vertical" />
      </Flex.Column>
      <Spacer size={32} orientation="vertical" />
      <TextField placeholder="Email address" />
      <Spacer size={16} orientation="vertical" />
      <CallToAction style={{ width: '100%' }}>{i18n.pnp.login_signup.toString()}</CallToAction>
    </Modal>
  );
};
