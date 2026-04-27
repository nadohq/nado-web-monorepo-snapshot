import { BigNumbers } from '@nadohq/client';
import { formatNumber, safeDiv } from '@nadohq/react-client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { formatTimestamp, TimeFormatSpecifier } from '@nadohq/web-ui';
import { useSyncedRef } from 'client/hooks/util/useSyncedRef';
import { useEnableTradingOrderbookAnimations } from 'client/modules/trading/hooks/useEnableTradingOrderbookAnimations';
import { MarketOrderRow } from 'client/modules/trading/marketOrders/components/MarketOrderRow';
import { MarketOrderRows } from 'client/modules/trading/marketOrders/components/MarketOrderRows';
import { MarketOrdersHeaderRow } from 'client/modules/trading/marketOrders/components/MarketOrdersHeaderRow';
import {
  MarketTradeRowItem,
  useLatestMarketTrades,
} from 'client/modules/trading/marketOrders/latestMarketTrades/hooks/useLatestMarketTrades';
import { first } from 'lodash';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface LatestMarketTradesProps extends WithClassnames {
  productId: number | undefined;
}

const SKELETON_ROW = <MarketOrderRow.Skeleton numCols={3} />;

export function LatestMarketTrades({
  productId,
  className,
}: LatestMarketTradesProps) {
  const { t } = useTranslation();

  const {
    data,
    setNewPriceInput,
    priceFormatSpecifier,
    amountFormatSpecifier,
  } = useLatestMarketTrades({
    productId,
  });
  // Used for determining new trade rows that should be flashed when mounted.
  const prevLatestTradeTimeRef = useSyncedRef(
    first(data?.trades)?.timestampMillis,
  );

  const { current: prevLatestTradeTime } = prevLatestTradeTimeRef ?? {};

  const { enableTradingOrderbookAnimations } =
    useEnableTradingOrderbookAnimations();

  const renderRow = useCallback(
    (row: MarketTradeRowItem) => {
      const highlightWidthFraction = safeDiv(
        row.decimalAdjustedSize,
        data?.maxTradeSize ?? BigNumbers.ZERO,
      );

      // We don't want to flash if we don't yet have a cached latest trade time,
      // so we just use the given row's time for the comparison in that case.
      const flashOnMount =
        row.timestampMillis > (prevLatestTradeTime ?? row.timestampMillis);

      return (
        <MarketOrderRow.Container
          isSell={row.isSell}
          highlightWidthFraction={highlightWidthFraction}
          onClick={() => setNewPriceInput(row.price)}
          flashOnMount={flashOnMount}
          enableAnimations={enableTradingOrderbookAnimations}
        >
          <MarketOrderRow.Item isSell={row.isSell} className="font-medium">
            {formatNumber(row.price, {
              formatSpecifier: priceFormatSpecifier,
            })}
          </MarketOrderRow.Item>
          <MarketOrderRow.Item>
            {formatNumber(row.decimalAdjustedSize, {
              formatSpecifier: amountFormatSpecifier,
            })}
          </MarketOrderRow.Item>
          <MarketOrderRow.Item>
            {formatTimestamp(row.timestampMillis, {
              formatSpecifier: TimeFormatSpecifier.HH_MM_SS_12H,
            })}
          </MarketOrderRow.Item>
        </MarketOrderRow.Container>
      );
    },
    [
      data,
      priceFormatSpecifier,
      amountFormatSpecifier,
      setNewPriceInput,
      prevLatestTradeTime,
      enableTradingOrderbookAnimations,
    ],
  );

  return (
    <div className={joinClassNames('flex flex-col justify-start', className)}>
      <MarketOrdersHeaderRow.Container>
        <MarketOrdersHeaderRow.Item>
          {t(($) => $.price)}
        </MarketOrdersHeaderRow.Item>
        <MarketOrdersHeaderRow.Item>
          {t(($) => $.sizeSymbol, { symbol: data?.symbol })}
        </MarketOrdersHeaderRow.Item>
        <MarketOrdersHeaderRow.Item>
          {t(($) => $.time)}
        </MarketOrdersHeaderRow.Item>
      </MarketOrdersHeaderRow.Container>
      <MarketOrderRows
        className="flex-1"
        rows={data?.trades}
        numRows={50}
        renderRow={renderRow}
        skeletonRow={SKELETON_ROW}
        getRowKey={(row) => row.id}
      />
    </div>
  );
}
