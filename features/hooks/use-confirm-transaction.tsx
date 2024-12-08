import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import qs from 'qs';
import { getApiKey } from '~/app/libs/api-key';
import { ConfirmActionService } from '~/app/services/confirm-action';
import { ConfirmActionType } from '~/features/confirm-action/types';
import { useUserMetadata } from '~/features/native-methods/hooks/useUserMetadata';
import { isEmpty } from '~/app/libs/lodash-utils';
import { isMobileSafariOrFirefox } from '~/features/native-methods/utils/ua-parser';
import { wait } from '~/shared/libs/wait';
import { getOptionsFromEndpoint } from '~/app/libs/query-params';
import { Endpoint } from '~/server/routes/endpoint';
import { useFeatureFlags } from '~/features/hooks/use-feature-flags';

const MAXIMUM_RETRY_COUNT = 3;

type Params = {
  actionType: ConfirmActionType;
  payload: any;
};

export const useConfirmTransaction = () => {
  const { userId } = useUserMetadata();

  const [popup, setPopup] = useState<Window | null>(null);
  const [redirectUrl, setRedirectUrl] = useState('');

  const { isTransactionConfirmationEnabled } = useFeatureFlags();

  const { mutateAsync: confirmTransaction } = useMutation({
    mutationFn: async ({ actionType, payload }: Params) => {
      if (!isTransactionConfirmationEnabled) {
        return true;
      }

      const {
        data: { confirmation_id, temporary_confirmation_token: tct },
      } = await ConfirmActionService.beginConfirm(userId, actionType, {
        ...payload,
      });

      let opened: Window | null = null;
      if (isMobileSafariOrFirefox()) {
        setTimeout(() => {
          opened = window.open();
        });
        await wait(700);
      } else {
        opened = window.open('', '_blank');
      }

      if (!opened) {
        throw new Error('Cannot open popup');
      }
      setPopup(opened);

      const { ETH_NETWORK } = getOptionsFromEndpoint(Endpoint.Client.SendLegacy);

      setRedirectUrl(
        `${window.origin}/confirm-action?${qs.stringify({
          ak: getApiKey(),
          tct,
          ETH_NETWORK,
        })}`,
      );

      return new Promise<boolean>(resolve => {
        const timeoutId = setTimeout(() => {
          console.warn("Didn't get confirmation in time");
          clearInterval(intervalId);
          resolve(false);
          // See the default expiration time on https://github.com/magiclabs/fortmatic/blob/master/fortmatic/core/handlers/auth_user_action_confirmation.py
        }, 64 * 1000);

        let retry = 0;
        const intervalId = setInterval(async () => {
          const res = await ConfirmActionService.getConfirmStatus(userId, confirmation_id);

          if (opened?.closed) {
            retry++;
          }

          if (res.data.status === 'PENDING') {
            if (retry > MAXIMUM_RETRY_COUNT) {
              clearInterval(intervalId);
              clearTimeout(timeoutId);
              resolve(false);
            }
            return;
          }

          if (res.data.status === 'REJECTED') {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
            resolve(false);
            return;
          }

          if (res.data.status === 'APPROVED') {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
            resolve(true);
          }
        }, 1000);
      });
    },
    onSettled: () => {
      setPopup(null);
      setRedirectUrl('');
    },
  });

  useEffect(() => {
    if (!isTransactionConfirmationEnabled) {
      return;
    }

    if (popup && !isEmpty(redirectUrl)) {
      popup.location = redirectUrl;
    }
  }, [redirectUrl, popup]);

  return { confirmTransaction };
};
