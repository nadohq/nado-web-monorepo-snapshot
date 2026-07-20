import { Candlestick, removeDecimals } from '@nadohq/client';
import {
  toXStocksDisplayAmount,
  toXStocksDisplayPrice,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import type { Bar } from 'public/charting_library';

export function toTVCandlesticks(
  candlesticks: Candlestick[],
  exchangeRate: BigNumber,
) {
  // Candlesticks are in descending order, but TV wants them to be in ascending order
  const bars = candlesticks.reverse().map((candlestick) => {
    return toTVCandlestick(candlestick, exchangeRate);
  });

  return bars.map((bar, index) => {
    if (index === 0) {
      return bar;
    }

    // Alter data such that we don't have a price-gap with an empty candle, so change the open / high / low such that we also use the previous bar's close
    const prevBarClose = bars[index - 1].close;
    return syncBarOpenWithValue(bar, prevBarClose);
  });
}

export function toTVCandlestick(
  candlestick: Candlestick,
  exchangeRate: BigNumber,
): Bar {
  return {
    volume: toXStocksDisplayAmount(
      removeDecimals(candlestick.volume),
      exchangeRate,
    ).toNumber(),
    time: candlestick.time.times(1000).toNumber(),
    high: toXStocksDisplayPrice(candlestick.high, exchangeRate).toNumber(),
    low: toXStocksDisplayPrice(candlestick.low, exchangeRate).toNumber(),
    close: toXStocksDisplayPrice(candlestick.close, exchangeRate).toNumber(),
    open: toXStocksDisplayPrice(candlestick.open, exchangeRate).toNumber(),
  };
}

/**
 * Sets properties of the given bar to the given value, which is useful for
 * preventing invalid bars and gaps between candles. Properties set include:
 *   - Open, set unconditionally.
 *   - High, set if the given value is greater than the bar's high.
 *   - Low, set if the given value is lower than the bar's low.
 */
export function syncBarOpenWithValue(bar: Bar, value: number): Bar {
  const syncedBar = { ...bar };

  syncedBar.open = value;
  syncedBar.high = Math.max(value, bar.high);
  syncedBar.low = Math.min(value, bar.low);

  return syncedBar;
}

/**
 * Sets the bar's close to the given mid-price and expands high/low
 * to include it. This keeps the wick consistent with the running
 * close on thin markets where the mid can drift outside the last
 * trade range between matches.
 */
export function applyMidPriceToBar(bar: Bar, midPrice: number): Bar {
  return {
    ...bar,
    close: midPrice,
    high: Math.max(bar.high, midPrice),
    low: Math.min(bar.low, midPrice),
  };
}

export function getProductIdIntervalKey(
  productId: number,
  chartIntervalSeconds: number,
) {
  return `${productId}-${chartIntervalSeconds}`;
}
