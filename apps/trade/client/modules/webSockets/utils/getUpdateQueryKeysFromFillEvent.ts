import {
  EngineServerSubscriptionFillEvent,
  unpackOrderAppendix,
} from '@nadohq/client';
import { AppSubaccount } from '@nadohq/react-client';
import {
  getCrossSubaccountQueryKeys,
  getIsoPositionsQueryKeys,
} from 'client/hooks/execute/util/queryKeys';
import { paginatedSubaccountHistoricalEngineOrdersQueryKey } from 'client/hooks/query/subaccount/usePaginatedSubaccountHistoricalEngineOrders';
import { paginatedSubaccountHistoricalPriceTriggerOrdersQueryKey } from 'client/hooks/query/subaccount/usePaginatedSubaccountHistoricalPriceTriggerOrders';
import { paginatedSubaccountHistoricalTimeTriggerOrdersQueryKey } from 'client/hooks/query/subaccount/usePaginatedSubaccountHistoricalTimeTriggerOrders';
import { paginatedSubaccountHistoricalTradesQueryKey } from 'client/hooks/query/subaccount/usePaginatedSubaccountHistoricalTrades';
import { subaccountOpenTriggerOrdersQueryKey } from 'client/hooks/query/subaccount/useQuerySubaccountOpenTriggerOrders';

interface Params {
  event: EngineServerSubscriptionFillEvent;
  subaccount: Required<AppSubaccount>;
}

export function getUpdateQueryKeysFromFillEvent({
  event,
  subaccount: { chainEnv, address, name: subaccountName },
}: Params): Array<string[]> {
  const appendix = unpackOrderAppendix(event.appendix);
  const isIsoEvent = !!appendix.isolated;
  const isTrigger = !!appendix.triggerType;

  const refetchQueryKeys = [
    // Order fills usually affect the parent subaccount (except for reduce iso orders)
    ...getCrossSubaccountQueryKeys(chainEnv, address, subaccountName),
    paginatedSubaccountHistoricalEngineOrdersQueryKey(
      chainEnv,
      address,
      subaccountName,
    ),
    paginatedSubaccountHistoricalTradesQueryKey(
      chainEnv,
      address,
      subaccountName,
    ),
    // We do NOT refetch open orders, as they are updated via a separate workflow
  ];

  if (isTrigger) {
    refetchQueryKeys.push(
      subaccountOpenTriggerOrdersQueryKey(chainEnv, address, subaccountName),
    );
    switch (appendix.triggerType) {
      case 'price': {
        refetchQueryKeys.push(
          paginatedSubaccountHistoricalPriceTriggerOrdersQueryKey(
            chainEnv,
            address,
            subaccountName,
          ),
        );
        break;
      }
      case 'twap':
      case 'twap_custom_amounts': {
        refetchQueryKeys.push(
          paginatedSubaccountHistoricalTimeTriggerOrdersQueryKey(
            chainEnv,
            address,
            subaccountName,
          ),
        );
        break;
      }
      case undefined:
        break;
    }
  }

  if (isIsoEvent) {
    refetchQueryKeys.push(
      ...getIsoPositionsQueryKeys(chainEnv, address, subaccountName),
    );
  }

  return refetchQueryKeys;
}
