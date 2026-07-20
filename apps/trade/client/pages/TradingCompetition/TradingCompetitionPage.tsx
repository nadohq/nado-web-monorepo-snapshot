'use client';

import { joinClassNames } from '@nadohq/web-common';
import { SpinnerContainer } from 'client/components/SpinnerContainer';
import { AppPage } from 'client/modules/app/AppPage';
import { useTradingCompRegionAccess } from 'client/modules/tradingCompetition/hooks/useTradingCompRegionAccess';
import tradingCompBg from 'client/pages/TradingCompetition/assets/trading-comp-bg.png';
import { TradingCompHeader } from 'client/pages/TradingCompetition/components/TradingCompHeader/TradingCompHeader';
import { TradingCompLeaderboardTableTabsCard } from 'client/pages/TradingCompetition/components/TradingCompLeaderboardTableTabsCard/TradingCompLeaderboardTableTabsCard';
import { TradingCompRestrictedRegionCard } from 'client/pages/TradingCompetition/components/TradingCompRestrictedRegionCard';
import { TradingCompTrackCards } from 'client/pages/TradingCompetition/components/TradingCompTrackCards/TradingCompTrackCards';
import Image from 'next/image';

export function TradingCompetitionPage() {
  const { isRestricted, isLoading } = useTradingCompRegionAccess();

  const content = (() => {
    if (isLoading) {
      return <SpinnerContainer />;
    }
    if (isRestricted) {
      return <TradingCompRestrictedRegionCard />;
    }
    return (
      <>
        <TradingCompHeader />
        <div className="flex flex-col gap-y-1">
          <TradingCompTrackCards />
          <TradingCompLeaderboardTableTabsCard />
        </div>
      </>
    );
  })();

  return (
    <div className="relative">
      <Image
        src={tradingCompBg}
        alt=""
        className={joinClassNames(
          'absolute top-0 hidden min-h-100 w-full object-cover',
          'sm:block',
        )}
        quality={100}
        priority
      />
      <AppPage.Content
        // Padding added to align the content with the height of the background image
        className={joinClassNames('relative z-10 py-8', 'sm:py-16')}
      >
        {content}
      </AppPage.Content>
    </div>
  );
}
