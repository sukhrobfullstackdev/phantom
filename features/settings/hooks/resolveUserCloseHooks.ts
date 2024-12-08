import { useCallback } from 'react';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { store } from '~/app/store';
import { GetMetadataThunks } from '~/features/get-metadata/store/get-metadata.thunks';
import { resolvePayload } from '~/app/rpc/utils';

export const resolveUserCloseSettings = (): (() => Promise<void>) => {
  const { resetToDefaultPage } = useControllerContext();

  return useCallback(async () => {
    const { payload } = store.getState().UIThread;

    if (!payload) {
      return Promise.reject(new Error('No payload on UI thread'));
    }

    const userMetadata = await store.dispatch(GetMetadataThunks.formatMagicUserMetadata());
    resetToDefaultPage();
    await resolvePayload(payload, userMetadata);
  }, [resetToDefaultPage]);
};
