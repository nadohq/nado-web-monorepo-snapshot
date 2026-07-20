import { NLP_PRODUCT_ID, removeDecimals } from '@nadohq/client';
import { toXStocksRawAmount } from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { useSpotInterestRates } from 'client/hooks/markets/useSpotInterestRates';
import { useQueryTokenAllowanceForProduct } from 'client/hooks/query/collateral/useQueryTokenAllowanceForProduct';
import { useQueryAllDepositableTokenBalances } from 'client/hooks/query/subaccount/useQueryAllDepositableTokenBalances';
import { useMinInitialDepositAmountByProductId } from 'client/hooks/subaccount/useMinInitialDepositAmountByProductId';
import { useSpotBalances } from 'client/hooks/subaccount/useSpotBalances';
import { DepositProductSelectValue } from 'client/modules/collateral/deposit/types';
import { getWrappedSymbol } from 'client/modules/collateral/utils/getWrappedSymbol';
import { sortByDisplayedAssetValue } from 'client/modules/collateral/utils/sortByDisplayedAssetValue';
import { useGetIsXStocksProduct } from 'client/modules/xStocks/hooks/useGetIsXStocksProduct';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
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
  const { getExchangeRate } = useGetXStocksExchangeRate();
  const getIsXStocksProduct = useGetIsXStocksProduct();

  // If we are either still loading, or fail to load balances, we should keep the form in an enabled state
  // to allow the user to deposit in case of a bug / RPC error
  const hasLoadedDepositableBalances = !!depositableTokenBalances;

  // All available products for depositing
  const availableProducts = useMemo(() => {
    if (!balances?.length) {
      return [];
    }

    return balances
      .map((balance): DepositProductSelectValue | undefined => {
        // NLP is non-depositable and non-withdrawable
        if (balance.productId === NLP_PRODUCT_ID) {
          return;
        }

        const token = balance.metadata.token;
        // useSpotBalances is in display space, but we want to keep things in the wrapped space
        // for deposit/withdraw
        const exchangeRate = getExchangeRate(balance.productId);
        const nadoAmount = toXStocksRawAmount(balance.amount, exchangeRate);
        const isXStocksProduct = getIsXStocksProduct(balance.productId);
        const walletAmount = removeDecimals(
          depositableTokenBalances?.[balance.productId],
          token.tokenDecimals,
        );

        return {
          selectId: token.symbol,
          productId: balance.productId,
          icon: token.icon,
          symbol: isXStocksProduct
            ? getWrappedSymbol(token.symbol)
            : token.symbol,
          tokenDecimals: token.tokenDecimals,
          oraclePrice: balance.rawOraclePrice,
          displayedAssetAmount: walletAmount,
          displayedAssetValueUsd: walletAmount?.multipliedBy(
            balance.rawOraclePrice,
          ),
          decimalAdjustedMinimumInitialDepositAmount:
            minInitialDepositAmounts?.[balance.productId],
          decimalAdjustedRawNadoBalance: nadoAmount,
          isXStocksProduct,
          decimalAdjustedWalletBalance: walletAmount,
          depositAPY: spotInterestRates?.[balance.productId]?.deposit,
        };
      })
      .filter(nonNullFilter)
      .sort(sortByDisplayedAssetValue);
  }, [
    balances,
    depositableTokenBalances,
    getExchangeRate,
    getIsXStocksProduct,
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
