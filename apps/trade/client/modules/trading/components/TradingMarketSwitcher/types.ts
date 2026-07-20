import { ProductEngineType } from '@nadohq/client';
import {
  MarketCategory,
  NumberFormatSpecifier,
  TokenIconMetadata,
} from '@nadohq/react-client';
import { Row } from '@tanstack/react-table';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { MarketPointsBoost } from 'client/hooks/markets/useAllMarketsPointsBoosts';
import type { ReactNode } from 'react';

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
  pointsBoost: MarketPointsBoost | undefined;
  currentPrice: BigNumber | undefined;
  priceChangeFrac: BigNumber | undefined;
  priceFormatSpecifier: NumberFormatSpecifier;
  annualizedFundingFrac: BigNumber | undefined;
  volume24h: BigNumber | undefined;
  maxLeverage: number | undefined;
  isXStock: boolean;
  isZeroFees: boolean;
  isNew: boolean;
  isFavorited: boolean;
  productId: number;
  href: string;
}

export interface TradingMarketSwitcherTableProps {
  disableFavoriteButton: boolean;
  emptyState: ReactNode;
  toggleIsFavoritedMarket: (marketId: number) => void;
  markets: MarketSwitcherItem[];
  isLoading: boolean;
  onRowClick: (row: Row<MarketSwitcherItem>) => void;
}
