import {
  addDecimals,
  BigNumbers,
  calcPerpBalanceNotionalValue,
  QUOTE_PRODUCT_ID,
  removeDecimals,
  SubaccountTx,
} from '@nadohq/client';
import {
  calcEstimatedLiquidationPriceFromBalance,
  calcIsoPositionLeverage,
  calcIsoPositionNetMargin,
  getMarketPriceFormatSpecifier,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { ISO_MARGIN_TRANSFER_FEE_AMOUNT_USDT } from 'client/consts/isoMarginTransferFee';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useQueryLatestOraclePrices } from 'client/hooks/query/markets/useQueryLatestOraclePrices';
import { useQuerySubaccountIsolatedPositions } from 'client/hooks/query/subaccount/isolatedPositions/useQuerySubaccountIsolatedPositions';
import { useCollateralEstimateSubaccountInfoChange } from 'client/modules/collateral/hooks/useCollateralEstimateSubaccountInfoChange';
import { useMemo } from 'react';

interface IsolatedAdjustMarginSummary {
  isoNetMarginUsd: BigNumber | undefined;
  isoTotalMarginUsd: BigNumber | undefined;
  isoPositionLeverage: BigNumber | undefined;
  isoLiquidationPrice: BigNumber | undefined | null;
  crossAccountQuoteBalance: BigNumber | undefined;
  initialMargin: BigNumber | undefined;
  crossMarginUsageFrac: BigNumber | undefined;
}

interface Params {
  validAmount: BigNumber | undefined;
  isoSubaccountName: string;
  isAddMargin: boolean;
}

export function useIsolatedAdjustMarginSummary({
  validAmount,
  isoSubaccountName,
  isAddMargin,
}: Params) {
  const { data: isoPositions } = useQuerySubaccountIsolatedPositions();
  const { data: latestOraclePrices } = useQueryLatestOraclePrices();
  const { data: allMarketsStaticData } = useAllMarketsStaticData();

  const currentIsoPosition = useMemo(
    () =>
      isoPositions?.find(
        (iso) => iso.subaccount.subaccountName === isoSubaccountName,
      ),
    [isoPositions, isoSubaccountName],
  );

  const currentProductId = currentIsoPosition?.baseBalance.productId;

  const estimateCrossAccountStateTxs = useMemo((): SubaccountTx[] => {
    if (!validAmount) {
      return [];
    }

    const validAmountWithDecimals = addDecimals(validAmount);

    const amountDelta = isAddMargin
      ? validAmountWithDecimals.negated()
      : addDecimals(validAmount.minus(ISO_MARGIN_TRANSFER_FEE_AMOUNT_USDT));

    return [
      {
        type: 'apply_delta',
        tx: {
          productId: QUOTE_PRODUCT_ID,
          vQuoteDelta: BigNumbers.ZERO,
          amountDelta,
        },
      },
    ];
  }, [validAmount, isAddMargin]);

  const {
    current: currentCollateralSummary,
    estimated: estimatedCollateralSummary,
  } = useCollateralEstimateSubaccountInfoChange({
    estimateStateTxs: estimateCrossAccountStateTxs,
    productId: QUOTE_PRODUCT_ID,
  });

  const {
    isoNetMarginWithDecimals,
    isoPositionLeverage,
    isoNotionalValueWithDecimals,
    isoLiquidationPrice,
    isoTotalMarginWithDecimals,
  } = useMemo(() => {
    if (!currentIsoPosition) {
      return {};
    }

    const isoNetMarginWithDecimals = calcIsoPositionNetMargin(
      currentIsoPosition.baseBalance,
      currentIsoPosition.quoteBalance,
    );
    const isoTotalMarginWithDecimals = currentIsoPosition.quoteBalance.amount;

    const isoNotionalValueWithDecimals = calcPerpBalanceNotionalValue(
      currentIsoPosition.baseBalance,
    );

    const isoPositionLeverage = calcIsoPositionLeverage({
      totalMargin: isoTotalMarginWithDecimals,
      vQuoteBalance: currentIsoPosition.baseBalance.vQuoteBalance,
      positionNotionalValueWithSign: isoNotionalValueWithDecimals.multipliedBy(
        currentIsoPosition.baseBalance.amount.s ?? 1,
      ),
    });

    const isoLiquidationPrice = calcEstimatedLiquidationPriceFromBalance(
      currentIsoPosition.baseBalance,
      currentIsoPosition.healths.maintenance,
    );

    return {
      isoNetMarginWithDecimals,
      isoNotionalValueWithDecimals,
      isoPositionLeverage,
      isoLiquidationPrice,
      isoTotalMarginWithDecimals,
    };
  }, [currentIsoPosition]);

  const currentSummary = useMemo((): IsolatedAdjustMarginSummary => {
    return {
      isoNetMarginUsd: removeDecimals(isoNetMarginWithDecimals),
      isoTotalMarginUsd: removeDecimals(isoTotalMarginWithDecimals),
      isoPositionLeverage,
      isoLiquidationPrice,
      crossAccountQuoteBalance: currentCollateralSummary?.nadoBalance,
      initialMargin: currentCollateralSummary?.initialMarginBoundedUsd,
      crossMarginUsageFrac: currentCollateralSummary?.marginUsageBounded,
    };
  }, [
    isoNetMarginWithDecimals,
    isoTotalMarginWithDecimals,
    isoPositionLeverage,
    isoLiquidationPrice,
    currentCollateralSummary?.nadoBalance,
    currentCollateralSummary?.initialMarginBoundedUsd,
    currentCollateralSummary?.marginUsageBounded,
  ]);

  const estimatedSummary = useMemo(():
    | IsolatedAdjustMarginSummary
    | undefined => {
    if (!validAmount || !currentSummary) {
      return undefined;
    }

    const validAmountWithFee = validAmount.minus(
      ISO_MARGIN_TRANSFER_FEE_AMOUNT_USDT,
    );
    const validAmountWithDecimals = addDecimals(validAmount);
    const validAmountWithDecimalsWithFee = addDecimals(validAmountWithFee);

    const isoNetMarginDeltaWithDecimals = isAddMargin
      ? validAmountWithDecimalsWithFee
      : validAmountWithDecimals.negated();
    const estimatedIsoNetMarginWithDecimals = isoNetMarginWithDecimals?.plus(
      isoNetMarginDeltaWithDecimals,
    );
    const estimatedIsoTotalMarginWithDecimals =
      isoTotalMarginWithDecimals?.plus(isoNetMarginDeltaWithDecimals);

    const estimatedIsoLiquidationPrice = (() => {
      if (!currentIsoPosition) {
        return undefined;
      }

      return calcEstimatedLiquidationPriceFromBalance(
        currentIsoPosition.baseBalance,
        currentIsoPosition.healths.maintenance.plus(
          isoNetMarginDeltaWithDecimals,
        ),
      );
    })();

    const estimatedIsoLeverage = (() => {
      if (
        !estimatedIsoTotalMarginWithDecimals ||
        !isoNotionalValueWithDecimals ||
        !currentIsoPosition
      ) {
        return;
      }

      return calcIsoPositionLeverage({
        totalMargin: estimatedIsoTotalMarginWithDecimals,
        // vQuoteBalance doesn't change with margin adjustments
        vQuoteBalance: currentIsoPosition.baseBalance.vQuoteBalance,
        positionNotionalValueWithSign:
          isoNotionalValueWithDecimals.multipliedBy(
            currentIsoPosition.baseBalance.amount.s ?? 1,
          ),
      });
    })();

    return {
      isoTotalMarginUsd: removeDecimals(estimatedIsoTotalMarginWithDecimals),
      isoNetMarginUsd: removeDecimals(estimatedIsoNetMarginWithDecimals),
      isoPositionLeverage: estimatedIsoLeverage,
      isoLiquidationPrice: estimatedIsoLiquidationPrice,
      crossAccountQuoteBalance: estimatedCollateralSummary?.nadoBalance,
      initialMargin: estimatedCollateralSummary?.initialMarginBoundedUsd,
      crossMarginUsageFrac: estimatedCollateralSummary?.marginUsageBounded,
    };
  }, [
    validAmount,
    currentSummary,
    isAddMargin,
    isoNetMarginWithDecimals,
    isoTotalMarginWithDecimals,
    estimatedCollateralSummary?.nadoBalance,
    estimatedCollateralSummary?.initialMarginBoundedUsd,
    estimatedCollateralSummary?.marginUsageBounded,
    currentIsoPosition,
    isoNotionalValueWithDecimals,
  ]);

  const oraclePrice = (() => {
    if (!currentProductId) {
      return undefined;
    }

    // Use fast oracle price if available, otherwise use the current oracle price
    return latestOraclePrices?.[currentProductId]
      ? latestOraclePrices[currentProductId].oraclePrice
      : currentIsoPosition?.baseBalance.oraclePrice;
  })();

  const marketPriceFormatSpecifier = getMarketPriceFormatSpecifier(
    currentProductId
      ? allMarketsStaticData?.perpMarkets[currentProductId]?.priceIncrement
      : undefined,
  );

  return {
    currentSummary,
    estimatedSummary,
    marketPriceFormatSpecifier,
    metadata: currentIsoPosition?.baseBalance.metadata,
    side: currentIsoPosition?.baseBalance.amount.isPositive()
      ? 'long'
      : 'short',
    oraclePrice,
  };
}
