import React from 'react';
import {
  ControlFlowErrorCode,
  developerControlFlowErrors,
  endUserControlFlowErrors,
  internalControlFlowErrors,
  requestNotAuthorizedErrors,
  userAccessControlFlowErrors,
} from '~/app/libs/exceptions';
import { useActiveControlFlowErrorCode } from '~/app/ui/hooks/ui-thread-hooks';
import { useController } from '~/app/ui/hooks/use-controller';

// Views
import { DevError } from './dev-error';
import { EndUserError } from './end-user-error';
import { InternalServiceError } from './internal-service-error';
import { UserAccessError } from './user-access-error';
import { UnauthorizedDomainError } from '~/app/ui/components/partials/pending-modal/generic-errors/unauthorized-domain-error/unauthorized-domain-error';

/**
 * Define generic error pages & route reducer.
 */
export function useGenericErrorPages(globalError?: ControlFlowErrorCode) {
  const globalErrorDefault = useActiveControlFlowErrorCode();

  const { routes, createPageResolver } = useController([
    // Generic error pages
    { id: 'generic-error-end-user-error', content: <EndUserError /> },
    { id: 'generic-error-dev-error', content: <DevError /> },
    { id: 'generic-error-internal-service-error', content: <InternalServiceError /> },
    { id: 'generic-error-user-access-error', content: <UserAccessError /> },
    { id: 'unauthorized-domain-error', content: <UnauthorizedDomainError /> },
  ]);

  const resolver = createPageResolver(() => {
    // Generic error cases are a separate concept, so we should abstract this
    // into another component. Leaving it here for now.
    if (internalControlFlowErrors.includes(globalError || globalErrorDefault!)) {
      return 'generic-error-internal-service-error';
    }

    if (endUserControlFlowErrors.includes(globalError || globalErrorDefault!)) {
      return 'generic-error-end-user-error';
    }

    if (userAccessControlFlowErrors.includes(globalError || globalErrorDefault!)) {
      return 'generic-error-user-access-error';
    }

    if (developerControlFlowErrors.includes(globalError || globalErrorDefault!)) {
      return 'generic-error-dev-error';
    }

    if (requestNotAuthorizedErrors.includes(globalError || globalErrorDefault!)) {
      return 'unauthorized-domain-error';
    }
  });

  return { routes, resolver };
}
