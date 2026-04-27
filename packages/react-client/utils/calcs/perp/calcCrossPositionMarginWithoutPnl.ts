import { calcPerpBalanceValue, PerpBalanceWithProduct } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';

/**
 * Calculates margin used for a single balance excluding the health impact
 * of unsettled pnl (unsettled pnl = perp position value (not notional!)). Uses initial health
 *
 * @param position
 */
export function calcCrossPositionMarginWithoutPnl(
  position: PerpBalanceWithProduct,
) {
  const withoutUnsettledPnl = position.healthContributions.initial.minus(
    calcPerpBalanceValue(position),
  );
  return BigNumber.max(0, withoutUnsettledPnl.negated());
}
