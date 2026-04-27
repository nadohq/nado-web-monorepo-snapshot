import {
  BalanceWithProduct,
  BigNumbers,
  IndexerBalanceTrackedVars,
  isPerpBalance,
  PerpBalance,
} from '@nadohq/client';
import { useQueryNlpPools } from 'client/hooks/query/nlp/useQueryNlpPools';
import { useQueryNlpPoolSnapshotsByPoolId } from 'client/hooks/query/nlp/useQueryNlpPoolSnapshotsByPoolId';
import { cloneDeep, get } from 'lodash';
import { useMemo } from 'react';

/**
 * Aggregated balance info for NLP sub-pools per productId
 */
interface NlpAggregatedBalance {
  /**
   * Balance with aggregated amount & vQuoteBalance (health contributions are NOT updated)
   */
  balance: BalanceWithProduct;

  balanceTrackedVars: IndexerBalanceTrackedVars;
}

/**
 * Returns an aggregated list of balances across all NLP sub-pools (both spot & perp)
 * with relevant indexer snapshot data.
 */
export function useNlpAggregatedBalances() {
  const { data: nlpPools, isLoading: isLoadingPools } = useQueryNlpPools();
  const { data: nlpPoolSnapshotsByPoolId, isLoading: isLoadingSnapshots } =
    useQueryNlpPoolSnapshotsByPoolId();

  const mappedData = useMemo(() => {
    if (!nlpPools || !nlpPoolSnapshotsByPoolId) {
      return;
    }

    const balanceByProductId: Record<number, NlpAggregatedBalance> = {};
    nlpPools.nlpPools.forEach((pool) => {
      const { subaccountInfo, poolId } = pool;

      subaccountInfo.balances.forEach((balance) => {
        let existingItem = get(
          balanceByProductId,
          balance.productId,
          undefined,
        );

        if (!existingItem) {
          existingItem = {
            balance: cloneDeep(balance),
            balanceTrackedVars: {
              netInterestUnrealized: BigNumbers.ZERO,
              netInterestCumulative: BigNumbers.ZERO,
              netFundingUnrealized: BigNumbers.ZERO,
              netFundingCumulative: BigNumbers.ZERO,
              netEntryUnrealized: BigNumbers.ZERO,
              netEntryCumulative: BigNumbers.ZERO,
              quoteVolumeCumulative: BigNumbers.ZERO,
            },
          };
          balanceByProductId[balance.productId] = existingItem;
        } else {
          existingItem.balance.amount = existingItem.balance.amount.plus(
            balance.amount,
          );

          // Update vQuoteBalance for perp balances
          if (isPerpBalance(balance)) {
            const existingPerpBalance = existingItem.balance as PerpBalance;
            const existingVQuoteDelta = existingPerpBalance.vQuoteBalance;
            existingPerpBalance.vQuoteBalance = existingVQuoteDelta.plus(
              balance.vQuoteBalance,
            );
          }
        }

        const snapshotForBalance = nlpPoolSnapshotsByPoolId[
          poolId
        ]?.balances.find((bal) => {
          // NLP is all cross margin so there's only one matching balance per productId
          return bal.productId === balance.productId;
        });
        if (!snapshotForBalance) {
          return;
        }

        const balanceTrackedVars = snapshotForBalance.trackedVars;

        // Update tracked vars
        existingItem.balanceTrackedVars = {
          netInterestUnrealized:
            existingItem.balanceTrackedVars.netInterestUnrealized.plus(
              balanceTrackedVars.netInterestUnrealized,
            ),
          netInterestCumulative:
            existingItem.balanceTrackedVars.netInterestCumulative.plus(
              balanceTrackedVars.netInterestCumulative,
            ),
          netFundingUnrealized:
            existingItem.balanceTrackedVars.netFundingUnrealized.plus(
              balanceTrackedVars.netFundingUnrealized,
            ),
          netFundingCumulative:
            existingItem.balanceTrackedVars.netFundingCumulative.plus(
              balanceTrackedVars.netFundingCumulative,
            ),
          netEntryUnrealized:
            existingItem.balanceTrackedVars.netEntryUnrealized.plus(
              balanceTrackedVars.netEntryUnrealized,
            ),
          netEntryCumulative:
            existingItem.balanceTrackedVars.netEntryCumulative.plus(
              balanceTrackedVars.netEntryCumulative,
            ),
          quoteVolumeCumulative:
            existingItem.balanceTrackedVars.quoteVolumeCumulative.plus(
              balanceTrackedVars.quoteVolumeCumulative,
            ),
        };
      });
    });

    return Object.values(balanceByProductId);
  }, [nlpPoolSnapshotsByPoolId, nlpPools]);

  return {
    data: mappedData,
    isLoading: isLoadingPools || isLoadingSnapshots,
  };
}
