import { EngineServerSubscriptionEvent } from '@nadohq/client';

export function getEngineSubscriptionEventData(
  event: MessageEvent,
): EngineServerSubscriptionEvent | undefined {
  try {
    const parsedData: EngineServerSubscriptionEvent = JSON.parse(event.data);
    // All events should have a type and product_id
    if (!parsedData.type || parsedData.product_id === undefined) {
      return;
    }
    return parsedData;
  } catch (e) {
    console.error(
      '[getWebSocketEventData] Failed to parse WebSocket event data',
      event,
      e,
    );
  }
}
