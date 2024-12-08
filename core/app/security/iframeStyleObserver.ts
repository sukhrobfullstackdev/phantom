import { AnalyticsActionType, trackAction } from '~/app/libs/analytics';
import { store } from '~/app/store';
import { getLogger } from '~/app/libs/datadog';

const trackAndLogAction = (actionType: AnalyticsActionType, additionalProperties = {}): void => {
  const { clientID } = store.getState().Auth;

  const properties = { clientID, ...additionalProperties };
  trackAction(actionType, properties);
  getLogger().info(actionType, { properties });
};

const observeStyleChanges = (element: Element): void => {
  let isFirstMutation = true; // first mutation will always be logged as the initial style, we only want to track mutations that aren't the initial style
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        if (!isFirstMutation) {
          const { cssText } = (mutation.target as HTMLElement).style;
          trackAndLogAction(AnalyticsActionType.IframeStyleChanged, { cssText });
        } else {
          isFirstMutation = false;
        }
      }
    });
  });

  observer.observe(element, { attributes: true });
};

// const getIframe = () => window.parent.document.getElementsByClassName('magic-iframe')[0];

export const observeIframeStyleChange = (): void => {
  // const iframe = getIframe();
  let iframe; // TODO commented out to prevent cross origin issue, solution tbd

  if (iframe) {
    observeStyleChanges(iframe);
  } else {
    trackAndLogAction(AnalyticsActionType.IframeNotFound);
  }
};
