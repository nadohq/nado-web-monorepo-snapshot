import { IndexerCollateralEvent } from '@nadohq/client';

export function assertEventType(
  event: IndexerCollateralEvent,
  expectedType: IndexerCollateralEvent['eventType'],
) {
  if (event.eventType !== expectedType) {
    throw new Error(
      `Expected event type '${expectedType}', got '${event.eventType}'`,
    );
  }
}
