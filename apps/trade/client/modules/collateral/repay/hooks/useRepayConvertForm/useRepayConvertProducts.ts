import { QUOTE_PRODUCT_ID } from '@nadohq/client';
import { useNadoMetadataContext } from '@nadohq/react-client';
import {
  LatestMarketPrice,
  useQueryAllMarketsLatestPrices,
} from 'client/hooks/query/markets/useQueryAllMarketsLatestPrices';
import {
  SpotBalanceItem,
  useSpotBalances,
} from 'client/hooks/subaccount/useSpotBalances';
import { RepayConvertProductSelectValue } from 'client/modules/collateral/repay/hooks/useRepayConvertForm/types';
import { sortByDisplayedAssetValue } from 'client/modules/collateral/utils/sortByDisplayedAssetValue';
import { useMemo } from 'react';

interface Params {
  repayProductIdInput: number;
  sourceProductIdInput: number | undefined;
}

export function useRepayConvertProducts({
  sourceProductIdInput,
  repayProductIdInput,
}: Params) {
  const { getIsHiddenMarket } = useNadoMetadataContext();
  const { balances } = useSpotBalances();
  const { data: allMarketPrices } = useQueryAllMarketsLatestPrices();

  const availableRepayProducts =
    useMemo((): RepayConvertProductSelectValue[] => {
      return (
        balances
          ?.filter(
            // Only negative balances with quote = primary quote
            (balance) =>
              balance.amount.isNegative() &&
              balance.metadata.quoteProductId === QUOTE_PRODUCT_ID,
          )
          .map((balance) => {
            return toRepayConvertProduct(
              balance,
              false,
              allMarketPrices?.[balance.productId],
            );
          }) ?? []
      ).sort(sortByDisplayedAssetValue);
    }, [allMarketPrices, balances]);

  const selectedRepayProduct = useMemo(() => {
    return availableRepayProducts.find(
      (product) => product.productId === repayProductIdInput,
    );
  }, [availableRepayProducts, repayProductIdInput]);

  // Given the selected repay product, what are the available source products?
  const availableSourceProducts =
    useMemo((): RepayConvertProductSelectValue[] => {
      if (!selectedRepayProduct) {
        return [];
      }

      return (
        balances
          ?.filter((balance) => {
            // Disable repaying with hidden markets
            if (getIsHiddenMarket(balance.productId)) {
              return false;
            }
            // Only positive balances with quote = primary quote are allowed
            if (
              balance.amount.lte(0) ||
              balance.metadata.quoteProductId !== QUOTE_PRODUCT_ID
            ) {
              return false;
            }
            // If repaying USDT, can't sell USDT, if repaying asset, can only sell USDT
            return selectedRepayProduct.productId === QUOTE_PRODUCT_ID
              ? balance.productId !== QUOTE_PRODUCT_ID
              : balance.productId === QUOTE_PRODUCT_ID;
          })
          .map((balance) => {
            return toRepayConvertProduct(
              balance,
              true,
              allMarketPrices?.[balance.productId],
            );
          }) ?? []
      );
    }, [selectedRepayProduct, balances, getIsHiddenMarket, allMarketPrices]);

  const selectedSourceProduct = useMemo(() => {
    return availableSourceProducts.find(
      (product) => product.productId === sourceProductIdInput,
    );
  }, [availableSourceProducts, sourceProductIdInput]);

  return {
    availableRepayProducts,
    availableSourceProducts,
    selectedRepayProduct,
    selectedSourceProduct,
  };
}

function toRepayConvertProduct(
  balance: SpotBalanceItem,
  isSourceProduct: boolean,
  marketPrices: LatestMarketPrice | undefined,
): RepayConvertProductSelectValue {
  const token = balance.metadata.token;
  const amountBorrowed = balance.amountBorrowed.abs();
  const amountDeposited = balance.amountDeposited;
  const displayedAssetAmount = isSourceProduct
    ? amountDeposited
    : amountBorrowed;

  return {
    selectId: token.symbol,
    productId: balance.productId,
    icon: token.icon,
    marketName: balance.metadata.marketName,
    symbol: token.symbol,
    displayedAssetAmount,
    displayedAssetValueUsd:
      balance.oraclePrice.multipliedBy(displayedAssetAmount),
    amountBorrowed,
    decimalAdjustedNadoBalance: balance.amount,
    oraclePrice: balance.oraclePrice,
    marketPrices,
  };
}
