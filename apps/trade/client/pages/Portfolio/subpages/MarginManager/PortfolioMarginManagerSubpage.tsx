'use client';

import { joinClassNames, WithChildren } from '@nadohq/web-common';
import {
  Card,
  CARD_PADDING_CLASSNAMES,
  Icons,
  TextButton,
} from '@nadohq/web-ui';
import { MarginManagerCrossMetrics } from 'client/pages/Portfolio/subpages/MarginManager/components/MarginManagerCrossMetrics';
import { MarginManagerIsolatedMetrics } from 'client/pages/Portfolio/subpages/MarginManager/components/MarginManagerIsolatedMetrics';
import { ISOLATED_POSITIONS_ANCHOR_ID } from 'client/pages/Portfolio/subpages/MarginManager/consts';
import { MarginManagerCrossPositionsTable } from 'client/pages/Portfolio/subpages/MarginManager/tables/MarginManagerCrossPositionsTable';
import { MarginManagerIsolatedPositionsTable } from 'client/pages/Portfolio/subpages/MarginManager/tables/MarginManagerIsolatedPositionsTable';
import { MarginManagerQuoteBalanceTable } from 'client/pages/Portfolio/subpages/MarginManager/tables/MarginManagerQuoteBalanceTable';
import { MarginManagerSpotBalancesTable } from 'client/pages/Portfolio/subpages/MarginManager/tables/MarginManagerSpotBalancesTable';
import { MarginManagerSpreadsTable } from 'client/pages/Portfolio/subpages/MarginManager/tables/MarginManagerSpreadsTable';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

export function PortfolioMarginManagerSubpage() {
  return (
    <div className="flex flex-col gap-y-3 lg:gap-y-6">
      <CrossMetrics />
      <div className="flex flex-col gap-y-2 lg:gap-y-3">
        <MarginManagerTableCard>
          <MarginManagerQuoteBalanceTable />
        </MarginManagerTableCard>
        <MarginManagerTableCard>
          <MarginManagerSpotBalancesTable />
        </MarginManagerTableCard>
        <MarginManagerTableCard>
          <MarginManagerCrossPositionsTable />
        </MarginManagerTableCard>
        <MarginManagerTableCard>
          <MarginManagerSpreadsTable />
        </MarginManagerTableCard>
      </div>
      <div className={CARD_PADDING_CLASSNAMES.horizontal}>
        <MarginManagerIsolatedMetrics />
      </div>
      <MarginManagerTableCard>
        <MarginManagerIsolatedPositionsTable />
      </MarginManagerTableCard>
    </div>
  );
}

function CrossMetrics() {
  const { t } = useTranslation();

  return (
    <div
      className={joinClassNames(
        'flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between',
        CARD_PADDING_CLASSNAMES.horizontal,
      )}
    >
      <MarginManagerCrossMetrics />
      <TextButton
        className="w-max text-sm"
        colorVariant="secondary"
        as={Link}
        href={`#${ISOLATED_POSITIONS_ANCHOR_ID}`}
        endIcon={<Icons.ArrowDown />}
      >
        {t(($) => $.skipToIsolatedPositions)}
      </TextButton>
    </div>
  );
}

function MarginManagerTableCard({ children }: WithChildren) {
  return <Card className="p-0">{children}</Card>;
}
