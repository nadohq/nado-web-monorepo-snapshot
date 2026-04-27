import { BridgeKit } from '@circle-fin/bridge-kit';

/**
 * Module-level BridgeKit singleton for Circle's CCTP protocol.
 * Stateless instance that can be safely shared across the application.
 */
export const CCTP_BRIDGE_KIT = new BridgeKit();
