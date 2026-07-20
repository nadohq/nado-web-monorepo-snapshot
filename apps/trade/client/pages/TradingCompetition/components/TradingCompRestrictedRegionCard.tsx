'use client';

import { Card, Icons } from '@nadohq/web-ui';
import { useTranslation } from 'react-i18next';

export function TradingCompRestrictedRegionCard() {
  const { t } = useTranslation();

  return (
    <Card className="flex flex-col items-center gap-y-4 text-center">
      <Icons.GlobeSimple className="text-text-tertiary size-10" />
      <h2 className="text-text-primary text-lg">
        {t(($) => $.tradingCompetition.restrictedRegion.title)}
      </h2>
      <p className="text-text-secondary max-w-md text-sm">
        {t(($) => $.tradingCompetition.restrictedRegion.description)}
      </p>
    </Card>
  );
}
