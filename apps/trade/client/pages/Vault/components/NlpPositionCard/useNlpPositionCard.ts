import { BigNumbers, NLP_PRODUCT_ID, removeDecimals } from '@nadohq/client';
import {
  calcIndexerSummaryCumulativePnl,
  calcIndexerSummaryUnrealizedPnl,
} from '@nadohq/react-client';
import { useSubaccountIndexerSnapshot } from 'client/hooks/subaccount/useSubaccountIndexerSnapshot';
import { useAddressNlpState } from 'client/modules/nlp/hooks/useAddressNlpState';
import { useMemo } from 'react';

export function useNlpPositionCard() {
  const { balanceAmount, balanceValueUsd } = useAddressNlpState();
  const { data: indexerSnapshot } = useSubaccountIndexerSnapshot();

  const { cumulativePnlUsd, unrealizedPnlUsd } = useMemo(() => {
    const nlpBalanceSnapshot = indexerSnapshot?.balances.find(
      (balance) => balance.productId === NLP_PRODUCT_ID,
    );

    const cumulativePnlUsd = nlpBalanceSnapshot
      ? removeDecimals(calcIndexerSummaryCumulativePnl(nlpBalanceSnapshot))
      : BigNumbers.ZERO;

    const unrealizedPnlUsd = nlpBalanceSnapshot
      ? removeDecimals(calcIndexerSummaryUnrealizedPnl(nlpBalanceSnapshot))
      : BigNumbers.ZERO;

    return {
      cumulativePnlUsd,
      unrealizedPnlUsd,
    };
  }, [indexerSnapshot?.balances]);

  return {
    balanceAmount,
    balanceValueUsd,
    cumulativePnlUsd,
    unrealizedPnlUsd,
  };
}
