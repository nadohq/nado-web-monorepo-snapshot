import { assertEventType } from 'client/modules/events/collateral/assertEventType';
import {
  getBaseCollateralEvent,
  GetBaseCollateralEventParams,
} from 'client/modules/events/collateral/getBaseCollateralEvent';
import { DepositCollateralEvent } from 'client/modules/events/collateral/types';

export type GetDepositCollateralEventParams = GetBaseCollateralEventParams;

export function getDepositCollateralEvent({
  event,
  allMarketsStaticData,
}: GetDepositCollateralEventParams): DepositCollateralEvent {
  assertEventType(event, 'deposit_collateral');

  return {
    ...getBaseCollateralEvent({
      event,
      allMarketsStaticData,
    }),
    eventType: 'deposit_collateral',
  };
}
