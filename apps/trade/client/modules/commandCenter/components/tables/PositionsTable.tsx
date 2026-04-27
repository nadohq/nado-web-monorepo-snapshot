import { WithClassnames } from '@nadohq/web-common';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { getKeyedBigNumberSortFn } from 'client/components/DataTable/utils/sortingFns';
import { PnlValueWithPercentage } from 'client/components/PnlValueWithPercentage';
import { ActionName } from 'client/modules/commandCenter/components/cells/ActionName';
import { BaseTable } from 'client/modules/commandCenter/components/tables/BaseTable/BaseTable';
import { PositionsTableItem } from 'client/modules/commandCenter/hooks/useCommandCenterPositionItems';
import { StackedAmountValueCell } from 'client/modules/tables/cells/StackedAmountValueCell';
import { PerpPositionLabel } from 'client/modules/tables/components/PerpPositionLabel';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  positions: PositionsTableItem[] | undefined;
}

const columnHelper = createColumnHelper<PositionsTableItem>();

export function PositionsTable({ positions }: Props) {
  const { t } = useTranslation();

  const columns: ColumnDef<PositionsTableItem, any>[] = useMemo(() => {
    return [
      columnHelper.accessor('marketInfo', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.market)}</HeaderCell>
        ),
        cell: (context) => (
          <TableCell className="px-3">
            <PerpPositionLabel
              productId={context.row.original.productId}
              marketName={context.getValue().marketName}
              amountForSide={context.row.original.amountInfo.position}
              marginModeType={context.row.original.marginModeType}
              isoLeverage={context.row.original.isoLeverage}
            />
          </TableCell>
        ),
        enableSorting: false,
        meta: {
          cellContainerClassName:
            'min-w-40 lg:min-w-56 product-label-border-container',
        },
      }),
      columnHelper.accessor('amountInfo', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.size)}</HeaderCell>
        ),
        cell: (context) => {
          const { position, notionalValueUsd, symbol } =
            context.getValue<PositionsTableItem['amountInfo']>();
          return (
            <StackedAmountValueCell
              symbol={symbol}
              size={position}
              sizeFormatSpecifier={context.row.original.sizeFormatSpecifier}
              valueUsd={notionalValueUsd}
            />
          );
        },
        sortingFn: getKeyedBigNumberSortFn('notionalValueUsd'),
        meta: {
          cellContainerClassName: 'min-w-36 hidden lg:flex',
        },
      }),
      columnHelper.accessor('pnlInfo', {
        header: ({ header }) => (
          <HeaderCell
            definitionTooltipId="estimatedPositionPnL"
            header={header}
          >
            {t(($) => $.estimatedAbbrevPnl)}
          </HeaderCell>
        ),
        cell: (context) => {
          const { estimatedPnlUsd, estimatedPnlFrac } =
            context.getValue<PositionsTableItem['pnlInfo']>();
          return (
            <TableCell>
              <PnlValueWithPercentage
                className="flex flex-col"
                pnlUsd={estimatedPnlUsd}
                pnlFrac={estimatedPnlFrac}
              />
            </TableCell>
          );
        },
        sortingFn: getKeyedBigNumberSortFn('estimatedPnlUsd'),
        meta: {
          cellContainerClassName: 'min-w-24 lg:min-w-28',
        },
      }),
      columnHelper.display({
        id: 'actionText',
        header: () => null,
        cell: (context) => {
          return <ActionName>{context.row.original.actionText}</ActionName>;
        },
        meta: {
          cellContainerClassName: 'ml-auto',
        },
      }),
    ];
  }, [t]);

  return (
    <BaseTable
      id="positions"
      columns={columns}
      data={positions}
      onSelect={(row) => row.original.action()}
    />
  );
}
