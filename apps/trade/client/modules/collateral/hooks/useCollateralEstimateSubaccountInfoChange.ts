import { BigNumbers, removeDecimals, SubaccountTx } from '@nadohq/client';
import { getHealthWeights } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import {
  AdditionalSubaccountInfoFactory,
  EstimatedBaseSubaccountInfo,
  useEstimateSubaccountInfoChange,
} from 'client/hooks/subaccount/useEstimateSubaccountInfoChange';
import { first } from 'lodash';
import { useCallback } from 'react';

interface Params {
  productId: number | undefined;
  estimateStateTxs: SubaccountTx[];
  subaccountName?: string;
}

// Partial<EstimatedBaseSubaccountInfo> is used to override the default behavior of useEstimateSubaccountInfoChange when needed
/**
 * Additional subaccount info for collateral estimates
 */
export interface CollateralAdditionalSubaccountInfo extends Partial<EstimatedBaseSubaccountInfo> {
  nadoBalance: BigNumber | undefined;
  borrowedAmount: BigNumber | undefined;
  borrowedValueUsd: BigNumber | undefined;
}

export function useCollateralEstimateSubaccountInfoChange({
  productId,
  estimateStateTxs,
  subaccountName,
}: Params) {
  const additionalInfoFactory = useCallback<
    AdditionalSubaccountInfoFactory<CollateralAdditionalSubaccountInfo>
  >(
    (summary, isEstimate, exists) => {
      const balance = summary?.balances.find(
        (product) => product.productId === productId,
      );
      if (productId == null || !balance) {
        return {
          nadoBalance: undefined,
          borrowedAmount: undefined,
          borrowedValueUsd: undefined,
        };
      }

      // This is a bit of a hack, but if the subaccount does NOT exist, then the estimateStateTxs is never applied
      // This is only relevant when first depositing to a subaccount, so we add some logic to mimic the behavior of the backend call
      const shouldUseManualEstimate = !exists && isEstimate;

      const newBalanceAmountWithDecimals = (() => {
        if (!shouldUseManualEstimate) {
          return balance.amount;
        }

        // Collateral should only have 1 tx
        const tx = first(estimateStateTxs);

        // If subaccount doesn't exist, assume amount of the tx is the new balance
        return tx?.type === 'apply_delta' ? tx.tx.amountDelta : balance.amount;
      })();

      const nadoBalance = removeDecimals(newBalanceAmountWithDecimals);
      const borrowedAmount = BigNumber.min(nadoBalance, BigNumbers.ZERO).abs();
      const oraclePrice = balance.oraclePrice;

      // Override base subaccount info assuming that the new balance is the only balance that the user has
      const baseSubaccountInfo = ((): Partial<EstimatedBaseSubaccountInfo> => {
        if (!shouldUseManualEstimate) {
          return {};
        }

        const balanceValueUsd = nadoBalance.multipliedBy(oraclePrice);
        const weights = getHealthWeights(nadoBalance, balance);

        return {
          accountValueUsd: balanceValueUsd,
          // Everything below assumes that the subaccount is depositing - other operations (ex. withdrawal) aren't valid anyway
          initialMarginBoundedUsd: balanceValueUsd.multipliedBy(
            weights.initial,
          ),
          maintMarginBoundedUsd: balanceValueUsd.multipliedBy(
            weights.maintenance,
          ),
          leverage: BigNumbers.ZERO,
          maintMarginUsageBounded: BigNumbers.ZERO,
          marginUsageBounded: BigNumbers.ZERO,
        };
      })();

      return {
        nadoBalance,
        borrowedAmount,
        borrowedValueUsd: borrowedAmount.multipliedBy(oraclePrice),
        ...baseSubaccountInfo,
      };
    },
    [estimateStateTxs, productId],
  );

  return useEstimateSubaccountInfoChange({
    estimateStateTxs,
    additionalInfoFactory,
    subaccountName,
  });
}
