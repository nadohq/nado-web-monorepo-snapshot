'use client';

import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { useSubaccountOverview } from 'client/hooks/subaccount/useSubaccountOverview/useSubaccountOverview';
import { MarginManagerMetrics } from 'client/pages/Portfolio/subpages/MarginManager/components/MarginManagerMetrics';
import { ISOLATED_POSITIONS_ANCHOR_ID } from 'client/pages/Portfolio/subpages/MarginManager/consts';
import { useTranslation } from 'react-i18next';

export function MarginManagerIsolatedMetrics() {
  const { t } = useTranslation();

  const { data: overview } = useSubaccountOverview();

  const metricsItems = [
    {
      label: t(($) => $.totalMarginInIsolatedPositions),
      value: overview?.perp.iso.totalNetMarginUsd,
      numberFormatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
    },
  ];

  return (
    <MarginManagerMetrics
      anchorId={ISOLATED_POSITIONS_ANCHOR_ID}
      title={t(($) => $.isolatedPositions)}
      metricsItems={metricsItems}
    />
  );
}
