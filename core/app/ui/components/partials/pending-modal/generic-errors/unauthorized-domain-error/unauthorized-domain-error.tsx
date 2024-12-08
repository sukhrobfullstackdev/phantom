import React from 'react';
import { CallToAction, Flex, Icon, Spacer, Typography } from '@magiclabs/ui';
import { useCloseUIThread, useEventOrigin, useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { useSelector } from '~/app/ui/hooks/redux-hooks';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { i18n } from '~/app/libs/i18n';
import { Forbidden } from '~/shared/svg/generic';
import { sdkErrorFactories } from '~/app/libs/exceptions';
import { isSdkVersionGreaterThanOrEqualTo } from '~/app/libs/is-version-greater-than';

export const UnauthorizedDomainError: React.FC = () => {
  const { theme } = useTheme();
  const payload = useUIThreadPayload();

  const uiThreadError = useSelector(state => state.UIThread.error);
  const close = useCloseUIThread(uiThreadError, true);
  const eventOrigin = useEventOrigin();

  const message = uiThreadError?.getSDKError().message ?? sdkErrorFactories.rpc.internalError().message;

  const domainPattern = /https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z0-9-]+/g;
  const domains = message.match(domainPattern);

  const handleCloseButton = async () => {
    const VERSION = '14.0.0';
    if (payload && isSdkVersionGreaterThanOrEqualTo(VERSION)) {
      await sdkErrorFactories.client.requestNotAuthorizedForDomainInRelayer().sdkReject(payload);
    }
    close();
  };

  return (
    <Flex.Column horizontal="center" style={{ padding: '0 32px' }}>
      <Icon type={Forbidden} />
      <Spacer size={24} orientation="vertical" />

      <h2 className="fontCentered">Unauthorized domain</h2>

      <Spacer size={8} orientation="vertical" />
      <div className="fontDescriptionSmall fontCentered">
        {theme.appName} has not approved access for <b>{domains ? domains[1] : eventOrigin ?? 'the current domain'}</b>
      </div>

      <Spacer size={8} orientation="vertical" />

      <Typography.BodySmall>
        <a
          href="https://magic.link/docs/authentication/security/allowlists/domain-allowlist"
          target="_blank"
          rel="noreferrer"
          color={theme.isDarkTheme ? 'var(--magic30)' : 'var(--magic50)'}
        >
          Learn more
        </a>
      </Typography.BodySmall>

      <Spacer size={36} orientation="vertical" />
      <CallToAction size="md" onPress={handleCloseButton} style={{ width: '100%' }}>
        {i18n.generic.close.toString()}
      </CallToAction>
    </Flex.Column>
  );
};
