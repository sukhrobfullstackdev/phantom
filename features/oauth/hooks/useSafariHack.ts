import React, { useState } from 'react';
import { useAsyncEffect } from 'usable-react';
import { parseCookies } from '~/app/libs/parse-cookies';
import { WebStorageService } from '~/app/services/web-storage';

export const useSafariHack = () => {
  const [canProceed, setCanProceedState] = useState(false);

  /**
   * This asynchronous effect checks for the presence of an `_oaclientmeta`
   * cookie because Safari sometimes (falsely) flags us as a "bounce tracker"
   * when we redirect from the server-side OAuth callback step to the
   * client-side ID token step.
   *
   * !!!!!
   *  NOTE: This is probably only a short-term fix. We'll need to come up with a
   *  longer-lived alternative if Safari ever breaks this approach (assume they
   *  will).
   * !!!!!
   */
  useAsyncEffect(async () => {
    if (!parseCookies()._oaclientmeta && !(await WebStorageService.data.getItem('isMissingOAuthClientMeta'))) {
      await WebStorageService.data.setItem('isMissingOAuthClientMeta', true);
      return true;
    }

    await WebStorageService.data.removeItem('isMissingOAuthClientMeta');
    return false;
  }, []).fullfilled(shouldReload => {
    if (shouldReload) {
      window.location.reload();
    } else {
      setCanProceedState(!shouldReload);
    }
  });

  return {
    isSafariHackDone: canProceed,
  };
};
