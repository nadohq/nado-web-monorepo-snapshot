'use client';

import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { MarketsOverviewCard } from 'client/pages/Markets/components/MarketsOverviewCards/MarketsOverviewCard';
import { useMarketsOverviewCards } from 'client/pages/Markets/components/MarketsOverviewCards/useMarketsOverviewCards';

export function MarketsOverviewCards({ className }: WithClassnames) {
  const marketsPageOverviewCards = useMarketsOverviewCards();

  return (
    <div className={joinClassNames('grid gap-1 sm:grid-cols-2', className)}>
      {marketsPageOverviewCards.map(({ id, title, value }) => (
        <MarketsOverviewCard
          title={title}
          value={value}
          key={id}
          className="flex-1"
        />
      ))}
    </div>
  );
}
