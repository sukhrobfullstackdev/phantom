import React from 'react';
import { Alert, CallToAction, Flex, Icon, Linkable, MonochromeIcons, Spacer } from '@magiclabs/ui';
import { useCloseUIThread } from '~/app/ui/hooks/ui-thread-hooks';
import { useSelector } from '~/app/ui/hooks/redux-hooks';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { ControlFlowErrorCode, sdkErrorFactories } from '~/app/libs/exceptions';
import { i18n } from '~/app/libs/i18n';

export const DevError: React.FC = () => {
  const { theme, isDefaultTheme } = useTheme();

  const label = isDefaultTheme('appName') ? (
    <>{i18n.generic.please_contact_app_devs_generic.toMarkdown()}</>
  ) : (
    <>{i18n.generic.please_contact_app_devs_app.toMarkdown({ appName: theme.appName })}</>
  );

  const uiThreadError = useSelector(state => state.UIThread.error);
  const close = useCloseUIThread(uiThreadError);

  let message = <>{uiThreadError?.getSDKError().message ?? sdkErrorFactories.rpc.internalError().message}</>;

  const errorCode = uiThreadError?.code;
  if (errorCode === ControlFlowErrorCode.ForbiddenForFreeDeveloperPlan) {
    message = (
      <>
        {i18n.generic.wl_sdk_not_available.toMarkdown()}
        <Linkable>
          <a href="https://www.fortmatic.com/pricing" target="_blank" rel="noopener noreferrer">
            {i18n.generic.our_pricing_page.toMarkdown()}
          </a>
        </Linkable>
      </>
    );
  }

  return (
    <Flex.Column horizontal="center" style={{ padding: '0 32px' }}>
      <Icon type={MonochromeIcons.LaptopWithCode} size={40} color={theme.hex.primary.base} />

      <Spacer size={24} orientation="vertical" />

      <h2 className="fontCentered">{i18n.generic.app_error.toMarkdown()}</h2>

      <Spacer size={8} orientation="vertical" />

      <div className="fontDescriptionSmall fontCentered">{label}</div>

      <Spacer size={24} orientation="vertical" />

      <Alert label={i18n.generic.details.toString()} type="error">
        {message}
      </Alert>

      <Spacer size={40} orientation="vertical" />

      <CallToAction onPress={close}>{i18n.generic.close.toString()}</CallToAction>
    </Flex.Column>
  );
};
