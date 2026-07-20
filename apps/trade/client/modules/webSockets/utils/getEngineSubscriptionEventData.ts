import { EngineServerSubscriptionEvent } from '@nadohq/client';

export function getEngineSubscriptionEventData(
  event: MessageEvent,
): EngineServerSubscriptionEvent | undefined {
  try {
    const parsedData: EngineServerSubscriptionEvent = JSON.parse(event.data);
    if (!parsedData.type) {
      return;
    }
    // Most engine subscription events are per-product and include `product_id`.
    // Full-market snapshots (e.g. `all_bbo`) do not, so we only require
    // `product_id` for non-`all_bbo` events.
    if (parsedData.type !== 'all_bbo' && parsedData.product_id === undefined) {
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
