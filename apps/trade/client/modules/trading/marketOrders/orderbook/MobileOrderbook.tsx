import { BigNumbers } from '@nadohq/client';
import { formatNumber, safeDiv } from '@nadohq/react-client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { Divider, Icons } from '@nadohq/web-ui';
import { useEnableTradingOrderbookAnimations } from 'client/modules/trading/hooks/useEnableTradingOrderbookAnimations';
import { MarketOrderRow } from 'client/modules/trading/marketOrders/components/MarketOrderRow';
import { MarketOrderRows } from 'client/modules/trading/marketOrders/components/MarketOrderRows';
import { MarketOrdersHeaderRow } from 'client/modules/trading/marketOrders/components/MarketOrdersHeaderRow';
import { OrderbookPriceBox } from 'client/modules/trading/marketOrders/orderbook/components/OrderbookPriceBox';
import { TickSpacingSelect } from 'client/modules/trading/marketOrders/orderbook/components/TickSpacingSelect';
import { TotalAmountDenomSelect } from 'client/modules/trading/marketOrders/orderbook/components/TotalAmountDenomSelect';
import { OrderbookRowItem } from 'client/modules/trading/marketOrders/orderbook/hooks/types';
import { useOrderbook } from 'client/modules/trading/marketOrders/orderbook/hooks/useOrderbook/useOrderbook';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  productId: number | undefined;
  depth: number;
}

const ORDERBOOK_ROW_PADDING = 'px-1.5';

const SKELETON_ROW = (
  <MarketOrderRow.Skeleton className={ORDERBOOK_ROW_PADDING} numCols={2} />
);

export function MobileOrderbook({ className, productId, depth }: Props) {
  const { t } = useTranslation();

  const {
    orderbookData,
    setNewPriceInput,
    priceFormatSpecifier,
    amountSymbol,
    tickSpacingMultiplier,
    currentTickSpacing,
    setTickSpacingMultiplier,
    showOrderbookTotalInQuote,
    setShowOrderbookTotalInQuote,
    openOrderPrices,
    cumulativeAmountSpecifier,
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
          className={ORDERBOOK_ROW_PADDING}
          isSell={row.isAsk}
          highlightWidthFraction={highlightWidthFraction}
          onClick={() => setNewPriceInput(row.price)}
          flashKey={row.assetAmount?.toString()}
          definitionId={hasOpenOrder ? 'tradingOrderbookOpenOrder' : undefined}
          enableAnimations={enableTradingOrderbookAnimations}
        >
          <MarketOrderRow.Item isSell={row.isAsk}>
            {hasOpenOrder && (
              <Icons.CaretRightFill
                className="absolute top-1/2 left-0 -translate-y-1/2"
                size={8}
              />
            )}
            {formatNumber(row.price, {
              formatSpecifier: priceFormatSpecifier,
            })}
          </MarketOrderRow.Item>
          <MarketOrderRow.Item className="justify-end">
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
      cumulativeAmountSpecifier,
      setNewPriceInput,
      enableTradingOrderbookAnimations,
    ],
  );

  return (
    <div className={joinClassNames('flex flex-col', className)}>
      <div
        className={joinClassNames(
          'flex justify-between gap-x-1.5 py-3',
          ORDERBOOK_ROW_PADDING,
        )}
      >
        <TickSpacingSelect
          priceIncrement={orderbookData?.priceIncrement}
          currentTickSpacing={currentTickSpacing}
          tickSpacingMultiplier={tickSpacingMultiplier}
          setTickSpacingMultiplier={setTickSpacingMultiplier}
        />
        <TotalAmountDenomSelect
          symbol={orderbookData?.productMetadata.symbol}
          quoteSymbol={orderbookData?.quoteSymbol}
          showOrderbookTotalInQuote={showOrderbookTotalInQuote}
          setShowOrderbookTotalInQuote={setShowOrderbookTotalInQuote}
        />
      </div>
      <Divider />
      <div className="flex flex-1 flex-col">
        <MarketOrdersHeaderRow.Container className={ORDERBOOK_ROW_PADDING}>
          <MarketOrdersHeaderRow.Item>
            {t(($) => $.price)}
          </MarketOrdersHeaderRow.Item>
          <MarketOrdersHeaderRow.Item className="justify-end">
            {amountSymbol}
          </MarketOrdersHeaderRow.Item>
        </MarketOrdersHeaderRow.Container>
        <div className="flex flex-col gap-y-1">
          <MarketOrderRows
            rows={orderbookData?.asks}
            numRows={depth}
            skeletonRow={SKELETON_ROW}
            renderRow={renderRow}
            reverseRows
          />
          <OrderbookPriceBox
            className={joinClassNames(
              ORDERBOOK_ROW_PADDING,
              'flex-col gap-y-1.5 text-xs',
            )}
            priceIncrement={orderbookData?.priceIncrement}
            setPriceInput={setNewPriceInput}
            lastPrice={lastPrice}
            spread={orderbookData?.spread}
          />
          <MarketOrderRows
            numRows={depth}
            rows={orderbookData?.bids}
            skeletonRow={SKELETON_ROW}
            renderRow={renderRow}
          />
        </div>
      </div>
    </div>
  );
}
