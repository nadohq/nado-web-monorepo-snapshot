import {
  NumberFormatSpecifier,
  SharedProductMetadata,
} from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { OrderbookPriceTickSpacingMultiplier } from 'client/modules/trading/marketOrders/orderbook/types';

export interface OrderbookParams {
  productId: number | undefined;
  // Number of bids/asks to display
  depth: number;
}

export interface OrderbookRowItem {
  isAsk: boolean;
  price: BigNumber;
  // Asset = product for orderbook (ex. wETH), decimal adjusted, undefined if there's no liquidity at this level
  assetAmount: BigNumber | undefined;
  // Cumulative amount in asset currency (ex. wETH) or quote currency (ex. USDT)
  cumulativeAmount: BigNumber;
  // Base/product liquidity for the hover tooltip, independent of showOrderbookTotalInQuote.
  cumulativeBaseAmount: BigNumber;
  // Quote notional for the hover tooltip, independent of showOrderbookTotalInQuote.
  cumulativeQuoteAmount: BigNumber;
}

export interface OrderbookData {
  productMetadata: SharedProductMetadata;
  quoteSymbol: string;
  /**
   * Raw size increment for the product
   */
  sizeIncrement: BigNumber;
  /**
   * Total cumulative amount in either asset currency (ex. wETH) or quote currency (ex. USDT)
   * This is max(cumulative amount for bids, cumulative amount for asks)
   */
  maxCumulativeTotalAmount: BigNumber;
  /**
   * Ascending, from bid price
   */
  bids: OrderbookRowItem[];
  /**
   * Descending, from ask price
   */
  asks: OrderbookRowItem[];
  spread: OrderbookSpreadData;
}

export interface OrderbookSpreadData {
  amount: BigNumber;
  // Percentage expressed as a fraction (ex. 0.01 = 1%)
  frac: BigNumber;
  // Whether the spread for the market is abnormally high
  isHigh: boolean;
}

export interface UseOrderbook {
  orderbookData: OrderbookData | undefined;
  /**
   * Tick-derived price format for each orderbook row.
   */
  rowPriceFormatSpecifier: NumberFormatSpecifier;
  /**
   * Price format specifier for the product
   */
  priceFormatSpecifier: NumberFormatSpecifier;
  amountFormatSpecifier: NumberFormatSpecifier;
  cumulativeAmountSpecifier: NumberFormatSpecifier;
  amountSymbol: string | undefined;
  roundedPriceIncrement: BigNumber;
  currentTickSpacing: number;
  tickSpacingMultiplier: OrderbookPriceTickSpacingMultiplier;
  setTickSpacingMultiplier: (
    value: OrderbookPriceTickSpacingMultiplier,
  ) => void;
  showOrderbookTotalInQuote: boolean;
  setShowOrderbookTotalInQuote: (value: boolean) => void;
  setNewPriceInput: (val: BigNumber) => void;
  lastPrice: BigNumber | undefined;
  // Prices of open orders presented as string for proper comparison
  openOrderPrices: Set<string> | undefined;
}
