import {
  addDecimals,
  BalanceSide,
  BigNumbers,
  removeDecimals,
  SubaccountTx,
} from '@nadohq/client';
import {
  AnnotatedBalanceWithProduct,
  AnnotatedSpotBalanceWithProduct,
  toXStocksDisplayAmount,
  toXStocksRawAmount,
  toXStocksRawPrice,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import {
  SpotStaticMarketData,
  StaticMarketQuoteData,
} from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import {
  AdditionalSubaccountInfoFactory,
  EstimatedSubaccountInfo,
  useEstimateSubaccountInfoChange,
} from 'client/hooks/subaccount/useEstimateSubaccountInfoChange';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
import { useCallback, useMemo } from 'react';

interface AdditionalSubaccountInfo {
  assetBalance: BigNumber | undefined;
  quoteBalance: BigNumber | undefined;
}

interface TradeMetrics {
  amountToBorrow: BigNumber | undefined;
  borrowAssetSymbol: string | undefined;
}

export interface SpotTradingFormTradingAccountMetrics {
  derivedMetrics: TradeMetrics;
  currentState: EstimatedSubaccountInfo<AdditionalSubaccountInfo> | undefined;
  estimatedState: EstimatedSubaccountInfo<AdditionalSubaccountInfo> | undefined;
}

interface Params {
  currentMarket: SpotStaticMarketData | undefined;
  quoteMetadata: StaticMarketQuoteData | undefined;
  orderSide: BalanceSide;
  enableMaxSizeLogic: boolean;
  executionConversionPrice: BigNumber | undefined;
  maxAssetOrderSize: BigNumber | undefined;
  validAssetAmount: BigNumber | undefined;
}

export function useSpotTradingFormAccountMetrics({
  currentMarket,
  quoteMetadata,
  orderSide,
  executionConversionPrice,
  enableMaxSizeLogic,
  maxAssetOrderSize,
  validAssetAmount,
}: Params): SpotTradingFormTradingAccountMetrics {
  const { getExchangeRate } = useGetXStocksExchangeRate();
  const exchangeRate = useMemo(
    () => getExchangeRate(currentMarket?.productId),
    [getExchangeRate, currentMarket?.productId],
  );

  const estimateStateTxs = useMemo((): SubaccountTx[] => {
    const productId = currentMarket?.productId;
    const quoteProductId = quoteMetadata?.productId;

    const invalidOrderSize =
      enableMaxSizeLogic &&
      maxAssetOrderSize &&
      validAssetAmount?.isGreaterThan(maxAssetOrderSize);

    if (
      !productId ||
      // We can't do !quoteProductId because it can be 0
      quoteProductId == null ||
      !validAssetAmount ||
      !executionConversionPrice ||
      invalidOrderSize
    ) {
      return [];
    }

    // Simulation deltas must be in raw (wQQQx) space — convert display amount/price before addDecimals
    const rawAssetAmountWithSign = toXStocksRawAmount(
      orderSide === 'long' ? validAssetAmount : validAssetAmount.negated(),
      exchangeRate,
    );
    const assetAmountDelta = addDecimals(rawAssetAmountWithSign);
    const quoteAmountDelta = assetAmountDelta
      .multipliedBy(toXStocksRawPrice(executionConversionPrice, exchangeRate))
      .negated();

    return [
      {
        type: 'apply_delta',
        tx: {
          productId: quoteProductId,
          amountDelta: quoteAmountDelta,
          vQuoteDelta: BigNumbers.ZERO,
        },
      },
      {
        type: 'apply_delta',
        tx: {
          productId: productId,
          amountDelta: assetAmountDelta,
          vQuoteDelta: BigNumbers.ZERO,
        },
      },
    ];
  }, [
    currentMarket?.productId,
    quoteMetadata?.productId,
    enableMaxSizeLogic,
    maxAssetOrderSize,
    validAssetAmount,
    executionConversionPrice,
    orderSide,
    exchangeRate,
  ]);

  const additionalInfoFactory = useCallback<
    AdditionalSubaccountInfoFactory<AdditionalSubaccountInfo>
  >(
    (summary): AdditionalSubaccountInfo => {
      const balance = summary.balances.find(
        (b: AnnotatedBalanceWithProduct) =>
          b.productId === currentMarket?.productId,
      ) as AnnotatedSpotBalanceWithProduct;
      const quoteBalance = summary.balances.find(
        (b: AnnotatedBalanceWithProduct) =>
          b.productId === quoteMetadata?.productId,
      ) as AnnotatedSpotBalanceWithProduct;

      if (!currentMarket || !balance || !quoteBalance) {
        return {
          assetBalance: undefined,
          quoteBalance: undefined,
        };
      }

      return {
        // balance.amount is raw (wQQQx) — convert to display after decimal adjustment
        assetBalance: toXStocksDisplayAmount(
          removeDecimals(balance.amount),
          exchangeRate,
        ),
        quoteBalance: removeDecimals(quoteBalance.amount),
      };
    },
    [currentMarket, quoteMetadata?.productId, exchangeRate],
  );

  // State change
  const { current: currentState, estimated: estimatedState } =
    useEstimateSubaccountInfoChange({
      estimateStateTxs,
      additionalInfoFactory,
    });

  // Derived metrics
  const derivedMetrics = useMemo((): TradeMetrics => {
    const infoChangeMetrics = (() => {
      if (
        !currentMarket ||
        !currentState?.quoteBalance ||
        !currentState?.assetBalance ||
        !estimatedState?.quoteBalance ||
        !estimatedState?.assetBalance
      ) {
        return;
      }

      const estimatedBalance =
        orderSide === 'long'
          ? estimatedState.quoteBalance
          : estimatedState.assetBalance;
      const currentBalance =
        orderSide === 'long'
          ? currentState.quoteBalance
          : currentState.assetBalance;
      // -(new borrowed amount - old borrowed amount)
      // Example, if new balance is -10, old balance is 2, amount to borrow is 8
      const newBorrowedAmount = BigNumber.min(estimatedBalance, 0);
      const currentBorrowedAmount = BigNumber.min(currentBalance, 0);
      const amountToBorrow = newBorrowedAmount
        .minus(currentBorrowedAmount)
        .negated();

      return {
        amountToBorrow,
      };
    })();

    return {
      amountToBorrow: infoChangeMetrics?.amountToBorrow,
      borrowAssetSymbol:
        orderSide === 'long'
          ? quoteMetadata?.symbol
          : currentMarket?.metadata.token.symbol,
    };
  }, [
    currentMarket,
    currentState,
    estimatedState,
    orderSide,
    quoteMetadata?.symbol,
  ]);

  return useMemo(
    () => ({ derivedMetrics, currentState, estimatedState }),
    [currentState, derivedMetrics, estimatedState],
  );
}
