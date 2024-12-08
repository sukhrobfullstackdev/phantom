import { createTheme } from '@magiclabs/ui';
import { Endpoint } from '~/server/routes/endpoint';
import { isValidColor } from '~/shared/libs/validators';
import { Options } from '../../libs/query-params';
import { defaultTheme } from '../../libs/theme';
import { store } from '../../store';
import { setTheme } from '../../store/theme/theme.actions';

interface MessageEventData {
  msgType: 'update';
  payload: string;
}

interface IncomingMessageEvent extends MessageEvent {
  data: MessageEventData;
}

/**
 * Parse `evt.data` and cast to the expected object type.
 */
function parseEventData(data: any): Partial<Options[typeof Endpoint.Client.PreviewV1]> {
  try {
    return JSON.parse(decodeURI(data?.payload));
  } catch {
    return {};
  }
}

/**
 * The event listener that will be attached to the `Window.onmessage` event.
 * This is the entry point for handling incoming JSON RPC payloads.
 */
export async function handle(evt: IncomingMessageEvent) {
  if (evt.data?.msgType === 'update') {
    const evtData = parseEventData(evt.data);

    const theme = createTheme({
      ...defaultTheme.config,
      primaryColor: isValidColor(`#${evtData.color}`) ? `#${evtData.color}` : defaultTheme.hex.primary.base,
      type: evtData.themeType,
    });

    store.dispatch(
      setTheme({
        ...theme,
        key: `${theme.key}:customBranchType:${evtData.customBrandingType}`,

        customBrandingType: evtData.customBrandingType ?? defaultTheme.customBrandingType,
        logoImage: evtData.logoImage ?? defaultTheme.logoImage,
        appName: evtData.appName ?? defaultTheme.appName,
        isPreview: true,
      }),
    );
  }
}

export function postReady() {
  const previewType = window.location.pathname;
  const msgType = 'PreviewChannelReady';
  window.parent.postMessage({ msgType, previewType }, '*');
}
