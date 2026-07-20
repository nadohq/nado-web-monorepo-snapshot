'use client';

import { AppPage } from 'client/modules/app/AppPage';
import { MarketsFirstCarousel } from 'client/pages/Markets/components/MarketsFirstCarousel';
import { MarketsOverviewCards } from 'client/pages/Markets/components/MarketsOverviewCards/MarketsOverviewCards';
import { MarketsSecondCarousel } from 'client/pages/Markets/components/MarketsSecondCarousel';
import { MarketsTableTabs } from 'client/pages/Markets/components/MarketTableTabs/MarketsTableTabs';
import { useTranslation } from 'react-i18next';

import 'swiper/css';
import 'swiper/css/pagination';

export function MarketsPage() {
  const { t } = useTranslation();

  return (
    <AppPage.Content>
      <AppPage.Header title={t(($) => $.pageTitles.markets)} />
      <div
        // `Swiper` applies a 'z-1' to each carousel item, so we need to
        // 'isolate' here so we don't cover the "Cookie" banner with the carousels
        className="isolate grid grid-cols-1 gap-1 lg:grid-cols-3"
      >
        <MarketsOverviewCards />
        <MarketsFirstCarousel />
        <MarketsSecondCarousel />
      </div>
      <MarketsTableTabs />
    </AppPage.Content>
  );
}
