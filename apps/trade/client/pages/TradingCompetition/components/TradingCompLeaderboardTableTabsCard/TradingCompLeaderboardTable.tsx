'use client';

import type { IndexerLeaderboardRankType } from '@nadohq/client';
import {
  PresetNumberFormatSpecifier,
  truncateAddress,
  truncateMiddle,
} from '@nadohq/react-client';
import { Icons, LinkButton } from '@nadohq/web-ui';
import { createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { CurrencyCell } from 'client/modules/tables/cells/CurrencyCell';
import { NumberCell } from 'client/modules/tables/cells/NumberCell';
import { PercentageChangeCell } from 'client/modules/tables/cells/PercentageChangeCell';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import {
  TradingCompLeaderboardTableItem,
  useTradingCompLeaderboardTable,
} from 'client/pages/TradingCompetition/components/TradingCompLeaderboardTableTabsCard/useTradingCompLeaderboardTable';
import Link from 'next/link';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<TradingCompLeaderboardTableItem>();

interface Props {
  contestId: number;
  rankType: IndexerLeaderboardRankType;
}

export function TradingCompLeaderboardTable({ contestId, rankType }: Props) {
  const { t } = useTranslation();
  const { data, isLoading, pagination } = useTradingCompLeaderboardTable({
    contestId,
    rankType,
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('currentRank', {
        id: 'rank',
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.rank)}</HeaderCell>
        ),
        cell: (context) => (
          <NumberCell
            value={context.getValue()}
            formatSpecifier={PresetNumberFormatSpecifier.NUMBER_INT}
          />
        ),
        meta: { cellContainerClassName: 'w-20' },
      }),
      columnHelper.accessor('address', {
        header: ({ header }) => (
          <HeaderCell header={header}>
            {t(($) => $.tradingCompetition.trader)}
          </HeaderCell>
        ),
        cell: (context) => {
          const { ensName, twitterUsername, twitterProfileUrl } =
            context.row.original;
          const showLink = twitterProfileUrl && twitterUsername;
          const displayName = ensName
            ? truncateMiddle(ensName, 7)
            : truncateAddress(context.getValue());

          return (
            <TableCell>
              <div className="flex flex-col gap-y-1">
                <span
                  className="text-text-primary text-xs"
                  title={ensName ?? context.getValue()}
                >
                  {displayName}
                </span>
                {showLink && (
                  <LinkButton
                    as={Link}
                    href={twitterProfileUrl}
                    external
                    colorVariant="secondary"
                    className="text-xs"
                  >
                    <Icons.XLogo className="text-text-primary size-4" />@
                    {twitterUsername}
                  </LinkButton>
                )}
              </div>
            </TableCell>
          );
        },
        meta: { cellContainerClassName: 'flex-1 min-w-32' },
      }),
      columnHelper.accessor('roi', {
        header: ({ header }) => (
          <HeaderCell header={header}>
            {t(($) => $.tradingCompetition.tracks.roi)}
          </HeaderCell>
        ),
        cell: (context) => <PercentageChangeCell value={context.getValue()} />,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
      columnHelper.accessor('volumeUsd', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.totalVolume)}</HeaderCell>
        ),
        cell: (context) => <CurrencyCell value={context.getValue()} />,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
      columnHelper.accessor('prizeUsd', {
        header: ({ header }) => (
          <HeaderCell header={header}>
            {t(($) => $.tradingCompetition.prize)}
          </HeaderCell>
        ),
        cell: (context) => (
          <CurrencyCell value={context.getValue()} className="text-warning" />
        ),
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
    ],
    [t],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      pagination={pagination}
      emptyState={
        <EmptyTablePlaceholder type="trading_competition_leaderboard" />
      }
    />
  );
}
