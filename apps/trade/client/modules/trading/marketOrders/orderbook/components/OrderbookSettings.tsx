import { BigNumber } from 'bignumber.js';
import { TickSpacingSelect } from 'client/modules/trading/marketOrders/orderbook/components/TickSpacingSelect';
import { ToggleViewButton } from 'client/modules/trading/marketOrders/orderbook/components/ToggleViewButton';
import { TotalAmountDenomSelect } from 'client/modules/trading/marketOrders/orderbook/components/TotalAmountDenomSelect';
import {
  OrderbookPriceTickSpacingMultiplier,
  OrderbookViewType,
} from 'client/modules/trading/marketOrders/orderbook/types';
import { memo } from 'react';

interface Props {
  viewType: OrderbookViewType;
  setViewType: (value: OrderbookViewType) => void;
  currentTickSpacing: number;
  tickSpacingMultiplier: OrderbookPriceTickSpacingMultiplier;
  setTickSpacingMultiplier: (
    value: OrderbookPriceTickSpacingMultiplier,
  ) => void;
  showOrderbookTotalInQuote: boolean;
  setShowOrderbookTotalInQuote: (value: boolean) => void;
  symbol: string | undefined;
  quoteSymbol: string | undefined;
  priceIncrement: BigNumber | undefined;
}

function BaseOrderbookSettings({
  viewType,
  setViewType,
  currentTickSpacing,
  tickSpacingMultiplier,
  setTickSpacingMultiplier,
  showOrderbookTotalInQuote,
  setShowOrderbookTotalInQuote,
  symbol,
  quoteSymbol,
  priceIncrement,
}: Props) {
  return (
    <div className="flex items-center justify-between px-3">
      <div className="flex items-center gap-x-1">
        <ToggleViewButton
          variant="bids_and_asks"
          viewType={viewType}
          setViewType={setViewType}
        />
        <ToggleViewButton
          variant="only_bids"
          viewType={viewType}
          setViewType={setViewType}
        />
        <ToggleViewButton
          variant="only_asks"
          viewType={viewType}
          setViewType={setViewType}
        />
      </div>
      <div className="flex gap-x-3">
        <TickSpacingSelect
          priceIncrement={priceIncrement}
          currentTickSpacing={currentTickSpacing}
          tickSpacingMultiplier={tickSpacingMultiplier}
          setTickSpacingMultiplier={setTickSpacingMultiplier}
        />
        <TotalAmountDenomSelect
          symbol={symbol}
          quoteSymbol={quoteSymbol}
          showOrderbookTotalInQuote={showOrderbookTotalInQuote}
          setShowOrderbookTotalInQuote={setShowOrderbookTotalInQuote}
        />
      </div>
    </div>
  );
}

export const OrderbookSettings = memo(BaseOrderbookSettings);
