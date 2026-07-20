import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { Card, ScrollShadowsContainer } from '@nadohq/web-ui';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { usePrivacyMode } from 'client/modules/privacy/hooks/usePrivacyMode';
import { useOverviewInfoCards } from 'client/pages/Portfolio/subpages/Overview/OverviewInfoCards/useOverviewInfoCards';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export function OverviewInfoCards() {
  const { t } = useTranslation();
  const { isPrivacyModeEnabled } = usePrivacyMode();
  const {
    totalEquityUsd,
    selectedTimespanAccountPnlUsd,
    timespanMetadata,
    volume30DUsd,
    nlpBalanceUsd,
    nlpAprFraction,
    feeTierFractions,
  } = useOverviewInfoCards();

  const cardClassName = 'w-72 sm:w-auto';

  return (
    <ScrollShadowsContainer orientation="horizontal">
      <div className="grid w-max grid-cols-3 gap-x-1 sm:w-full">
        {/* Total Equity */}
        <OverviewInfoCard
          className={cardClassName}
          topContent={
            <ValueWithLabel.Vertical
              tooltip={{ id: 'overviewTotalEquity' }}
              sizeVariant="xl"
              isValuePrivate={isPrivacyModeEnabled}
              label={t(($) => $.totalEquity)}
              value={totalEquityUsd}
              numberFormatSpecifier={PresetNumberFormatSpecifier.CURRENCY_2DP}
            />
          }
          bottomContent={
            <ValueWithLabel.Horizontal
              tooltip={{ id: 'overviewTimespanAccountPnl' }}
              fitWidth
              sizeVariant="xs"
              isValuePrivate={isPrivacyModeEnabled}
              label={t(($) => $.timespanPnl, {
                timespan: timespanMetadata.label,
              })}
              value={selectedTimespanAccountPnlUsd}
              valueClassName={getSignDependentColorClassName(
                selectedTimespanAccountPnlUsd,
              )}
              numberFormatSpecifier={PresetNumberFormatSpecifier.CURRENCY_2DP}
            />
          }
        />
        {/* 30d Volume */}
        <OverviewInfoCard
          className={cardClassName}
          topContent={
            <ValueWithLabel.Vertical
              tooltip={{ id: 'overview30dVolume' }}
              sizeVariant="xl"
              isValuePrivate={isPrivacyModeEnabled}
              label={t(($) => $.volume30d)}
              value={volume30DUsd}
              numberFormatSpecifier={PresetNumberFormatSpecifier.CURRENCY_2DP}
            />
          }
          bottomContent={
            <ValueWithLabel.Horizontal
              tooltip={{
                id: 'feeTier',
                options: { interactive: true, delayHide: 300 },
              }}
              fitWidth
              sizeVariant="xs"
              isValuePrivate={isPrivacyModeEnabled}
              label={t(($) => $.feeTier)}
              labelClassName="label-separator"
              valueContent={
                <div>
                  {formatNumber(feeTierFractions?.maker, {
                    formatSpecifier:
                      PresetNumberFormatSpecifier.PERCENTAGE_UPTO_4DP,
                  })}{' '}
                  /{' '}
                  {formatNumber(feeTierFractions?.taker, {
                    formatSpecifier:
                      PresetNumberFormatSpecifier.PERCENTAGE_UPTO_4DP,
                  })}
                </div>
              }
            />
          }
        />
        {/* NLP Balance */}
        <OverviewInfoCard
          className={cardClassName}
          topContent={
            <ValueWithLabel.Vertical
              tooltip={{ id: 'overviewNlpBalance' }}
              sizeVariant="xl"
              isValuePrivate={isPrivacyModeEnabled}
              label={t(($) => $.nlpBalance)}
              value={nlpBalanceUsd}
              numberFormatSpecifier={PresetNumberFormatSpecifier.CURRENCY_2DP}
            />
          }
          bottomContent={
            <ValueWithLabel.Horizontal
              fitWidth
              sizeVariant="xs"
              label={t(($) => $.apr)}
              labelClassName="label-separator"
              value={nlpAprFraction}
              numberFormatSpecifier={PresetNumberFormatSpecifier.PERCENTAGE_2DP}
            />
          }
        />
      </div>
    </ScrollShadowsContainer>
  );
}

interface OverviewInfoCardProps extends WithClassnames {
  topContent: ReactNode;
  bottomContent: ReactNode;
}

function OverviewInfoCard({
  className,
  topContent,
  bottomContent,
}: OverviewInfoCardProps) {
  return (
    <Card
      className={joinClassNames(
        'flex flex-col items-start justify-between gap-y-6',
        className,
      )}
    >
      {topContent}
      {bottomContent}
    </Card>
  );
}
