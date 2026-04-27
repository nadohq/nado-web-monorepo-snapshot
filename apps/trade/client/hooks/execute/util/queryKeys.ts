import { ChainEnv } from '@nadohq/client';
import { subaccountIsolatedPositionsQueryKey } from 'client/hooks/query/subaccount/isolatedPositions/useQuerySubaccountIsolatedPositions';
import { subaccountSummaryQueryKey } from 'client/hooks/query/subaccount/subaccountSummary/useQuerySubaccountSummary';
import { maxMintNlpAmountQueryKey } from 'client/hooks/query/subaccount/useQueryMaxMintNlpAmount';
import { maxOrderSizeQueryKey } from 'client/hooks/query/subaccount/useQueryMaxOrderSize';
import { maxWithdrawableQueryKey } from 'client/hooks/query/subaccount/useQueryMaxWithdrawableAmount';
import { subaccountIndexerSnapshotsQueryKey } from 'client/hooks/query/subaccount/useQuerySubaccountIndexerSnapshots';

/**
 * Returns the query keys that should be refetched when there is any change to max sizes for the cross subaccount
 */
export function getMaxSizeQueryKeys(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
) {
  return [
    maxOrderSizeQueryKey(chainEnv, subaccountOwner, subaccountName),
    maxWithdrawableQueryKey(chainEnv, subaccountOwner, subaccountName),
    maxMintNlpAmountQueryKey(chainEnv, subaccountOwner, subaccountName),
  ];
}

/**
 * Returns the query keys that should be refetched when there is any change to the main cross subaccount balances / health
 */
export function getCrossSubaccountQueryKeys(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
) {
  return [
    subaccountSummaryQueryKey(chainEnv, subaccountOwner, subaccountName),
    subaccountIndexerSnapshotsQueryKey(
      chainEnv,
      subaccountOwner,
      subaccountName,
    ),
    ...getMaxSizeQueryKeys(chainEnv, subaccountOwner, subaccountName),
  ];
}

/**
 * Returns the query keys that should be refetched when there is any change to isolated positions
 */
export function getIsoPositionsQueryKeys(
  chainEnv?: ChainEnv,
  subaccountOwner?: string,
  subaccountName?: string,
) {
  return [
    subaccountIsolatedPositionsQueryKey(
      chainEnv,
      subaccountOwner,
      subaccountName,
    ),
  ];
}
