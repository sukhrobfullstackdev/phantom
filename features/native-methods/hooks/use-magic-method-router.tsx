/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useMemo } from 'react';
import { store } from '~/app/store';
import { setUIThreadPayload, setUIThreadRenderFn } from '~/app/store/ui-thread/ui-thread.actions';
import { MagicNFTTransferPageRender } from '../pages/nft-transfer';
import { MagicWalletPageRender } from '../_rpc/mc_wallet';
import { useUIThreadPayload } from '~/app/ui/hooks/ui-thread-hooks';
import { useControllerContext } from '~/app/ui/hooks/use-controller';
import { ShowNftsPageRender } from '../_rpc/magic_show_nfts';
import { MAGIC_NFT_TRANSFER, MAGIC_SHOW_NFTS, MAGIC_WALLET } from '~/app/constants/route-methods';

export const MAGIC_METHODS = {
  MAGIC_WALLET,
  MAGIC_NFT_TRANSFER,
  MAGIC_SHOW_NFTS,
} as const;

type MagicMethod = (typeof MAGIC_METHODS)[keyof typeof MAGIC_METHODS];

const getMagicMethodPage = (method: MagicMethod) => {
  switch (method) {
    case MAGIC_METHODS.MAGIC_NFT_TRANSFER:
      return <MagicNFTTransferPageRender />;
    case MAGIC_METHODS.MAGIC_SHOW_NFTS:
      return <ShowNftsPageRender />;
    default:
      return <MagicWalletPageRender />;
  }
};

type PushParams = {
  method: MagicMethod;
  params: Record<string, any>;
  pageId?: string;
};

type BackParams = {
  pageId: string;
};

export const useMagicMethodRouter = () => {
  const payload = useUIThreadPayload();
  const { getCurrentPageId } = useControllerContext();

  const hasPrevMethod = useMemo(() => {
    const current = payload?.params[payload?.params.length - 1];
    return Boolean(current?.method);
  }, [payload]);

  const push = useCallback(
    ({ method, params, pageId }: PushParams) => {
      if (!payload) {
        throw new Error('This hook should be used inside a magic rpc method page');
      }

      const current = payload?.params[payload?.params.length - 1];
      const currentMethod = current?.method ?? payload?.method;
      const isHome = !current?.method;

      if (currentMethod !== method) {
        if (isHome) {
          store.dispatch(
            setUIThreadPayload({
              ...payload,
              params: [
                {
                  ...current,
                  pageId: getCurrentPageId(),
                },
                {
                  ...params,
                  method,
                  pageId,
                },
              ],
            }),
          );
        } else {
          const parent = payload.params[payload.params.length - 2];
          const parentLocation = parent?.location ?? payload.method;

          if (parentLocation === method) {
            store.dispatch(
              setUIThreadPayload({
                ...payload,
                params: [
                  ...payload.params.slice(0, -2),
                  {
                    ...payload.params[payload.params.length - 2],
                    ...params,
                    pageId,
                  },
                ],
              }),
            );
          } else {
            store.dispatch(
              setUIThreadPayload({
                ...payload,
                params: [
                  ...payload.params.slice(0, -1),
                  {
                    ...current,
                    pageId: getCurrentPageId(),
                  },
                  {
                    ...params,
                    method,
                  },
                ],
              }),
            );
          }
        }
      }

      store.dispatch(setUIThreadRenderFn(() => getMagicMethodPage(method)));
    },
    [payload],
  );

  const back = useCallback(
    (params?: BackParams) => {
      if (!payload) {
        throw new Error('This hook should be used inside a magic rpc method page');
      }

      if (!hasPrevMethod) {
        return;
      }

      const method: MagicMethod = payload?.params?.[payload?.params.length - 2]?.method ?? payload?.method;
      store.dispatch(
        setUIThreadPayload({
          ...payload,
          params: [
            ...payload.params.slice(0, -2),
            {
              ...payload.params[payload.params.length - 2],
              ...params,
            },
          ],
        }),
      );

      store.dispatch(setUIThreadRenderFn(() => getMagicMethodPage(method)));
    },
    [payload],
  );

  return { hasPrevMethod, push, back };
};
