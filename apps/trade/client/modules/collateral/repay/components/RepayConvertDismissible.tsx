import { useNadoMetadataContext } from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { UserDisclosureDismissibleCard } from 'client/components/UserDisclosureDismissibleCard';
import { useTranslation } from 'react-i18next';

export function RepayConvertDismissible({ className }: WithClassnames) {
  const { t } = useTranslation();
  const {
    primaryQuoteToken: { symbol: primaryQuoteTokenSymbol },
  } = useNadoMetadataContext();

  return (
    <UserDisclosureDismissibleCard
      className={className}
      disclosureKey="repay_convert_info"
      title={t(($) => $.convertRepay)}
      description={t(($) => $.convertRepayDescription, {
        primaryQuoteTokenSymbol,
      })}
    />
  );
}
