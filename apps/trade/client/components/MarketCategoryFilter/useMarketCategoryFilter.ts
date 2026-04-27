import { MarketCategory } from '@nadohq/react-client';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type MarketCategoryID = MarketCategory | 'all';

type MarketCategoryFilterByID = Record<
  MarketCategoryID,
  { value: MarketCategory | undefined; label: string }
>;

export interface UseMarketCategoryFilterParams {
  marketCategory: MarketCategory | undefined;
  setMarketCategory: (newCategory?: MarketCategory) => void;
}

export function useMarketCategoryFilter({
  marketCategory,
  setMarketCategory,
}: UseMarketCategoryFilterParams) {
  const { t } = useTranslation();

  const marketCategoryFilterById: MarketCategoryFilterByID = useMemo(() => {
    return {
      all: {
        value: undefined,
        label: t(($) => $.marketCategory.all),
      },
      perp: {
        value: 'perp',
        label: t(($) => $.marketCategory.perps),
      },
      spot: {
        value: 'spot',
        label: t(($) => $.marketCategory.spot),
      },
      meme: {
        value: 'meme',
        label: t(($) => $.marketCategory.memes),
      },
      defi: {
        value: 'defi',
        label: t(($) => $.marketCategory.defi),
      },
      chain: {
        value: 'chain',
        label: t(($) => $.marketCategory.chains),
      },
      commodity: {
        value: 'commodity',
        label: t(($) => $.marketCategory.commodities),
      },
      equities: {
        value: 'equities',
        label: t(($) => $.marketCategory.equities),
      },
      forex: {
        value: 'forex',
        label: t(($) => $.marketCategory.forex),
      },
      indices: {
        value: 'indices',
        label: t(($) => $.marketCategory.indices),
      },
    };
  }, [t]);

  // Handle transformation from value to id
  const selectedMarketCategoryId: MarketCategoryID = marketCategory ?? 'all';

  const setSelectedMarketCategoryId = useCallback(
    (marketCategoryId: string) => {
      // Handle transformation from id to value
      const newMarketCategory =
        marketCategoryFilterById[marketCategoryId as MarketCategoryID];

      setMarketCategory(newMarketCategory?.value);
    },
    [marketCategoryFilterById, setMarketCategory],
  );

  return {
    selectedMarketCategoryId,
    setSelectedMarketCategoryId,
    marketCategoryFilterById,
  };
}
