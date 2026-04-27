import { removeDecimals, SubaccountTx } from '@nadohq/client';
import {
  calcSubaccountLeverage,
  calcSubaccountMarginUsageFractions,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { AnnotatedSubaccountSummary } from 'client/hooks/query/subaccount/subaccountSummary/annotateSubaccountSummary';
import { useQuerySubaccountEstimatedSummary } from 'client/hooks/query/subaccount/subaccountSummary/useQuerySubaccountEstimatedSummary';
import { useDebounceFalsy } from 'client/hooks/util/useDebounceFalsy';
import { useMemo } from 'react';
import { EmptyObject } from 'type-fest';

export interface UseEstimateSubaccountInfoChange<TAdditionalInfo> {
  current?: EstimatedSubaccountInfo<TAdditionalInfo>;
  estimated?: EstimatedSubaccountInfo<TAdditionalInfo>;
}

interface UseEstimatedSubaccountInfoChangeParams<TAdditionalInfo> {
  estimateStateTxs: SubaccountTx[];
  additionalInfoFactory?: AdditionalSubaccountInfoFactory<TAdditionalInfo>;
  subaccountName?: string;
}

export interface EstimatedBaseSubaccountInfo {
  accountValueUsd: BigNumber;
  // Max of 1
  marginUsageBounded: BigNumber;
  //Max of 1
  maintMarginUsageBounded: BigNumber;
  // Min of 0
  maintMarginBoundedUsd: BigNumber;
  // Min of 0
  initialMarginBoundedUsd: BigNumber;
  leverage: BigNumber;
}

export type EstimatedSubaccountInfo<TAdditionalInfo> =
  EstimatedBaseSubaccountInfo & TAdditionalInfo;

export type AdditionalSubaccountInfoFactory<TAdditionalInfo> = (
  summary: AnnotatedSubaccountSummary,
  isEstimate: boolean,
  exists: boolean,
) => TAdditionalInfo;

/**
 * Estimates a change in subaccount info. additionalInfoFactory MUST be memoized in a `useCallback`
 * @param estimateStateTxs
 * @param additionalInfoFactory
 * @param subaccountName
 */
export function useEstimateSubaccountInfoChange<TAdditionalInfo = EmptyObject>({
  estimateStateTxs,
  additionalInfoFactory,
  subaccountName,
}: UseEstimatedSubaccountInfoChangeParams<TAdditionalInfo>): UseEstimateSubaccountInfoChange<TAdditionalInfo> {
  const { data } = useQuerySubaccountEstimatedSummary({
    estimateStateTxs,
    subaccountName,
  });
  const current = data?.current;
  const estimated = data?.estimated;
  const exists = data?.exists ?? false;

  const estimatedSubaccountInfo = useMemo(() => {
    // If there are no transactions, force this to be undefined to indicate that there is no change
    return !estimateStateTxs.length
      ? undefined
      : calcSubaccountInfo(estimated, true, exists, additionalInfoFactory);
  }, [additionalInfoFactory, estimated, exists, estimateStateTxs.length]);

  // Debounce falsy values here to prevent "flashing" during estimated state change UI updates
  // when query data for new input is loading
  const debouncedEstimatedSubaccountInfo = useDebounceFalsy(
    estimatedSubaccountInfo,
  );

  return useMemo(() => {
    return {
      current: calcSubaccountInfo(
        current,
        false,
        exists,
        additionalInfoFactory,
      ),
      estimated: debouncedEstimatedSubaccountInfo,
    };
  }, [
    additionalInfoFactory,
    current,
    exists,
    debouncedEstimatedSubaccountInfo,
  ]);
}

function calcSubaccountInfo<TAdditionalInfo>(
  subaccountSummary: AnnotatedSubaccountSummary | undefined,
  isEstimate: boolean,
  exists: boolean,
  additionalInfoFactory?: AdditionalSubaccountInfoFactory<TAdditionalInfo>,
): EstimatedSubaccountInfo<TAdditionalInfo> | undefined {
  if (!subaccountSummary) {
    return;
  }

  const marginUsageFractions =
    calcSubaccountMarginUsageFractions(subaccountSummary);

  return {
    accountValueUsd: removeDecimals(subaccountSummary.health.unweighted.health),
    initialMarginBoundedUsd: removeDecimals(
      BigNumber.max(0, subaccountSummary.health.initial.health),
    ),
    maintMarginBoundedUsd: removeDecimals(
      BigNumber.max(0, subaccountSummary.health.maintenance.health),
    ),
    leverage: calcSubaccountLeverage(subaccountSummary),
    marginUsageBounded: marginUsageFractions.initial,
    maintMarginUsageBounded: marginUsageFractions.maintenance,
    // Force typecast here :(
    ...(additionalInfoFactory?.(subaccountSummary, isEstimate, exists) ??
      ({} as TAdditionalInfo)),
  };
}
