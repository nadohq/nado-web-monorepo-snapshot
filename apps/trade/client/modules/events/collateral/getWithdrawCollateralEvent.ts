import {
  IndexerCollateralEvent,
  NadoWithdrawCollateralV2Tx,
} from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import {
  getBaseCollateralEvent,
  GetBaseCollateralEventParams,
} from 'client/modules/events/collateral/getBaseCollateralEvent';
import { WithdrawCollateralEvent } from 'client/modules/events/collateral/types';
import { zeroAddress } from 'viem';

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
    isProcessing,
    hasWithdrawPoolLiquidity,
    recipientAddress: getRecipientAddress(event),
  };
}

/**
 * Resolves the recipient of a withdrawal. `withdraw_collateral_v2` withdrawals
 * can specify a custom `send_to` address; a zero (or absent) address means the
 * funds went to the subaccount owner.
 */
function getRecipientAddress(event: IndexerCollateralEvent): string {
  if (event.eventType === 'withdraw_collateral_v2') {
    const { send_to } = (event.tx as NadoWithdrawCollateralV2Tx)
      .withdraw_collateral_v2;
    if (send_to && send_to.toLowerCase() !== zeroAddress) {
      return send_to;
    }
  }
  return event.subaccountOwner;
}
