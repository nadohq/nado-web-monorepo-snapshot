import { ProductEngineType } from '@nadohq/client';
import { MarketCategory, TokenIconMetadata } from '@nadohq/react-client';
import { Row } from '@tanstack/react-table';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';

export interface MarketSwitcherItem extends WithDataTableRowId {
  market: {
    productType: ProductEngineType;
    symbol: string;
    marketName: string;
    icon: TokenIconMetadata;
    categories: Set<MarketCategory>;
    /**
     * Alternative search terms associated with the market.
     */
    altSearchTerms: string[];
  };
  currentPrice: BigNumber | undefined;
  priceChangeFrac: BigNumber | undefined;
  priceIncrement: BigNumber | undefined;
  annualizedFundingFrac: BigNumber | undefined;
  volume24h: BigNumber | undefined;
  maxLeverage: number | undefined;
  isNew: boolean;
  isFavorited: boolean;
  productId: number;
  href: string;
}

export interface TradingMarketSwitcherTableProps {
  disableFavoriteButton: boolean;
  toggleIsFavoritedMarket: (marketId: number) => void;
  markets: MarketSwitcherItem[];
  isLoading: boolean;
  onRowClick: (row: Row<MarketSwitcherItem>) => void;
}
