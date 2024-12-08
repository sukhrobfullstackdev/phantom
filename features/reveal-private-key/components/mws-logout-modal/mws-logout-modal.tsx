import React from 'react';
import { Flex, Icon, Spacer } from '@magiclabs/ui';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { i18n } from '~/app/libs/i18n';
import { SuccessCheckmark } from '~/shared/svg/magic-connect';

export const MwsLogoutModal: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Flex.Column horizontal="center">
      <Icon type={SuccessCheckmark} size={40} color={theme.hex.primary.base} />
      <Spacer size={24} orientation="vertical" />
      <h2>Logout Successful</h2>
      <Spacer size={8} orientation="vertical" />
      <div className="fontDescriptionSmall fontCentered">{i18n.login.redirect_login_complete_content.toMarkdown()}</div>
    </Flex.Column>
  );
};
