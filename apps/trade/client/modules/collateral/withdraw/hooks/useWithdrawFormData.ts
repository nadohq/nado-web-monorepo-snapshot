import {
  BigNumbers,
  NLP_PRODUCT_ID,
  removeDecimals,
  toBigNumber,
} from '@nadohq/client';
import { toXStocksRawAmount } from '@nadohq/react-client';
import { nonNullFilter } from '@nadohq/web-common';
import { useQueryAllDepositableTokenBalances } from 'client/hooks/query/subaccount/useQueryAllDepositableTokenBalances';
import { useQuerySubaccountFeeRates } from 'client/hooks/query/subaccount/useQuerySubaccountFeeRates';
import { useSpotBalances } from 'client/hooks/subaccount/useSpotBalances';
import { getWrappedSymbol } from 'client/modules/collateral/utils/getWrappedSymbol';
import { sortByDisplayedAssetValue } from 'client/modules/collateral/utils/sortByDisplayedAssetValue';
import { WithdrawProductSelectValue } from 'client/modules/collateral/withdraw/types';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
import { useMemo } from 'react';

interface Params {
  productIdInput: number;
}

export function useWithdrawFormData({ productIdInput }: Params) {
  // Data
  const { balances } = useSpotBalances();
  const { data: depositableTokenBalances } =
    useQueryAllDepositableTokenBalances();
  const { data: feeRates } = useQuerySubaccountFeeRates();
  const { getExchangeRate } = useGetXStocksExchangeRate();

  // All available products for withdrawal
  const availableProducts = useMemo(() => {
    if (!balances?.length) {
      return [];
    }
    return balances
      .map((balance): WithdrawProductSelectValue | undefined => {
        // NLP is non-depositable and non-withdrawable
        if (balance.productId === NLP_PRODUCT_ID) {
          return;
        }

        const token = balance.metadata.token;

        // useSpotBalances is in display space, but we want to keep things in the wrapped space
        // for deposit/withdraw
        const exchangeRate = getExchangeRate(balance.productId);
        const nadoAmount = toXStocksRawAmount(balance.amount, exchangeRate);
        // Silently fail here, should be ok
        const walletAmount =
          depositableTokenBalances?.[balance.productId] ?? BigNumbers.ZERO;

        // Withdrawal fee amounts are in the raw space
        const withdrawalFee = toBigNumber(
          feeRates?.withdrawal[balance.productId] ?? 0,
        );
        const decimalAdjustedFee = removeDecimals(withdrawalFee);
        const decimalAdjustedFeeValueUsd = decimalAdjustedFee.multipliedBy(
          balance.rawOraclePrice,
        );

        return {
          selectId: token.symbol,
          productId: balance.productId,
          icon: token.icon,
          symbol: balance.isXStocksProduct
            ? getWrappedSymbol(token.symbol)
            : token.symbol,
          tokenDecimals: token.tokenDecimals,
          oraclePrice: balance.rawOraclePrice,
          displayedAssetAmount: nadoAmount,
          displayedAssetValueUsd:
            balance.rawOraclePrice.multipliedBy(nadoAmount),
          fee: {
            amount: decimalAdjustedFee,
            valueUsd: decimalAdjustedFeeValueUsd,
          },
          decimalAdjustedRawNadoBalance: nadoAmount,
          decimalAdjustedWalletBalance: removeDecimals(
            walletAmount,
            token.tokenDecimals,
          ),
        };
      })
      .filter(nonNullFilter)
      .sort(sortByDisplayedAssetValue);
  }, [
    balances,
    depositableTokenBalances,
    feeRates?.withdrawal,
    getExchangeRate,
  ]);

  // Selected product based on productId
  const selectedProduct = useMemo(() => {
    return availableProducts.find(
      (product) => product.productId === productIdInput,
    );
  }, [availableProducts, productIdInput]);

  return {
    availableProducts,
    selectedProduct,
  };
}
