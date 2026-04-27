import { EngineServerSubscriptionPositionChangeEvent } from '@nadohq/client';
import {
  AppSubaccount,
  listSubaccountsQueryKey,
  nlpSnapshotsQueryKey,
} from '@nadohq/react-client';
import {
  getCrossSubaccountQueryKeys,
  getIsoPositionsQueryKeys,
} from 'client/hooks/execute/util/queryKeys';
import { tokenAllowanceQueryKey } from 'client/hooks/query/collateral/useQueryTokenAllowance';
import { maxBurnNlpAmountQueryKey } from 'client/hooks/query/nlp/useQueryMaxBurnNlpAmount';
import { nlpLockedBalancesQueryKey } from 'client/hooks/query/nlp/useQueryNlpLockedBalances';
import { summariesForAppSubaccountsQueryKey } from 'client/hooks/query/subaccount/subaccountSummary/useQuerySummariesForAppSubaccounts';
import { paginatedSubaccountCollateralEventsQueryKey } from 'client/hooks/query/subaccount/usePaginatedSubaccountCollateralEvents';
import { paginatedSubaccountLiquidationEventsQueryKey } from 'client/hooks/query/subaccount/usePaginatedSubaccountLiquidationEvents';
import { paginatedSubaccountNlpEventsQueryKey } from 'client/hooks/query/subaccount/usePaginatedSubaccountNlpEvents';
import { paginatedSubaccountSettlementEventsQueryKey } from 'client/hooks/query/subaccount/usePaginatedSubaccountSettlementEvents';
import { allDepositableTokenBalancesQueryKey } from 'client/hooks/query/subaccount/useQueryAllDepositableTokenBalances';

interface Params {
  event: EngineServerSubscriptionPositionChangeEvent;
  subaccount: Required<AppSubaccount>;
}

export function getUpdateQueryKeysFromPositionChangeEvent({
  event,
  subaccount: { chainEnv, address, name: subaccountName },
}: Params): Array<string[]> {
  const isIsoEvent = event.isolated;

  switch (event.reason) {
    case 'deposit_collateral': {
      return [
        ...getCrossSubaccountQueryKeys(chainEnv, address, subaccountName),
        paginatedSubaccountCollateralEventsQueryKey(
          chainEnv,
          address,
          subaccountName,
        ),
        listSubaccountsQueryKey(chainEnv, address),
        allDepositableTokenBalancesQueryKey(chainEnv, address),
        tokenAllowanceQueryKey(chainEnv, address),
      ];
    }
    case 'match_orders': {
      // This is handled by fill and order change events
      return [];
    }
    case 'withdraw_collateral': {
      return [
        ...getCrossSubaccountQueryKeys(chainEnv, address, subaccountName),
        paginatedSubaccountCollateralEventsQueryKey(
          chainEnv,
          address,
          subaccountName,
        ),
        // Note: we don't include depositable token balances here because withdraws do not happen instantly on-chain
      ];
    }
    case 'transfer_quote': {
      return isIsoEvent
        ? getIsoPositionsQueryKeys(chainEnv, address, subaccountName)
        : [
            // Purposefully omit the cross subaccount name as we need to refetch across multiple accounts (both the sender and recipient)
            ...getCrossSubaccountQueryKeys(chainEnv, address),
            listSubaccountsQueryKey(chainEnv, address),
            summariesForAppSubaccountsQueryKey(chainEnv, address),
            paginatedSubaccountCollateralEventsQueryKey(chainEnv, address),
          ];
    }
    case 'settle_pnl': {
      const accountQueryKeys = isIsoEvent
        ? getIsoPositionsQueryKeys(chainEnv, address, subaccountName)
        : getCrossSubaccountQueryKeys(chainEnv, address, subaccountName);
      return [
        ...accountQueryKeys,
        paginatedSubaccountSettlementEventsQueryKey(
          chainEnv,
          address,
          subaccountName,
        ),
      ];
    }
    case 'mint_nlp': {
      return [
        ...getCrossSubaccountQueryKeys(chainEnv, address, subaccountName),
        nlpLockedBalancesQueryKey(chainEnv, address, subaccountName),
        paginatedSubaccountNlpEventsQueryKey(chainEnv, address, subaccountName),
        nlpSnapshotsQueryKey(),
      ];
    }
    case 'burn_nlp': {
      return [
        ...getCrossSubaccountQueryKeys(chainEnv, address, subaccountName),
        nlpLockedBalancesQueryKey(chainEnv, address, subaccountName),
        maxBurnNlpAmountQueryKey(chainEnv, address, subaccountName),
        paginatedSubaccountNlpEventsQueryKey(chainEnv, address, subaccountName),
        nlpSnapshotsQueryKey(),
      ];
    }
    case 'liquidate_subaccount': {
      const accountQueryKeys = isIsoEvent
        ? getIsoPositionsQueryKeys(chainEnv, address, subaccountName)
        : getCrossSubaccountQueryKeys(chainEnv, address, subaccountName);
      return [
        ...accountQueryKeys,
        paginatedSubaccountLiquidationEventsQueryKey(
          chainEnv,
          address,
          subaccountName,
        ),
      ];
    }
  }
}
