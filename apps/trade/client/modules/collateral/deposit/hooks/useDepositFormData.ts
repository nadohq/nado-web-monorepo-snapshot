import { NLP_PRODUCT_ID, removeDecimals } from '@nadohq/client';
import { nonNullFilter } from '@nadohq/web-common';
import { useSpotInterestRates } from 'client/hooks/markets/useSpotInterestRates';
import { useQueryTokenAllowanceForProduct } from 'client/hooks/query/collateral/useQueryTokenAllowanceForProduct';
import { useQueryAllDepositableTokenBalances } from 'client/hooks/query/subaccount/useQueryAllDepositableTokenBalances';
import { useMinInitialDepositAmountByProductId } from 'client/hooks/subaccount/useMinInitialDepositAmountByProductId';
import { useSpotBalances } from 'client/hooks/subaccount/useSpotBalances';
import { DepositProductSelectValue } from 'client/modules/collateral/deposit/types';
import { sortByDisplayedAssetValue } from 'client/modules/collateral/utils/sortByDisplayedAssetValue';
import { useMemo } from 'react';

interface Params {
  productIdInput: number;
}

export function useDepositFormData({ productIdInput }: Params) {
  const { balances } = useSpotBalances();
  const { data: spotInterestRates } = useSpotInterestRates();
  const { data: depositableTokenBalances } =
    useQueryAllDepositableTokenBalances();
  const { data: tokenAllowance } = useQueryTokenAllowanceForProduct({
    productId: productIdInput,
  });
  const { data: minInitialDepositAmounts } =
    useMinInitialDepositAmountByProductId();

  // If we are either still loading, or fail to load balances, we should keep the form in an enabled state
  // to allow the user to deposit in case of a bug / RPC error
  const hasLoadedDepositableBalances = !!depositableTokenBalances;

  // All available products for depositing
  const availableProducts: DepositProductSelectValue[] = useMemo(() => {
    if (!balances?.length) {
      return [];
    }

    return balances
      .map((balance) => {
        // NLP is non-depositable and non-withdrawable
        if (balance.productId === NLP_PRODUCT_ID) {
          return;
        }

        const token = balance.metadata.token;
        const nadoAmount = balance.amount;
        const walletAmount = removeDecimals(
          depositableTokenBalances?.[balance.productId],
          token.tokenDecimals,
        );

        return {
          selectId: token.symbol,
          productId: balance.productId,
          icon: token.icon,
          symbol: token.symbol,
          tokenDecimals: token.tokenDecimals,
          oraclePrice: balance.oraclePrice,
          displayedAssetAmount: walletAmount,
          displayedAssetValueUsd: walletAmount?.multipliedBy(
            balance.oraclePrice,
          ),
          decimalAdjustedMinimumInitialDepositAmount:
            minInitialDepositAmounts?.[balance.productId],
          decimalAdjustedNadoBalance: nadoAmount,
          decimalAdjustedWalletBalance: walletAmount,
          depositAPY: spotInterestRates?.[balance.productId]?.deposit,
        };
      })
      .filter(nonNullFilter)
      .sort(sortByDisplayedAssetValue);
  }, [
    balances,
    depositableTokenBalances,
    minInitialDepositAmounts,
    spotInterestRates,
  ]);

  // Currently selected product based on productId
  const selectedProduct = useMemo(() => {
    return availableProducts.find(
      (product) => product.productId === productIdInput,
    );
  }, [availableProducts, productIdInput]);

  return {
    availableProducts,
    hasLoadedDepositableBalances,
    selectedProduct,
    tokenAllowance,
  };
}
