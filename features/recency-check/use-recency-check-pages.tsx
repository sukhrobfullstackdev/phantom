import React from 'react';
import { createRoutes } from '~/app/ui/hooks/use-controller';
import { VerifyPrimaryFactorPage } from '~/features/recency-check/components/verify-primary-factor-page';

export function useRecencyCheckPages() {
  const { routes, createPageResolver } = createRoutes([
    { id: 'verify-primary-factor', content: <VerifyPrimaryFactorPage /> },
  ]);
  const resolver = createPageResolver(() => 'verify-primary-factor');
  return { routes, resolver };
}
