import { useTabs } from 'client/hooks/ui/tabs/useTabs';
import { useEnabledFeatures } from 'client/modules/envSpecificContent/hooks/useEnabledFeatures';
import { MarketsTableSearchWrapper } from 'client/pages/Markets/components/MarketsTableSearchWrapper';
import { FundingRateMarketsTable } from 'client/pages/Markets/tables/FundingRateMarketsTable';
import { PerpMarketsTable } from 'client/pages/Markets/tables/PerpMarketsTable';
import { SpotMarketsTable } from 'client/pages/Markets/tables/SpotMarketsTable';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useMarketsTableTabs() {
  const { t } = useTranslation();
  const { isSpotTradingEnabled } = useEnabledFeatures();

  const tabs = useMemo(() => {
    return [
      {
        id: 'perps',
        label: t(($) => $.perps),
        content: (
          <MarketsTableSearchWrapper
            renderTable={({ query }) => <PerpMarketsTable query={query} />}
          />
        ),
      },
      ...(isSpotTradingEnabled
        ? [
            {
              id: 'spot',
              label: t(($) => $.pageTitles.spot),
              content: (
                <MarketsTableSearchWrapper
                  renderTable={({ query }) => (
                    <SpotMarketsTable query={query} />
                  )}
                />
              ),
            },
          ]
        : []),
      {
        id: 'funding_rates',
        label: t(($) => $.marketsPage.fundingRates),
        content: (
          <MarketsTableSearchWrapper
            renderTable={({ query }) => (
              <FundingRateMarketsTable query={query} />
            )}
          />
        ),
      },
    ];
  }, [isSpotTradingEnabled, t]);

  const { selectedTabId, setSelectedUntypedTabId } = useTabs(tabs);

  return {
    selectedTabId,
    setSelectedUntypedTabId,
    tabs,
  };
}
