import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { formatDurationMillis, TimeFormatSpecifier } from '@nadohq/web-ui';
import { useNextFundingTime } from 'client/modules/trading/hooks/useNextFundingTime';
import { useTranslation } from 'react-i18next';

export function FundingRateCountdown({ className }: WithClassnames) {
  const { t } = useTranslation();
  const { millisToNextFunding } = useNextFundingTime();
  const countdown = formatDurationMillis(millisToNextFunding, {
    formatSpecifier: TimeFormatSpecifier.MM_SS,
  });

  return (
    <div className={joinClassNames('flex gap-1.5', className)}>
      <span>{t(($) => $.marketsPage.nextPayment)}</span>
      <span className="text-accent min-w-10">{countdown}</span>
    </div>
  );
}
