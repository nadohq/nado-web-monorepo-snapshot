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
  return getBaseCollateralEvent({
    event,
    allMarketsStaticData,
  });
}
