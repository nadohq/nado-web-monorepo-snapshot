import { BigNumber } from 'bignumber.js';
import { atom } from 'jotai';

/**
 * Shared price input atom used for passing price values from orderbook/chart clicks to trading forms.
 * This is a message-passing atom - the form consumes and clears it immediately.
 */
export const priceInputAtom = atom<BigNumber | undefined>(undefined);

/**
 * Enable trigger queries even if 1CT is not configured. Used to view trigger orders with whitelisted wallets for other accounts when
 * debugging
 */
export const enableDebugTriggerQueriesAtom = atom<boolean>(false);
