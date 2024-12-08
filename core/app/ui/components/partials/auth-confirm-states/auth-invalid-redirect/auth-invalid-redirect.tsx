import React, { useEffect } from 'react';
import { Flex, Icon, MonochromeIconDefinition, Spacer } from '@magiclabs/ui';
import { trackAction, AnalyticsActionType } from '~/app/libs/analytics';
import { i18n } from '~/app/libs/i18n';

const TrafficCone: MonochromeIconDefinition = {
  SVGContents: ({ fill }) => {
    return (
      <path
        d="M39.375 37.5H37.5L22.9688 0.9375C22.7344 0.390625 22.2656 0 21.6406 0H18.2812C17.6562 0 17.1875 0.390625 16.9531 0.9375L2.42188 37.5H0.625C0.234375 37.5 0 37.8125 0 38.125V39.375C0 39.7656 0.234375 40 0.625 40H39.375C39.6875 40 40 39.7656 40 39.375V38.125C40 37.8125 39.6875 37.5 39.375 37.5ZM29.8438 25H10.0781L14.0625 15H25.8594L29.8438 25ZM18.9844 2.5H20.9375L24.9219 12.5H15L18.9844 2.5ZM5.07812 37.5L9.0625 27.5H30.8594L34.8438 37.5H5.07812Z"
        {...fill}
      />
    );
  },

  viewbox: [0, 0, 40, 40],
  color: theme => theme.hex.error.base,
};

export const AuthInvalidRedirect: React.FC = () => {
  useEffect(() => {
    trackAction(AnalyticsActionType.ConfirmPageShown, { status: 'invalid-redirect' });
  }, []);

  return (
    <Flex.Column horizontal="center" aria-live="assertive">
      <Icon type={TrafficCone} />
      <Spacer size={28} orientation="vertical" />
      <h1 className="fontCentered">{i18n.login.invalid_redirect_url_header.toMarkdown()}</h1>
      <Spacer size={8} orientation="vertical" />
      <p className="fontDescription fontCentered">{i18n.login.invalid_redirect_url.toMarkdown()}</p>
      <Spacer size={8} orientation="vertical" />
      <p className="fontDescriptionSmall fontCentered">{i18n.login.you_can_close_this_window.toMarkdown()}</p>
    </Flex.Column>
  );
};

AuthInvalidRedirect.displayName = 'AuthInvalidRedirect';
