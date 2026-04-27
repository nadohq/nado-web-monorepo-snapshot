import { addDecimals, QUOTE_PRODUCT_ID, removeDecimals } from '@nadohq/client';
import { SEQUENCER_FEE_AMOUNT_USDT } from '@nadohq/react-client';
import { useExecuteApproveAllowanceForProduct } from 'client/hooks/execute/useExecuteApproveAllowanceForProduct';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useQueryTokenAllowanceForProduct } from 'client/hooks/query/collateral/useQueryTokenAllowanceForProduct';
import { useQueryOnChainTransactionState } from 'client/hooks/query/useQueryOnChainTransactionState';
import { useCallback, useMemo } from 'react';

/**
 * Util hook for querying/mutating token allowance for slow mode transactions
 * Slow mode transactions require 1 USDT in fee
 */
export function useSlowModeFeeAllowance() {
  const { data: tokenAllowanceWithDecimals } = useQueryTokenAllowanceForProduct(
    {
      productId: QUOTE_PRODUCT_ID,
    },
  );
  const { data: marketsStaticData } = useAllMarketsStaticData();

  const executeApproveAllowance = useExecuteApproveAllowanceForProduct();

  const quoteAllowance = useMemo(() => {
    if (!marketsStaticData || !tokenAllowanceWithDecimals) {
      return;
    }
    return removeDecimals(
      tokenAllowanceWithDecimals,
      marketsStaticData.primaryQuoteProduct.metadata.token.tokenDecimals,
    );
  }, [marketsStaticData, tokenAllowanceWithDecimals]);

  const requiresApproval = quoteAllowance?.lt(SEQUENCER_FEE_AMOUNT_USDT);

  const approveFeeAllowance = useCallback(async () => {
    if (!marketsStaticData) {
      throw new Error(
        '[useSlowModeFeeAllowance] Quote decimals not yet loaded',
      );
    }
    return executeApproveAllowance.mutateAsync({
      productId: QUOTE_PRODUCT_ID,
      amount: addDecimals(
        SEQUENCER_FEE_AMOUNT_USDT,
        marketsStaticData.primaryQuoteProduct.metadata.token.tokenDecimals,
      ).toFixed(),
    });
  }, [executeApproveAllowance, marketsStaticData]);

  const approvalTxState = useQueryOnChainTransactionState({
    txHash: executeApproveAllowance.data,
  });

  return {
    requiresApproval,
    approveFeeAllowance,
    executeApproveAllowance,
    approvalTxState,
  };
}
