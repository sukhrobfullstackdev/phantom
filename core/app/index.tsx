import '~/app/libs/logging';
import { store } from '~/app/store';
import { hideOverlay, overlayGreenlight, startJsonRpcMessageChannel } from '~/app/store/system/system.actions';
import { ThemeThunks } from '~/app/store/theme/theme.thunks';
import { matchEndpoint } from '~/app/libs/match-endpoint';
import { Endpoint } from '~/server/routes/endpoint';
import { WebStorageService } from '~/app/services/web-storage';
import { isIframe } from '~/app/constants/is-iframe';
import { initLaunchDarkly } from '~/app/libs/launchDarkly/launchDarklyInit';
import { initI18nFiles } from './libs/i18n/translations';
import { getLogger } from '~/app/libs/datadog';

/**
 * A custom listener to observe Redux state for a signal to load UI.
 */
function waitForUIRequired(): Promise<boolean> {
  if ((matchEndpoint(Endpoint.Client.SendV1) || matchEndpoint(Endpoint.Client.SendLegacy)) && isIframe) {
    return new Promise(resolve => {
      const unsubscribe = store.subscribe(() => {
        if (store.getState().System.showUI) {
          unsubscribe();
          resolve(true);
        }
      });
    });
  }

  return Promise.resolve(true);
}

/**
 * Renders UI if necessary. This will lazy-load the chunks required to bootstrap
 * React.
 */
async function render() {
  await waitForUIRequired();

  const [React, ReactDOM, _, { Root }] = await Promise.all([
    import('react'),
    import('react-dom'),
    import('./index.less'),
    import('./ui/root'),
  ] as const);

  // Render the React entry-point. All initialization logic hereafter is
  // deferred to the React lifecycle.
  ReactDOM.render(<Root />, document.getElementById('root'));
}

/**
 * Start the main process. This will boostrap UI and JSON RPC listeners, if
 * necessary. We also initialize analytics, cache-bust client-side web stores,
 * and signal the Magic SDK that we are ready for events.
 */
async function main() {
  /**
   * This helps us track down CSP issues by forwarding the events to analytics.
   * Browser support for the `securitypolicyviolation` event is not universal, but
   * should be widespread enough to help us gain some context.
   */
  window.addEventListener('securitypolicyviolation', event => {
    getLogger().warn('Warning with securitypolicyviolation', { ...event });
  });

  await store.ready;
  await WebStorageService.cacheBust();
  initI18nFiles();
  await initLaunchDarkly();
  await store.dispatch(ThemeThunks.bootstrapThemeAndConfig()).catch(() => {});
  if ((matchEndpoint(Endpoint.Client.SendV1) || matchEndpoint(Endpoint.Client.SendLegacy)) && isIframe) {
    store.dispatch(hideOverlay());

    // Tell the Magic SDK that we're ready for JSON RPC events.
    store.dispatch(startJsonRpcMessageChannel());
    store.dispatch(overlayGreenlight());

    // observeIframeStyleChange();
  }

  render();
}

// Go, go, go!
main();
