import { IntermediaryEvents, JsonRpcRequestPayload } from 'magic-sdk';
import { getLogger } from '~/app/libs/datadog';

// Payload ID -> Event name -> List of handlers
const eventBus = new Map<string, Map<IntermediaryEvents, Set<Function>>>();

// Set payload to map
export function on(event: IntermediaryEvents, payload: JsonRpcRequestPayload, handler: Function) {
  if (payload.id === null) {
    getLogger().error('Error with on in intermediary-event-manager: Cannot emit for payload with no ID');
    return;
  }
  const payloadId = `${payload.id}`;
  if (!eventBus.has(payloadId)) {
    eventBus.set(payloadId, new Map<IntermediaryEvents, Set<Function>>());
  }
  const payloadEvents = eventBus.get(payloadId);
  if (!payloadEvents?.get(event)) {
    payloadEvents?.set(event, new Set<Function>());
  }
  const payloadEventHandlers = payloadEvents?.get(event);
  payloadEventHandlers?.add(handler);
}

// Remove data from map
export function remove(payload: JsonRpcRequestPayload) {
  if (payload.id === null) {
    return;
  }
  eventBus.delete(`${payload.id}`);
}

// Fire function

export function emit(event: IntermediaryEvents, payloadId: string | number | null, args: any) {
  if (payloadId === null) {
    getLogger().error('Error with emit in intermediary-event-manager: Cannot emit for payload with no ID');
    return;
  }
  eventBus
    .get(`${payloadId}`)
    ?.get(event)
    ?.forEach(handler => handler(args));
}
