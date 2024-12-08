import { useCallback } from 'react';
import { setUIThreadResponse } from '~/app/store/ui-thread/ui-thread.actions';
import { useDispatch } from '~/app/ui/hooks/redux-hooks';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';

export const useDispatchResponse = () => {
  const payload = useUIThreadPayload();
  const dispatch = useDispatch();

  const dispatchResponse = useCallback(
    (status: string) => {
      if (payload) {
        dispatch(
          setUIThreadResponse({
            status,
          }),
        );
      }
    },
    [payload],
  );

  return { dispatchResponse };
};
