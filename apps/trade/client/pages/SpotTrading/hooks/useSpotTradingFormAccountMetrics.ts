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

    const assetAmountDelta = addDecimals(
      orderSide === 'long' ? validAssetAmount : validAssetAmount.negated(),
    );
    const quoteAmountDelta = assetAmountDelta
      .multipliedBy(executionConversionPrice)
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
        assetBalance: removeDecimals(balance.amount),
        quoteBalance: removeDecimals(quoteBalance.amount),
      };
    },
    [currentMarket, quoteMetadata?.productId],
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
