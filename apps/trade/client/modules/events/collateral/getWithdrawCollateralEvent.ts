import { BigNumber } from 'bignumber.js';
import { assertEventType } from 'client/modules/events/collateral/assertEventType';
import {
  getBaseCollateralEvent,
  GetBaseCollateralEventParams,
} from 'client/modules/events/collateral/getBaseCollateralEvent';
import { WithdrawCollateralEvent } from 'client/modules/events/collateral/types';

export interface GetWithdrawCollateralEventParams extends GetBaseCollateralEventParams {
  areWithdrawalsProcessingData: Record<string, boolean> | undefined;
  allProductsWithdrawPoolLiquidityData: Record<number, BigNumber> | undefined;
}

export function getWithdrawCollateralEvent({
  event,
  allMarketsStaticData,
  areWithdrawalsProcessingData,
  allProductsWithdrawPoolLiquidityData,
}: GetWithdrawCollateralEventParams): WithdrawCollateralEvent {
  assertEventType(event, 'withdraw_collateral');

  const baseTokenEvent = getBaseCollateralEvent({
    event,
    allMarketsStaticData,
  });

  const isProcessing = areWithdrawalsProcessingData?.[event.submissionIndex];
  const hasWithdrawPoolLiquidity =
    allProductsWithdrawPoolLiquidityData?.[
      baseTokenEvent.productId
    ]?.isPositive() ?? false;

  return {
    ...baseTokenEvent,
    eventType: 'withdraw_collateral',
    isProcessing,
    hasWithdrawPoolLiquidity,
  };
}
