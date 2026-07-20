'use client';

import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { Pill } from '@nadohq/web-ui';
import { Countdown } from 'client/components/Countdown/Countdown';
import { TOTAL_TRADING_COMP_PRIZE_POOL_USD } from 'client/modules/tradingCompetition/consts';
import { AnimatedDecryptedText } from 'client/pages/TradingCompetition/components/AnimatedDecryptedText';
import { TradingCompHeaderEnrollButton } from 'client/pages/TradingCompetition/components/TradingCompHeader/TradingCompHeaderEnrollButton';
import { useTradingCompHeader } from 'client/pages/TradingCompetition/components/TradingCompHeader/useTradingCompHeader';
import { useTranslation } from 'react-i18next';

export function TradingCompHeader() {
  const { t } = useTranslation();
  const {
    phase,
    countdownTargetMillis,
    countdownLabel,
    handleEnroll,
    enrollButtonState,
    showEnrollButton,
  } = useTradingCompHeader();

  const showCountdown = !!countdownTargetMillis;
  const showEndedPill = phase === 'ended';

  return (
    <div
      className={joinClassNames(
        'font-brand-mono flex flex-col gap-y-4',
        'lg:flex-row lg:items-start lg:justify-between',
      )}
    >
      <PrizePoolSection />
      <div
        className={joinClassNames(
          'flex flex-col items-start gap-y-3 empty:hidden',
          'lg:items-end',
        )}
      >
        {showCountdown && (
          <CountdownSection
            label={countdownLabel}
            targetMillis={countdownTargetMillis}
          />
        )}
        {showEnrollButton && (
          <TradingCompHeaderEnrollButton
            buttonState={enrollButtonState}
            onClick={handleEnroll}
          />
        )}
        {showEndedPill && (
          <Pill sizeVariant="xs" colorVariant="secondary">
            {t(($) => $.tradingCompetition.competitionEnded)}
          </Pill>
        )}
      </div>
    </div>
  );
}

function PrizePoolSection() {
  const { t } = useTranslation();

  const formattedPrizePool = formatNumber(TOTAL_TRADING_COMP_PRIZE_POOL_USD, {
    formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_INT,
  });

  return (
    <div className="flex flex-col gap-y-2">
      <span className="text-text-tertiary text-xs">
        {t(($) => $.tradingCompetition.totalPrizePool)}
      </span>
      <AnimatedDecryptedText
        className="text-text-primary text-5xl lg:text-[3em]"
        speed={100}
        text={formattedPrizePool}
      />
      <p className={joinClassNames('text-text-secondary text-sm', 'lg:w-1/2')}>
        {t(($) => $.tradingCompetition.totalPrizePoolDescription, {
          prizePoolAmount: formattedPrizePool,
        })}
      </p>
    </div>
  );
}

function CountdownSection({
  label,
  targetMillis,
}: {
  label: string | undefined;
  targetMillis: number | undefined;
}) {
  return (
    <div
      className={joinClassNames(
        'flex flex-col items-start gap-y-1',
        'lg:items-end',
      )}
    >
      <span className="text-text-tertiary text-xs">{label}</span>
      <Countdown endTimeMillis={targetMillis} />
    </div>
  );
}
