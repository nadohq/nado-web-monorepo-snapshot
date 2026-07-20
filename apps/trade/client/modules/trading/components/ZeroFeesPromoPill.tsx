import { GradientPill, Icons, useIsMobile } from '@nadohq/web-ui';
import { useTranslation } from 'react-i18next';

export function ZeroFeesPromoPill() {
  const { t } = useTranslation();
  const isMobile = useIsMobile();

  return (
    <GradientPill
      colorVariant="accent-yellow"
      icon={isMobile ? undefined : Icons.CurrencyCircleDollar}
    >
      {t(($) => $.zeroFees)}
    </GradientPill>
  );
}
