import {
  DELIST_REDUCE_ONLY_TIME_MILLIS,
  DELIST_TIME_MILLIS,
  PENDING_DELIST_PERP_PRODUCT_IDS,
} from '@nadohq/react-client';
import {
  formatTimestamp,
  LinkButton,
  TimeFormatSpecifier,
} from '@nadohq/web-ui';
import { WarningPanel } from 'client/components/WarningPanel';
import { PerpStaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { LINKS } from 'common/brandMetadata/links';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

interface Props {
  currentMarket: PerpStaticMarketData | undefined;
}

export function ProductPendingDelistInfoPanel({ currentMarket }: Props) {
  const { t } = useTranslation();

  if (!currentMarket) {
    return null;
  }

  const productId = currentMarket.productId;
  const isPendingDelist = PENDING_DELIST_PERP_PRODUCT_IDS.has(productId);

  if (!isPendingDelist) {
    return null;
  }

  const marketName = currentMarket.metadata.marketName;
  const reduceOnlyTime = formatTimestamp(DELIST_REDUCE_ONLY_TIME_MILLIS, {
    formatSpecifier: TimeFormatSpecifier.MMM_D_HH_12H_O,
  });
  const delistTime = formatTimestamp(DELIST_TIME_MILLIS, {
    formatSpecifier: TimeFormatSpecifier.MMM_D_HH_12H_O,
  });

  return (
    <WarningPanel title={t(($) => $.marketDelistedWarning, { marketName })}>
      <p>{t(($) => $.settlementModeNotice, { reduceOnlyTime, marketName })}</p>
      <p>{t(($) => $.tradingCeaseNotice, { delistTime })}</p>
      <LinkButton
        colorVariant="secondary"
        as={Link}
        external
        withExternalIcon
        href={LINKS.may15DelistInfo}
      >
        {t(($) => $.buttons.fullDetails)}
      </LinkButton>
    </WarningPanel>
  );
}
