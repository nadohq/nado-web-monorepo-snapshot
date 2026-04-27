import { BigNumbers, ProductEngineType } from '@nadohq/client';
import {
  formatNumber,
  getMarketSizeFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import {
  PerpPositionItem,
  usePerpPositions,
} from 'client/hooks/subaccount/usePerpPositions';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { MarginModeType } from 'client/modules/localstorage/userState/types/tradingSettings';
import { useIsSingleSignatureSession } from 'client/modules/singleSignatureSessions/hooks/useIsSingleSignatureSession';
import { getResolvedColorValue } from 'client/modules/theme/colorVars';
import { TradingViewSymbolInfo } from 'client/modules/trading/chart/config/datafeedConfig';
import { useHandleMarketClosePosition } from 'client/modules/trading/closePosition/hooks/useHandleMarketClosePosition';
import { useEnableTradingPositionLines } from 'client/modules/trading/hooks/useEnableTradingPositionLines';
import type { TFunction } from 'i18next';
import {
  IChartingLibraryWidget,
  IChartWidgetApi,
  IPositionLineAdapter,
} from 'public/charting_library';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface Params {
  tvWidget: IChartingLibraryWidget | undefined;
  loadedSymbolInfo: TradingViewSymbolInfo | undefined;
}

interface PositionLines {
  entryLine: IPositionLineAdapter;
  liquidationLine: IPositionLineAdapter | undefined;
}

type PositionLinesByMarginModeType = Map<MarginModeType, PositionLines>;

/**
 * Mapping from product ID to the isolated/cross position lines (entry + liquidation) for that product
 */
type PositionLinesByProductId = Map<number, PositionLinesByMarginModeType>;

/**
 * Draws both entry and liquidation lines for perp positions on the TradingView chart.
 * Entry lines show the average entry price, PnL, and allow closing positions or modifying TP/SL.
 * Liquidation lines show the estimated liquidation price for the position.
 */
export function useDrawChartPositionLines({
  tvWidget,
  loadedSymbolInfo,
}: Params) {
  const { t } = useTranslation();

  const existingLinesByProductId = useRef<PositionLinesByProductId>(new Map());

  const { data: perpPositionsData } = usePerpPositions();
  const { data: marketsStaticData } = useAllMarketsStaticData();
  const isSingleSignatureSession = useIsSingleSignatureSession({
    requireActive: true,
  });
  const { show } = useDialog();
  const handleMarketClosePosition = useHandleMarketClosePosition();
  const { enableTradingPositionLines } = useEnableTradingPositionLines();

  // When TV Widget reloads, clear any cached lines as they are all removed
  useEffect(() => {
    existingLinesByProductId.current.clear();
  }, [tvWidget]);

  // When a user disables showing position lines, remove all existing lines
  useEffect(() => {
    if (!enableTradingPositionLines) {
      existingLinesByProductId.current.forEach((positionLines) => {
        positionLines.forEach(({ entryLine, liquidationLine }) => {
          entryLine.remove();
          liquidationLine?.remove();
        });
      });
      existingLinesByProductId.current.clear();
    }
  }, [enableTradingPositionLines]);

  /**
   * Cases:
   * - Not perp: no action needed
   * - No position: clear lines if they exist
   * - No existing lines: create
   * - Existing lines: update
   * - Disabled: Don't draw lines
   */
  return useCallback(() => {
    if (
      !loadedSymbolInfo ||
      loadedSymbolInfo.productType === ProductEngineType.SPOT ||
      !enableTradingPositionLines
    ) {
      return;
    }

    const selectedProductId = loadedSymbolInfo?.productId;
    const marketData = marketsStaticData?.allMarkets[selectedProductId];

    if (!tvWidget || !marketData || !selectedProductId || !perpPositionsData) {
      return;
    }

    const activeChart = tvWidget.activeChart();

    const openPositions = perpPositionsData.filter(
      (position) => position.productId === selectedProductId,
    );

    const existingPositionLines: PositionLinesByMarginModeType =
      existingLinesByProductId.current.get(selectedProductId) ?? new Map();

    const newPositionLines: PositionLinesByMarginModeType = new Map();

    openPositions.forEach((position) => {
      const marginModeType: MarginModeType = !!position.iso
        ? 'isolated'
        : 'cross';
      const hasNoPosition = position.amount.isZero();
      const hasInvalidData = !position.price.averageEntryPrice?.toNumber(); // Undefined or 0.

      // If there is no position or invalid data. This will remove the lines afterwards.
      if (hasNoPosition || hasInvalidData) {
        return;
      }

      const existingLines = existingPositionLines.get(marginModeType);

      const sizeFormatSpecifier = getMarketSizeFormatSpecifier({
        sizeIncrement: marketData.sizeIncrement,
      });

      const onClosePositionClick = () => {
        handleMarketClosePosition({
          productId: position.productId,
          isoSubaccountName: position.iso?.subaccountName,
        });
      };

      const onTpSlClick = () => {
        if (!isSingleSignatureSession) {
          return;
        }

        show({
          type: 'manage_tp_sl',
          params: {
            productId: position.productId,
            isIso: !!position.iso,
          },
        });
      };

      const onReverseClick = () => {
        show({
          type: 'reverse_position',
          params: {
            productId: position.productId,
            isIso: !!position.iso,
          },
        });
      };

      // Create or update entry line
      const entryLine = createOrUpdateEntryLine({
        t,
        activeChart,
        position,
        sizeFormatSpecifier,
        onClosePositionClick,
        isSingleSignatureSession,
        onTpSlClick,
        onReverseClick,
        existingLine: existingLines?.entryLine,
      });

      const liquidationLine = upsertOrRemoveLiquidationLine({
        t,
        activeChart,
        position,
        existingLine: existingLines?.liquidationLine,
      });

      newPositionLines.set(marginModeType, { entryLine, liquidationLine });
    });

    // Remove lines no longer relevant ie) those in existingPositionLines but not in newPositionLines
    existingPositionLines.forEach(
      ({ entryLine, liquidationLine }, marginModeType) => {
        if (!newPositionLines.has(marginModeType)) {
          console.debug(
            '[useDrawChartPositionLines]: Removing position lines:',
            marginModeType,
          );
          entryLine.remove();
          liquidationLine?.remove();
        }
      },
    );

    existingLinesByProductId.current.set(selectedProductId, newPositionLines);
  }, [
    loadedSymbolInfo,
    enableTradingPositionLines,
    marketsStaticData?.allMarkets,
    tvWidget,
    perpPositionsData,
    show,
    handleMarketClosePosition,
    isSingleSignatureSession,
    t,
  ]);
}

interface CreateOrUpdateEntryLineParams {
  t: TFunction;
  activeChart: IChartWidgetApi;
  position: PerpPositionItem;
  sizeFormatSpecifier: string;
  onClosePositionClick: () => void;
  isSingleSignatureSession: boolean;
  onTpSlClick: () => void;
  onReverseClick: () => void;
  existingLine?: IPositionLineAdapter;
}

function createOrUpdateEntryLine({
  t,
  activeChart,
  position,
  sizeFormatSpecifier,
  onClosePositionClick,
  isSingleSignatureSession,
  onTpSlClick,
  onReverseClick,
  existingLine,
}: CreateOrUpdateEntryLineParams) {
  // At this point, average entry price should never be undefined
  const averageEntryPrice = position.price.averageEntryPrice?.toNumber() ?? 0;
  /**
   * Unlike the font fns which accept CSS variables, we need to use the actual color values here.
   * Otherwise the charting library will not render the colors correctly.
   */
  const primaryTextColor = getResolvedColorValue('text-primary');
  const secondaryTextColor = getResolvedColorValue('text-secondary');
  const backgroundColor = getResolvedColorValue('background');
  const positiveColor = getResolvedColorValue('positive');
  const negativeColor = getResolvedColorValue('negative');

  const isLong = position.amount.gte(0);
  const sideColor = isLong ? positiveColor : negativeColor;

  const isIso = !!position.iso;
  const marginTypeLabel = isIso
    ? t(($) => $.isolatedAbbrev)
    : t(($) => $.cross);

  const pnlUsd = position.estimatedPnlUsd ?? BigNumbers.ZERO;

  const formattedPnl = formatNumber(pnlUsd, {
    formatSpecifier: PresetNumberFormatSpecifier.SIGNED_CURRENCY_2DP,
  });

  const contentText = `${t(($) => $.tradingChart.pnlLabel, {
    formattedPnl,
    marginTypeLabel,
  })}`;

  const amountText = formatNumber(position.amount, {
    formatSpecifier: sizeFormatSpecifier,
  });

  const tpSlTooltipContent = isSingleSignatureSession
    ? t(($) => $.tradingChart.tooltips.manageTpSl)
    : t(($) => $.tradingChart.tooltips.enableOneClickTrading);

  const entryLine = existingLine ?? activeChart.createPositionLine();

  return entryLine
    .setPrice(averageEntryPrice)
    .setBodyTextColor(primaryTextColor)
    .setBodyBorderColor(sideColor)
    .setBodyBackgroundColor(backgroundColor)
    .setBodyFont(`11px var(--font-default)`)
    .setText(contentText)
    .setLineLength(isIso ? 40 : 54)
    .setLineStyle(0) // we use 0 (solid) for position lines, 2 (dashed) for order lines
    .setLineColor(sideColor)
    .setQuantity(amountText)
    .setQuantityFont(`11px var(--font-default)`)
    .setQuantityTextColor(backgroundColor)
    .setQuantityBackgroundColor(sideColor)
    .setQuantityBorderColor(sideColor)
    .onClose(onClosePositionClick)
    .setCloseButtonBorderColor(sideColor)
    .setCloseButtonIconColor(secondaryTextColor)
    .setCloseButtonBackgroundColor(backgroundColor)
    .setProtectTooltip(tpSlTooltipContent)
    .onModify(onTpSlClick)
    .onReverse(onReverseClick)
    .setReverseTooltip(t(($) => $.tradingChart.tooltips.reversePosition))
    .setReverseButtonBorderColor(sideColor)
    .setReverseButtonIconColor(secondaryTextColor)
    .setReverseButtonBackgroundColor(backgroundColor);
}

interface UpsertOrRemoveLiquidationLineParams {
  t: TFunction;
  activeChart: IChartWidgetApi;
  position: PerpPositionItem;
  existingLine?: IPositionLineAdapter;
}

function upsertOrRemoveLiquidationLine({
  t,
  activeChart,
  position,
  existingLine,
}: UpsertOrRemoveLiquidationLineParams) {
  const estimatedLiquidationPrice =
    position.estimatedLiquidationPrice?.toNumber();

  if (!estimatedLiquidationPrice) {
    existingLine?.remove();
    return;
  }

  /**
   * Unlike the font fns which accept CSS variables, we need to use the actual color values here.
   * Otherwise the charting library will not render the colors correctly.
   */
  const primaryTextColor = getResolvedColorValue('text-primary');
  const backgroundColor = getResolvedColorValue('background');
  const warningColor = getResolvedColorValue('warning');

  const isIso = !!position.iso;
  const marginTypeLabel = isIso
    ? t(($) => $.isolatedAbbrev)
    : t(($) => $.cross);

  const tooltipText = isIso
    ? t(($) => $.tradingChart.tooltips.isoLiquidationPriceDesc)
    : t(($) => $.tradingChart.tooltips.crossLiquidationPriceDesc);

  const liquidationLine = existingLine ?? activeChart.createPositionLine();

  return liquidationLine
    .setPrice(estimatedLiquidationPrice)
    .setBodyTextColor(primaryTextColor)
    .setBodyBorderColor(warningColor)
    .setBodyBackgroundColor(backgroundColor)
    .setBodyFont(`11px var(--font-default)`)
    .setText(t(($) => $.tradingChart.estLiquidationLabel, { marginTypeLabel }))
    .setLineLength(70) // Distance from orderbox to right-most side of chart.
    .setLineStyle(0) // we use 0 (solid) for position lines, 2 (dashed) for order lines
    .setLineColor(warningColor)
    .setQuantity('')
    .setTooltip(tooltipText);
}
