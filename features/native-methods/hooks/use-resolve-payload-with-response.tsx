import { useCallback } from 'react';
import { resolvePayload } from '~/app/rpc/utils';
import { useUIThreadPayload, useUIThreadResponse } from '~/app/ui/hooks/ui-thread-hooks';

export const useResolvePayloadWithResponse = () => {
  const payload = useUIThreadPayload();
  const response = useUIThreadResponse();

  const resolvePayloadWithResponse = useCallback(() => {
    if (payload && response) {
      resolvePayload(payload, response);
    }
  }, [payload, response]);

  return { resolvePayloadWithResponse };
};
