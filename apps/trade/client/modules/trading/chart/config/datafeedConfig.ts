import { CandlestickPeriod, ProductEngineType } from '@nadohq/client';
import { AnnotatedMarket } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { BRAND_METADATA } from 'common/brandMetadata/brandMetadata';
import { precisionFixed } from 'd3-format';
import {
  DatafeedConfiguration,
  LibrarySymbolInfo,
  ResolutionString,
} from 'public/charting_library';

/**
 * Base resolutions that the backend API supports directly.
 * Used for getBars/subscribeBars API calls.
 */
export const RESOLUTIONS_TO_INTERVALS = {
  '1': CandlestickPeriod.MIN,
  '5': CandlestickPeriod.FIVE_MIN,
  '15': CandlestickPeriod.FIFTEEN_MIN,
  '60': CandlestickPeriod.HOUR,
  '120': CandlestickPeriod.TWO_HOUR,
  '240': CandlestickPeriod.FOUR_HOUR,
  '1D': CandlestickPeriod.DAY,
  '1W': CandlestickPeriod.WEEK,
  '1M': CandlestickPeriod.MONTH,
} as Record<ResolutionString, CandlestickPeriod>;

/**
 * Compiled resolutions that TradingView builds from base intervals.
 * These are NOT requested from the backend directly.
 */
const COMPILED_RESOLUTIONS_TO_INTERVALS = {
  '3': 3 * CandlestickPeriod.MIN,
  '30': 2 * CandlestickPeriod.FIFTEEN_MIN,
  '480': 2 * CandlestickPeriod.FOUR_HOUR,
  '720': 3 * CandlestickPeriod.FOUR_HOUR,
  '3D': 3 * CandlestickPeriod.DAY,
} as Record<ResolutionString, number>;

/**
 * All supported resolutions mapped to intervals in seconds.
 * Combines base and compiled resolutions.
 */
export const ALL_RESOLUTIONS_TO_INTERVALS: Record<ResolutionString, number> = {
  ...RESOLUTIONS_TO_INTERVALS,
  ...COMPILED_RESOLUTIONS_TO_INTERVALS,
};

const SUPPORTED_RESOLUTIONS = Object.keys(
  ALL_RESOLUTIONS_TO_INTERVALS,
) as ResolutionString[];

export const DATAFEED_CONFIGURATION: DatafeedConfiguration = {
  supports_time: true,
  supports_marks: true,
  supports_timescale_marks: true,
  // Resolutions supported in the widget, TV will call `getBars` with the supported resolutions in `intraday_multipliers`
  // to compile to the resolutions
  supported_resolutions: SUPPORTED_RESOLUTIONS,
};

export const COMMON_SYMBOL_INFO: Omit<
  LibrarySymbolInfo,
  'name' | 'description' | 'minmov' | 'pricescale'
> = {
  format: 'price',
  type: 'crypto',
  session: '24x7',
  exchange: BRAND_METADATA.displayName,
  listed_exchange: BRAND_METADATA.displayName,
  timezone: 'Etc/UTC',
  has_intraday: true,
  has_daily: true,
  has_weekly_and_monthly: true,
  data_status: 'streaming',
  supported_resolutions: SUPPORTED_RESOLUTIONS,
  // Intraday multipliers must correspond with base resolutions in RESOLUTIONS_TO_INTERVALS
  intraday_multipliers: ['1', '5', '15', '60', '120', '240'],
  daily_multipliers: ['1'],
  weekly_multipliers: ['1'],
  monthly_multipliers: ['1'],
};

export interface TradingViewSymbolInfo extends Omit<
  LibrarySymbolInfo,
  'ticker'
> {
  // Makes ticker a required property
  ticker: string;
  productId: number;
  productType: ProductEngineType;
  priceIncrement: BigNumber;
  sizeIncrement: BigNumber;
}

export function getTradingViewSymbolInfo(
  market: AnnotatedMarket,
): TradingViewSymbolInfo {
  const symbolInfo = ((): TradingViewSymbolInfo => {
    // https://www.tradingview.com/charting-library-docs/latest/connecting_data/Symbology#decimal-format
    // Price scale = 10 ^ (number of decimal places in price)
    // Price increment = tick size = minmove / pricescale
    const priceNumDecimalPlaces = precisionFixed(
      market.priceIncrement.toNumber(),
    );
    const priceScale = 10 ** priceNumDecimalPlaces;
    const minMov = market.priceIncrement.multipliedBy(priceScale).toNumber();

    return {
      // This needs to be set to enable volume by default: https://github.com/tradingview/charting_library/issues/8306#issuecomment-1955174388
      visible_plots_set: 'ohlcv',
      productType: market.type,
      name: market.metadata.marketName,
      description: market.metadata.marketName,
      productId: market.productId,
      ticker: market.productId.toFixed(0),
      minmov: minMov,
      pricescale: priceScale,
      priceIncrement: market.priceIncrement,
      sizeIncrement: market.sizeIncrement,
      ...COMMON_SYMBOL_INFO,
    };
  })();

  const decimalPlaces = market.priceIncrement.decimalPlaces();
  if (decimalPlaces != null) {
    symbolInfo.pricescale = 10 ** decimalPlaces;
  }

  return symbolInfo;
}
