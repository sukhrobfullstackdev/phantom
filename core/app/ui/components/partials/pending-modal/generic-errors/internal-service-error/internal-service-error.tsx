import React from 'react';
import { Alert, CallToAction, Flex, Icon, Spacer } from '@magiclabs/ui';
import { useCloseUIThread } from '../../../../../hooks/ui-thread-hooks';
import { useSelector } from '../../../../../hooks/redux-hooks';
import { i18n } from '~/app/libs/i18n';
import { useTheme } from '~/app/ui/hooks/use-theme';
import { TrafficCone } from '~/shared/svg/auth';

export const InternalServiceError: React.FC = () => {
  const uiThreadError = useSelector(state => state.UIThread.error);
  const close = useCloseUIThread(uiThreadError);
  const { theme } = useTheme();

  return (
    <Flex.Column horizontal="center" style={{ padding: '0 32px' }}>
      <Icon type={TrafficCone} size={40} color={theme.hex.error.base} />

      <Spacer size={24} orientation="vertical" />

      <h2 className="fontCentered">{i18n.generic.internal_server_error.toMarkdown()}</h2>

      <Spacer size={8} orientation="vertical" />

      <div
        className="fontDescriptionSmall fontCentered"
        style={{
          width: '100%', // Fix text-wrapping on IE11
        }}
      >
        {i18n.generic.currently_working_on_getting_back_to_normal.toMarkdown()}
      </div>

      {uiThreadError?.trace_id && (
        <div
          style={{
            userSelect: 'text',
          }}
        >
          <Spacer size={24} orientation="vertical" />

          <Alert label="Trace ID" type="error">
            {uiThreadError?.trace_id}
          </Alert>
        </div>
      )}

      <Spacer size={40} orientation="vertical" />

      <CallToAction onPress={close}>{i18n.generic.close.toString()}</CallToAction>
    </Flex.Column>
  );
};
