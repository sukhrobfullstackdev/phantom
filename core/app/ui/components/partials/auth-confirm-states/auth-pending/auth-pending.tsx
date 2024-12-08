import React from 'react';
import { Spacer, VisuallyHidden, Flex } from '@magiclabs/ui';
import { LoadingSpinner } from '~/app/ui/components/widgets/loading-spinner/loading-spinner';
import { i18n } from '~/app/libs/i18n';

export const AuthPending: React.FC = () => {
  return (
    <Flex.Column horizontal="center" aria-live="assertive">
      <Spacer size="10vh" orientation="vertical" />
      <LoadingSpinner />
      <Spacer size={50} orientation="vertical" />
      <VisuallyHidden>
        <h1>{i18n.login.logging_you_in.toMarkdown()}</h1>
      </VisuallyHidden>
    </Flex.Column>
  );
};

AuthPending.displayName = 'AuthPending';
