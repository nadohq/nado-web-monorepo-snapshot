import { SharedProductMetadata } from '@nadohq/react-client';
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
}

export interface OrderbookData {
  productMetadata: SharedProductMetadata;
  quoteSymbol: string;
  priceIncrement: BigNumber;
  sizeIncrement: BigNumber;
  // Total cumulative amount in either asset currency (ex. wETH) or quote currency (ex. USDT)
  // This is max(cumulative amount for bids, cumulative amount for asks)
  maxCumulativeTotalAmount: BigNumber;
  // Ascending, from bid price
  bids: OrderbookRowItem[];
  // Descending, from ask price
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
  priceFormatSpecifier: string;
  amountFormatSpecifier: string;
  cumulativeAmountSpecifier: string;
  amountSymbol: string | undefined;
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
