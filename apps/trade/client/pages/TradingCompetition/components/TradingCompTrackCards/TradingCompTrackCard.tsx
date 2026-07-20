'use client';

import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import {
  joinClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';
import { Card, SectionedCard } from '@nadohq/web-ui';
import BigNumber from 'bignumber.js';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { TradingCompTrackType } from 'client/modules/tradingCompetition/types';
import { TRADING_COMP_TRACK_DISPLAY_CONFIG } from 'client/pages/TradingCompetition/components/TradingCompTrackCards/consts';
import type { TradingCompCardData } from 'client/pages/TradingCompetition/components/TradingCompTrackCards/useTradingCompTrackCards';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { Trans, useTranslation } from 'react-i18next';

export function TradingCompTrackCard({
  track,
  status,
  accountValueThresholdUsd,
  volumeThresholdUsd,
  metricValue,
  rank,
  className,
}: WithClassnames<TradingCompCardData>) {
  const { t } = useTranslation();
  const trackConfig = TRADING_COMP_TRACK_DISPLAY_CONFIG[track.type];

  // The Status label's tooltip explains how to qualify.
  const statusDisplay = (() => {
    switch (status) {
      case 'qualified':
        return {
          label: t(($) => $.tradingCompetition.qualified),
          className: 'text-positive',
        };
      case 'insufficient_account_value':
        return {
          label: t(($) => $.tradingCompetition.accountValueRequirementNotMet),
          className: 'text-negative',
        };
      case 'insufficient_volume':
        return {
          label: t(($) => $.tradingCompetition.volumeRequirementNotMet),
          className: 'text-negative',
        };
      case 'insufficient_account_value_and_volume':
        return {
          label: t(($) => $.tradingCompetition.bothRequirementsNotMet),
          className: 'text-negative',
        };
      case 'not_enrolled':
        return {
          label: t(($) => $.tradingCompetition.notEnrolled),
          className: 'text-text-secondary',
        };
      case undefined:
        return { label: '', className: undefined };
    }
  })();

  return (
    <SectionedCard className={className}>
      <SectionedCard.Header>
        {t(($) => $.tradingCompetition.trackTitle, {
          track: t(($) => $.tradingCompetition.tracks[track.type]),
        })}
      </SectionedCard.Header>
      <SectionedCard.Content className="grid grid-cols-1 gap-1 lg:grid-cols-2">
        <TrackInnerCard>
          <ValueWithLabel.Vertical
            sizeVariant="xl"
            label={t(($) => $.tradingCompetition.minAccountValue)}
            tooltip={{ id: 'tradingCompMinAccountValue' }}
            value={accountValueThresholdUsd}
            numberFormatSpecifier={PresetNumberFormatSpecifier.CURRENCY_INT}
          />
        </TrackInnerCard>
        <TrackInnerCard>
          <ValueWithLabel.Vertical
            sizeVariant="xl"
            label={t(($) => $.tradingCompetition.minTradingVolume)}
            tooltip={{ id: 'tradingCompMinTradingVolume' }}
            value={volumeThresholdUsd}
            numberFormatSpecifier={PresetNumberFormatSpecifier.CURRENCY_INT}
          />
        </TrackInnerCard>
        <TrackInnerCard className="lg:col-span-2">
          <ValueWithLabel.Vertical
            sizeVariant="xl"
            label={t(($) => $.tradingCompetition.tracks[track.type])}
            tooltip={{ id: trackConfig.metricTooltipId }}
            value={metricValue}
            numberFormatSpecifier={trackConfig.metricFormatSpecifier}
            valueClassName={getMetricColorClassName(track.type, metricValue)}
          />
          <div
            className={joinClassNames(
              'flex items-center justify-between gap-x-2 self-stretch',
              // `invisible` hides status + rank while participant data loads but
              // keeps the row's space reserved, avoiding layout shift on load.
              status === undefined && 'invisible',
            )}
          >
            <ValueWithLabel.Horizontal
              fitWidth
              sizeVariant="xs"
              label={t(($) => $.tradingCompetition.status)}
              tooltip={{ id: trackConfig.qualificationTooltipId }}
              valueContent={statusDisplay.label}
              valueClassName={statusDisplay.className}
            />
            <span className="text-text-tertiary text-xs">
              <Trans
                i18nKey={($) => $.tradingCompetition.rankDisplay}
                values={{
                  rank: formatNumber(rank, {
                    formatSpecifier: PresetNumberFormatSpecifier.NUMBER_INT,
                  }),
                }}
                components={{
                  rank: <span className="text-text-primary" />,
                }}
              />
            </span>
          </div>
        </TrackInnerCard>
      </SectionedCard.Content>
    </SectionedCard>
  );
}

function TrackInnerCard({
  children,
  className,
}: WithChildren & WithClassnames) {
  return (
    <Card
      className={joinClassNames(
        'bg-surface-1 flex flex-col items-start gap-y-4 shadow-none',
        className,
      )}
    >
      {children}
    </Card>
  );
}

export function getMetricColorClassName(
  type: TradingCompTrackType,
  metricValue: BigNumber | undefined,
) {
  switch (type) {
    case 'roi':
      return getSignDependentColorClassName(metricValue);
    case 'volume':
      return 'text-text-primary';
  }
}
