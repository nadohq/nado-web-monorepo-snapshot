import {
  CustomNumberFormatSpecifier,
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { useMarketsOverview } from 'client/pages/Markets/components/MarketsOverviewCards/useMarketsOverview';
import { ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type MarketsOverviewCardId =
  | 'volume24h'
  | 'openInterest'
  | 'trades24h'
  | 'allTimeVolume';

interface CardProps {
  id: MarketsOverviewCardId;
  title: string;
  value: ReactNode;
}

export function useMarketsOverviewCards() {
  const { t } = useTranslation();
  const marketsOverview = useMarketsOverview();

  return useMemo(
    (): CardProps[] => [
      {
        id: 'volume24h',
        title: t(($) => $.volume24h),
        value: formatNumber(marketsOverview?.totalDailyVolumeUsd, {
          formatSpecifier:
            CustomNumberFormatSpecifier.CURRENCY_LARGE_ABBREVIATED,
        }),
      },
      {
        id: 'openInterest',
        title: t(($) => $.openInterest),
        value: formatNumber(marketsOverview?.openInterestUsd, {
          formatSpecifier:
            CustomNumberFormatSpecifier.CURRENCY_LARGE_ABBREVIATED,
        }),
      },
      {
        id: 'trades24h',
        title: t(($) => $.marketsPage.trades24h),
        value: formatNumber(marketsOverview?.totalDailyTrades, {
          formatSpecifier: PresetNumberFormatSpecifier.NUMBER_INT,
        }),
      },
      {
        id: 'allTimeVolume',
        title: t(($) => $.marketsPage.allTimeVolume),
        value: formatNumber(marketsOverview?.totalCumulativeVolumeUsd, {
          formatSpecifier:
            CustomNumberFormatSpecifier.CURRENCY_LARGE_ABBREVIATED,
        }),
      },
    ],
    [marketsOverview, t],
  );
}
