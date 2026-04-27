import {
  BigNumbers,
  NLP_PRODUCT_ID,
  removeDecimals,
  toBigNumber,
} from '@nadohq/client';
import { nonNullFilter } from '@nadohq/web-common';
import { useQueryAllDepositableTokenBalances } from 'client/hooks/query/subaccount/useQueryAllDepositableTokenBalances';
import { useQuerySubaccountFeeRates } from 'client/hooks/query/subaccount/useQuerySubaccountFeeRates';
import { useSpotBalances } from 'client/hooks/subaccount/useSpotBalances';
import { sortByDisplayedAssetValue } from 'client/modules/collateral/utils/sortByDisplayedAssetValue';
import { WithdrawProductSelectValue } from 'client/modules/collateral/withdraw/types';
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

  // All available products for withdrawal
  const availableProducts: WithdrawProductSelectValue[] = useMemo(() => {
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
        // Silently fail here, should be ok
        const walletAmount =
          depositableTokenBalances?.[balance.productId] ?? BigNumbers.ZERO;
        const withdrawalFee = toBigNumber(
          feeRates?.withdrawal[balance.productId] ?? 0,
        );

        const decimalAdjustedFee = removeDecimals(withdrawalFee);

        const decimalAdjustedFeeValueUsd = decimalAdjustedFee.multipliedBy(
          balance.oraclePrice,
        );

        return {
          selectId: token.symbol,
          productId: balance.productId,
          icon: token.icon,
          symbol: token.symbol,
          tokenDecimals: token.tokenDecimals,
          oraclePrice: balance.oraclePrice,
          displayedAssetAmount: nadoAmount,
          displayedAssetValueUsd: balance.oraclePrice.multipliedBy(nadoAmount),
          fee: {
            amount: decimalAdjustedFee,
            valueUsd: decimalAdjustedFeeValueUsd,
          },
          decimalAdjustedNadoBalance: nadoAmount,
          decimalAdjustedWalletBalance: removeDecimals(
            walletAmount,
            token.tokenDecimals,
          ),
        };
      })
      .filter(nonNullFilter)
      .sort(sortByDisplayedAssetValue);
  }, [balances, depositableTokenBalances, feeRates?.withdrawal]);

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
