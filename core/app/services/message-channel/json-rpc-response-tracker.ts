import { JsonRpcBatchRequestPayload } from 'fortmatic';
import {
  JsonRpcRequestPayload,
  JsonRpcResponsePayload,
  MagicIncomingWindowMessage,
  MagicPayloadMethod,
  JsonRpcError,
} from 'magic-sdk';
import { getLogger } from '~/app/libs/datadog';

export interface MessageEventData {
  msgType: string;
  payload: JsonRpcRequestPayload | JsonRpcBatchRequestPayload;
  rt?: string | undefined;
  jwt?: string | undefined;
  deviceShare?: string | undefined;
  clientAppOrigin?: string;
}

interface TrackingData {
  timeReceived: number;
  method?: string;
}

export class JsonRpcResponseTracker {
  private static ensureHandleExistsOnWindow() {
    window.magic = window.magic || {};
  }

  // Static method to initialize handle on the window and to set the tracking data for an event
  static addTrackingDataToWindow(evtData: Partial<MessageEventData>): void {
    this.ensureHandleExistsOnWindow();

    if (evtData?.payload?.id && window.magic) {
      window.magic[evtData.payload.id] = {
        timeReceived: performance.now(),
        method: evtData?.payload?.method,
      };
    }
  }

  // Calculate the time taken to receive the response
  private static getTrackingTime(trackingData: TrackingData): number {
    const rawTime = performance.now() - trackingData.timeReceived;
    return parseFloat(rawTime.toFixed(2));
  }

  private static getCompletionLogMessage(
    payloadMethod: string,
    timeToSend: number,
    jsonRpcError?: JsonRpcError | null,
  ): string {
    return `Method: ${payloadMethod} / user spent ${timeToSend}ms in flow / ${
      jsonRpcError ? `JSON RPC Error: ${jsonRpcError?.message}` : 'Success'
    }`;
  }

  private static getErrorLogMessage(
    sdkInterface: string | undefined,
    payloadMethod: string | undefined,
    timeToSend: number | undefined,
  ): string {
    const sdkInterfaceString = sdkInterface ?? 'Unknown SDK interface';
    const payloadMethodString = payloadMethod ?? 'Unknown method';
    const timeToSendString = timeToSend !== undefined ? `${timeToSend}ms` : 'an unknown amount of time';

    return `Error with method: ${payloadMethodString} / ${sdkInterfaceString}, took ${timeToSendString} to fail`;
  }

  // Get the SDK Interface from the enum based on the string value
  static getSDKInterface(value: string): keyof typeof MagicPayloadMethod | null {
    const entries = Object.entries(MagicPayloadMethod) as [keyof typeof MagicPayloadMethod, string][];
    for (const [key, enumValue] of entries) {
      if (enumValue === value) {
        return key;
      }
    }
    return null;
  }

  // Retrieve the SDK interface based on the method, example: 'mc_login' -> 'Login'
  static getSdkDetails(trackingData: TrackingData): { sdkInterface: string; payloadMethod: string } {
    const sdkInterface = this.getSDKInterface(trackingData.method || '');
    const payloadMethod = trackingData.method || '';
    return { sdkInterface: sdkInterface || 'Unknown SDK interface', payloadMethod };
  }

  // Log the success message and remove the tracking data
  static logCompletion(
    response: JsonRpcResponsePayload | undefined,
    msgType: MagicIncomingWindowMessage,
    rt?: string,
    jsonRpcError?: JsonRpcError | null,
  ) {
    const responseId = response?.id;
    const validResponseId = responseId != null ? String(responseId) : null;

    if (validResponseId) {
      const trackingData = window.magic?.[validResponseId];

      if (trackingData) {
        const { payloadMethod } = this.getSdkDetails(trackingData);
        const timeToCompletion = this.getTrackingTime(trackingData);
        const logMessage = this.getCompletionLogMessage(payloadMethod, timeToCompletion, jsonRpcError);

        getLogger().info(logMessage, {
          timeToCompletion,
          response,
          msgType,
          rt,
          json_rpc_method: payloadMethod,
          jsonRpcError,
        });

        this.deleteTrackingDataByIdFromWindow(validResponseId);
      }
    } else {
      getLogger().warn('JsonRpcRepsonse has an invalid responseId:', {
        response,
        msgType,
        rt,
      });
    }
  }

  // Remove the tracking data for a response ID
  static deleteTrackingDataByIdFromWindow(responseId?: string | number | null) {
    if (responseId !== undefined && responseId !== null && window.magic?.[responseId]) {
      delete window.magic[responseId];
    }
  }
}
