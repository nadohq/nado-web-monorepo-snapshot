import { ProductEngineType } from '@nadohq/client';
import { useQuerySubaccountSummary } from 'client/hooks/query/subaccount/subaccountSummary/useQuerySubaccountSummary';
import { some } from 'lodash';
import { useMemo } from 'react';

export function useHasRepayableBalances() {
  const { data: subaccountSummary } = useQuerySubaccountSummary();
  return useMemo(() => {
    if (!subaccountSummary?.balances) return false;

    return some(
      subaccountSummary.balances,
      (balance) =>
        balance.type === ProductEngineType.SPOT && balance.amount.isNegative(),
    );
  }, [subaccountSummary]);
}
