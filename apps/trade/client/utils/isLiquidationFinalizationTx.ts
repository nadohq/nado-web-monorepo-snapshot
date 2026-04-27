import { NadoTx } from '@nadohq/client';

const MAX_UINT32 = 4294967295;

/**
 * Finalization events don't represent a liquidation of the user's original balance
 * but is rather an adjustment from insurance.
 * Finalization events have product_id == MAX_UINT32
 * @param tx The transaction to check
 * @returns True if the transaction is a liquidation finalization, false otherwise
 */
export function isLiquidationFinalizationTx(tx: NadoTx) {
  if ('liquidate_subaccount' in tx) {
    return tx.liquidate_subaccount.product_id === MAX_UINT32;
  }
  return false;
}
