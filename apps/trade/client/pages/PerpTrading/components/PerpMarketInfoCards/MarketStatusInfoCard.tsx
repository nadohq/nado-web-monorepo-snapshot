import { useMarketRestrictions } from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import {
  BaseDefinitionTooltip,
  formatTimestamp,
  TimeFormatSpecifier,
} from '@nadohq/web-ui';
import { TextCountdown } from 'client/components/Countdown/TextCountdown';
import { MarketInfoCard } from 'client/components/MarketInfoCard';
import { StatusIndicator } from 'client/components/StatusIndicator';
import { useTranslation } from 'react-i18next';

interface Props {
  productId: number | undefined;
}

export function MarketStatusInfoCard({ productId }: Props) {
  const { t } = useTranslation();
  const { data: marketRestrictions } = useMarketRestrictions();

  const marketHours =
    productId != null
      ? marketRestrictions?.[productId]?.marketHours
      : undefined;

  if (!marketHours) {
    return null;
  }

  const { isOpen, nextClose, nextOpen } = marketHours;

  const nextMarketChangeTime = isOpen ? nextClose : nextOpen;
  const nextMarketChangeTimeMillis = nextMarketChangeTime
    ? new Date(nextMarketChangeTime).getTime()
    : undefined;
  const formattedMarketChangeTime = formatTimestamp(
    nextMarketChangeTimeMillis,
    {
      formatSpecifier: TimeFormatSpecifier.MMM_D_HH_12H_O,
    },
  );

  const statusIndicatorVariant = isOpen ? 'positive' : 'warning';
  const textColorClassName = isOpen ? 'text-positive' : 'text-warning';
  const statusLabel = isOpen ? t(($) => $.live) : t(($) => $.reduceOnly);

  const tooltipDescription = isOpen
    ? t(($) => $.marketStatusLiveDescription, {
        reduceOnlyTime: formattedMarketChangeTime,
      })
    : t(($) => $.marketStatusReduceOnlyDescription, {
        reopenTime: formattedMarketChangeTime,
      });

  const countdownLabel = isOpen
    ? t(($) => $.reduceOnlyStartsIn)
    : t(($) => $.marketOpensIn);

  return (
    <MarketInfoCard
      label={t(($) => $.marketStatus)}
      value={
        <BaseDefinitionTooltip
          title={
            <div className="flex items-center gap-x-1.5">
              <StatusIndicator
                colorVariant={statusIndicatorVariant}
                sizeVariant="sm"
              />
              <span className={textColorClassName}>{statusLabel}</span>
            </div>
          }
          content={
            <div className="flex flex-col items-start gap-y-1.5">
              <span>{tooltipDescription}</span>
              <span className="text-text-primary">{countdownLabel}</span>
              <TextCountdown
                className="gap-x-2"
                endTimeMillis={nextMarketChangeTimeMillis}
              />
            </div>
          }
          decoration="none"
        >
          <div
            className={joinClassNames(
              'flex items-center gap-x-1.5',
              textColorClassName,
            )}
          >
            <StatusIndicator
              colorVariant={statusIndicatorVariant}
              sizeVariant="sm"
            />
            {statusLabel}
          </div>
        </BaseDefinitionTooltip>
      }
    />
  );
}
