import {
  addDecimals,
  BalanceSide,
  BigNumbers,
  QUOTE_PRODUCT_ID,
  removeDecimals,
  SubaccountTx,
} from '@nadohq/client';
import {
  AnnotatedPerpBalanceWithProduct,
  calcEstimatedLiquidationPrice,
  calcEstimatedLiquidationPriceFromBalance,
  calcIsoOrderRequiredMargin,
  calcIsoPositionNetMargin,
  getHealthWeights,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { PerpStaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { useQueryLatestOraclePrices } from 'client/hooks/query/markets/useQueryLatestOraclePrices';
import { useQuerySubaccountIsolatedPositions } from 'client/hooks/query/subaccount/isolatedPositions/useQuerySubaccountIsolatedPositions';
import {
  AdditionalSubaccountInfoFactory,
  EstimatedSubaccountInfo,
  useEstimateSubaccountInfoChange,
} from 'client/hooks/subaccount/useEstimateSubaccountInfoChange';
import { MarginMode } from 'client/modules/localstorage/userState/types/tradingSettings';
import { PlaceOrderType } from 'client/modules/trading/types/placeOrderTypes';
import { useCallback, useMemo } from 'react';

interface AdditionalSubaccountInfo {
  positionAmount: BigNumber | undefined;
  estimatedLiquidationPrice: BigNumber | null | undefined;
}

interface TradeMetrics {
  costUsd: BigNumber | undefined;
}

export interface TradingFormPerpAccountMetrics {
  derivedMetrics: TradeMetrics;
  currentState: EstimatedSubaccountInfo<AdditionalSubaccountInfo> | undefined;
  estimatedState: EstimatedSubaccountInfo<AdditionalSubaccountInfo> | undefined;
}

interface Params {
  orderSide: BalanceSide;
  orderType: PlaceOrderType;
  enableMaxSizeLogic: boolean;
  isReducingIsoPosition: boolean;
  marginMode: MarginMode;
  executionConversionPrice: BigNumber | undefined;
  maxAssetOrderSize: BigNumber | undefined;
  currentMarket: PerpStaticMarketData | undefined;
  validAssetAmount: BigNumber | undefined;
}

export function usePerpTradingFormTradingAccountMetrics({
  currentMarket,
  orderSide,
  orderType,
  executionConversionPrice,
  maxAssetOrderSize,
  enableMaxSizeLogic,
  marginMode,
  isReducingIsoPosition,
  validAssetAmount,
}: Params): TradingFormPerpAccountMetrics {
  const { data: isolatedPositions } = useQuerySubaccountIsolatedPositions();
  const { data: latestOraclePrices } = useQueryLatestOraclePrices();

  const { productId, maxLeverage } = currentMarket ?? {};
  const oraclePrice = productId
    ? latestOraclePrices?.[productId]?.oraclePrice
    : undefined;
  const isMarketOrder = orderType === 'market';

  const amountDeltasWithDecimals = useMemo(() => {
    const isInvalidOrderSize =
      enableMaxSizeLogic &&
      maxAssetOrderSize &&
      validAssetAmount?.isGreaterThan(maxAssetOrderSize);

    if (isInvalidOrderSize || !validAssetAmount || !executionConversionPrice) {
      return;
    }

    const assetAmountDelta = addDecimals(
      orderSide === 'long' ? validAssetAmount : validAssetAmount.negated(),
    );

    const vQuoteDelta = assetAmountDelta
      .multipliedBy(executionConversionPrice)
      .negated();

    // The delta on the isolated position's net margin
    // Does not account for fully closing the position (where net margin is all transferred out) because it doesn't affect any computed metrics
    const isoNetMarginAmountDelta = (() => {
      // Zero margin transfer when reducing position
      if (
        marginMode.mode !== 'isolated' ||
        isReducingIsoPosition ||
        maxLeverage === undefined
      ) {
        return BigNumbers.ZERO;
      }

      return calcIsoOrderRequiredMargin({
        isMarketOrder,
        leverage: marginMode.leverage,
        marketMaxLeverage: maxLeverage,
        assetAmountWithSign: assetAmountDelta,
        orderPrice: executionConversionPrice,
        oraclePrice,
        isReducingIsoPosition,
      });
    })();

    // The quote balance delta for the cross margin balance
    const isoCrossQuoteAmountDelta = (() => {
      const existingIsolatedPosition = isolatedPositions?.find((position) => {
        return position.baseBalance.productId === productId;
      });

      if (isReducingIsoPosition) {
        const newPositionAmount =
          existingIsolatedPosition?.baseBalance.amount.plus(assetAmountDelta);

        // If new position amount is zero, we are closing the position, and net margin (ie total margin + unsettled margin) is transferred to cross
        // Otherwise, when reducing position, there is no margin transfer
        return existingIsolatedPosition && newPositionAmount?.isZero()
          ? calcIsoPositionNetMargin(
              existingIsolatedPosition.baseBalance,
              existingIsolatedPosition.quoteBalance,
            )
          : BigNumbers.ZERO;
      }

      // When increasing a position, the cross subaccount decreases in quote balance as the balance is transferred to the iso subaccount
      return isoNetMarginAmountDelta.negated();
    })();

    return {
      assetAmountDelta,
      vQuoteDelta,
      isoNetMarginAmountDelta,
      isoCrossQuoteAmountDelta,
    };
  }, [
    enableMaxSizeLogic,
    maxAssetOrderSize,
    validAssetAmount,
    executionConversionPrice,
    orderSide,
    marginMode.mode,
    marginMode.leverage,
    isReducingIsoPosition,
    maxLeverage,
    isMarketOrder,
    oraclePrice,
    isolatedPositions,
    productId,
  ]);

  const estimateStateTxs = useMemo((): SubaccountTx[] => {
    if (!productId || !amountDeltasWithDecimals) {
      return [];
    }

    // For cross, we apply a delta on the perp product
    if (marginMode.mode === 'cross') {
      return [
        {
          type: 'apply_delta',
          tx: {
            productId,
            amountDelta: amountDeltasWithDecimals.assetAmountDelta,
            vQuoteDelta: amountDeltasWithDecimals.vQuoteDelta,
          },
        },
      ];
    }
    // For iso, only the cross quote balance changes
    return [
      {
        type: 'apply_delta',
        tx: {
          productId: QUOTE_PRODUCT_ID,
          amountDelta: amountDeltasWithDecimals.isoCrossQuoteAmountDelta,
          vQuoteDelta: BigNumbers.ZERO,
        },
      },
    ];
  }, [productId, amountDeltasWithDecimals, marginMode.mode]);

  const additionalInfoFactory = useCallback<
    AdditionalSubaccountInfoFactory<AdditionalSubaccountInfo>
  >(
    (summary, isEstimate): AdditionalSubaccountInfo => {
      const crossBalanceWithProduct = summary?.balances.find(
        (product) => product.productId === productId,
      ) as AnnotatedPerpBalanceWithProduct | undefined;

      // The cross balance should always exist, even if its 0
      if (!crossBalanceWithProduct) {
        return {
          positionAmount: undefined,
          estimatedLiquidationPrice: undefined,
        };
      }

      // For cross, we can use the estimated summary directly
      if (marginMode.mode === 'cross') {
        if (!crossBalanceWithProduct) {
          return {
            positionAmount: undefined,
            estimatedLiquidationPrice: undefined,
          };
        }

        return {
          positionAmount: removeDecimals(crossBalanceWithProduct?.amount),
          estimatedLiquidationPrice: calcEstimatedLiquidationPriceFromBalance(
            crossBalanceWithProduct,
            summary.health.maintenance.health,
          ),
        };
      }

      // For isolated, we do a bit of a hack, `AdditionalSubaccountInfoFactory` doesn't have the ability to estimate
      // changes in isolated positions, so we add stuff manually. This is OK for the time being because this hook
      // is the only place where this pattern is used.
      if (!isolatedPositions || !productId) {
        return {
          positionAmount: undefined,
          estimatedLiquidationPrice: undefined,
        };
      }
      // Unlike cross, isolated positions do not exist if the amount is 0
      const existingIsolatedPosition = isolatedPositions.find((position) => {
        return position.baseBalance.productId === productId;
      });

      if (!isEstimate) {
        // For non-estimate, we use the existing isolated position
        return {
          positionAmount: removeDecimals(
            existingIsolatedPosition?.baseBalance.amount,
          ),
          estimatedLiquidationPrice: existingIsolatedPosition
            ? calcEstimatedLiquidationPrice({
                longWeightMaintenance:
                  crossBalanceWithProduct.longWeightMaintenance,
                maintHealth: existingIsolatedPosition.healths.maintenance,
                oraclePrice: crossBalanceWithProduct.oraclePrice,
                shortWeightMaintenance:
                  crossBalanceWithProduct.shortWeightMaintenance,
                amount: existingIsolatedPosition.baseBalance.amount,
              })
            : undefined,
        };
      }

      // We require deltas to be present for estimates
      if (!amountDeltasWithDecimals) {
        return {
          positionAmount: undefined,
          estimatedLiquidationPrice: undefined,
        };
      }

      const currentPositionAmount =
        existingIsolatedPosition?.baseBalance.amount ?? BigNumbers.ZERO;
      const newPositionAmount = currentPositionAmount.plus(
        amountDeltasWithDecimals.assetAmountDelta,
      );

      const currentMaintHealth =
        existingIsolatedPosition?.healths.maintenance ?? BigNumbers.ZERO;
      // Maintenance health = weight * amount * oracle_price + v_quote + quote_margin
      const maintWeight = getHealthWeights(
        // Cannot switch sides for iso, so both current position & new position should be on the same side
        // However, current position can be zero (ie. opening a new position) and new position can be zero (ie. closing a position), but they cannot be both zero
        currentPositionAmount.isZero()
          ? newPositionAmount
          : currentPositionAmount,
        crossBalanceWithProduct,
      ).maintenance;
      const maintHealthDelta = maintWeight
        .multipliedBy(amountDeltasWithDecimals.assetAmountDelta)
        .multipliedBy(crossBalanceWithProduct.oraclePrice)
        .plus(amountDeltasWithDecimals.vQuoteDelta)
        .plus(amountDeltasWithDecimals.isoNetMarginAmountDelta);
      const newMaintHealth = currentMaintHealth.plus(maintHealthDelta);

      return {
        positionAmount: removeDecimals(newPositionAmount),
        estimatedLiquidationPrice: calcEstimatedLiquidationPrice({
          longWeightMaintenance: crossBalanceWithProduct.longWeightMaintenance,
          maintHealth: newMaintHealth,
          oraclePrice: crossBalanceWithProduct.oraclePrice,
          shortWeightMaintenance:
            crossBalanceWithProduct.shortWeightMaintenance,
          amount: newPositionAmount,
        }),
      };
    },
    [marginMode, isolatedPositions, productId, amountDeltasWithDecimals],
  );

  // State change
  const { current: currentState, estimated: estimatedState } =
    useEstimateSubaccountInfoChange({
      estimateStateTxs,
      additionalInfoFactory,
    });

  // Derived metrics
  const derivedMetrics = useMemo((): TradeMetrics => {
    return {
      // Cost is the decrease in funds available from the order
      costUsd: currentState
        ? estimatedState?.initialMarginBoundedUsd
            .minus(currentState.initialMarginBoundedUsd)
            .negated()
        : undefined,
    };
  }, [currentState, estimatedState?.initialMarginBoundedUsd]);

  return { derivedMetrics, currentState, estimatedState };
}
