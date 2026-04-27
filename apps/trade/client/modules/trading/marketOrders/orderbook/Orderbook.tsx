import { BigNumbers } from '@nadohq/client';
import { formatNumber, safeDiv } from '@nadohq/react-client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { Divider, Icons } from '@nadohq/web-ui';
import { useEnableTradingOrderbookAnimations } from 'client/modules/trading/hooks/useEnableTradingOrderbookAnimations';
import { MarketOrderRow } from 'client/modules/trading/marketOrders/components/MarketOrderRow';
import { MarketOrderRows } from 'client/modules/trading/marketOrders/components/MarketOrderRows';
import { MarketOrdersHeaderRow } from 'client/modules/trading/marketOrders/components/MarketOrdersHeaderRow';
import { OrderbookPriceBox } from 'client/modules/trading/marketOrders/orderbook/components/OrderbookPriceBox';
import { OrderbookSettings } from 'client/modules/trading/marketOrders/orderbook/components/OrderbookSettings';
import { OrderbookRowItem } from 'client/modules/trading/marketOrders/orderbook/hooks/types';
import { useOrderbook } from 'client/modules/trading/marketOrders/orderbook/hooks/useOrderbook/useOrderbook';
import { OrderbookViewType } from 'client/modules/trading/marketOrders/orderbook/types';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  productId: number | undefined;
}

const SKELETON_ROW = <MarketOrderRow.Skeleton numCols={3} />;

export function Orderbook({ className, productId }: Props) {
  const { t } = useTranslation();

  const [viewType, setViewType] = useState<OrderbookViewType>('bids_and_asks');
  // Depth is per-side, so we need to show more rows when only viewing one side of the book
  const depth = (() => {
    switch (viewType) {
      case 'only_bids':
        return 40;
      case 'only_asks':
        return 40;
      case 'bids_and_asks':
        return 24;
    }
  })();

  const {
    orderbookData,
    setNewPriceInput,
    priceFormatSpecifier,
    amountFormatSpecifier,
    cumulativeAmountSpecifier,
    amountSymbol,
    tickSpacingMultiplier,
    currentTickSpacing,
    setTickSpacingMultiplier,
    showOrderbookTotalInQuote,
    setShowOrderbookTotalInQuote,
    openOrderPrices,
    lastPrice,
  } = useOrderbook({
    productId,
    depth,
  });

  const { enableTradingOrderbookAnimations } =
    useEnableTradingOrderbookAnimations();

  const renderRow = useCallback(
    (row: OrderbookRowItem) => {
      const highlightWidthFraction = safeDiv(
        row.cumulativeAmount,
        orderbookData?.maxCumulativeTotalAmount ?? BigNumbers.ZERO,
      );

      const hasOpenOrder = openOrderPrices?.has(row.price.toString());

      return (
        <MarketOrderRow.Container
          isSell={row.isAsk}
          highlightWidthFraction={highlightWidthFraction}
          onClick={() => setNewPriceInput(row.price)}
          flashKey={row.assetAmount?.toString()}
          definitionId={hasOpenOrder ? 'tradingOrderbookOpenOrder' : undefined}
          enableAnimations={enableTradingOrderbookAnimations}
        >
          <MarketOrderRow.Item isSell={row.isAsk} className="font-medium">
            {hasOpenOrder && (
              <Icons.CaretRightFill className="absolute top-1/2 -left-1 -translate-y-1/2 text-xs" />
            )}
            {formatNumber(row.price, {
              formatSpecifier: priceFormatSpecifier,
            })}
          </MarketOrderRow.Item>
          <MarketOrderRow.Item>
            {formatNumber(row.assetAmount, {
              formatSpecifier: amountFormatSpecifier,
            })}
          </MarketOrderRow.Item>
          <MarketOrderRow.Item>
            {formatNumber(row.cumulativeAmount, {
              formatSpecifier: cumulativeAmountSpecifier,
            })}
          </MarketOrderRow.Item>
        </MarketOrderRow.Container>
      );
    },
    [
      orderbookData?.maxCumulativeTotalAmount,
      openOrderPrices,
      priceFormatSpecifier,
      amountFormatSpecifier,
      cumulativeAmountSpecifier,
      setNewPriceInput,
      enableTradingOrderbookAnimations,
    ],
  );

  return (
    <div className={joinClassNames('flex flex-col gap-y-1', className)}>
      <OrderbookSettings
        viewType={viewType}
        setViewType={setViewType}
        priceIncrement={orderbookData?.priceIncrement}
        symbol={orderbookData?.productMetadata.symbol}
        quoteSymbol={orderbookData?.quoteSymbol}
        currentTickSpacing={currentTickSpacing}
        tickSpacingMultiplier={tickSpacingMultiplier}
        setTickSpacingMultiplier={setTickSpacingMultiplier}
        showOrderbookTotalInQuote={showOrderbookTotalInQuote}
        setShowOrderbookTotalInQuote={setShowOrderbookTotalInQuote}
      />
      <Divider />
      <div className="flex flex-1 flex-col overflow-hidden">
        <MarketOrdersHeaderRow.Container>
          <MarketOrdersHeaderRow.Item>
            {t(($) => $.price)}
          </MarketOrdersHeaderRow.Item>
          <MarketOrdersHeaderRow.Item>
            {t(($) => $.size)}
          </MarketOrdersHeaderRow.Item>
          <MarketOrdersHeaderRow.Item>
            {t(($) => $.totalSymbol, { symbol: amountSymbol })}
          </MarketOrdersHeaderRow.Item>
        </MarketOrdersHeaderRow.Container>
        <div className="flex flex-1 flex-col gap-y-0.5 overflow-hidden">
          {viewType !== 'only_bids' && (
            <MarketOrderRows
              className="flex-1"
              rows={orderbookData?.asks}
              numRows={depth}
              skeletonRow={SKELETON_ROW}
              renderRow={renderRow}
              reverseRows
            />
          )}
          <OrderbookPriceBox
            priceIncrement={orderbookData?.priceIncrement}
            setPriceInput={setNewPriceInput}
            lastPrice={lastPrice}
            spread={orderbookData?.spread}
            className="text-sm"
          />
          {viewType !== 'only_asks' && (
            <MarketOrderRows
              className="flex-1"
              numRows={depth}
              rows={orderbookData?.bids}
              skeletonRow={SKELETON_ROW}
              renderRow={renderRow}
            />
          )}
        </div>
      </div>
    </div>
  );
}
