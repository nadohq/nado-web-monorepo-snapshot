import { getMarketQuoteSizeFormatSpecifier } from '@nadohq/react-client';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { bigNumberSortFn } from 'client/components/DataTable/utils/sortingFns';
import { AmountWithSymbolCell } from 'client/modules/tables/cells/AmountWithSymbolCell';
import { DateTimeCell } from 'client/modules/tables/cells/DateTimeCell';
import { PerpPositionLabel } from 'client/modules/tables/components/PerpPositionLabel';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import {
  HistoricalSettlementsTableItem,
  useSettlementEventsTable,
} from 'client/pages/Portfolio/subpages/History/hooks/useSettlementEventsTable';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<HistoricalSettlementsTableItem>();

interface Props {
  pageSize: number;
  showPagination?: boolean;
}

export function SettlementEventsTable({ pageSize, showPagination }: Props) {
  const { t } = useTranslation();

  const { mappedData, isLoading, pagination } = useSettlementEventsTable({
    pageSize,
  });

  const columns: ColumnDef<HistoricalSettlementsTableItem, any>[] =
    useMemo(() => {
      return [
        columnHelper.accessor('timestampMillis', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.time)}</HeaderCell>
          ),
          cell: (context) => (
            <DateTimeCell timestampMillis={context.getValue()} />
          ),
          sortingFn: 'basic',
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.time,
          },
        }),
        columnHelper.accessor('productName', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.market)}</HeaderCell>
          ),
          cell: (context) => (
            <TableCell>
              <PerpPositionLabel
                productId={context.row.original.productId}
                marketName={context.row.original.productName}
                // Negate the (unsettled) vquote to infer the side correctly
                // We can't use amount directly as position may already be zero
                // at the time of settlement event
                amountForSide={context.row.original.preVQuoteBalance.negated()}
                marginModeType={undefined}
              />
            </TableCell>
          ),
          enableSorting: false,
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.product,
          },
        }),
        columnHelper.accessor('settlementQuoteAmount', {
          header: ({ header }) => (
            <HeaderCell header={header}>
              <DefinitionTooltip definitionId="settlement">
                {t(($) => $.settlement)}
              </DefinitionTooltip>
            </HeaderCell>
          ),
          cell: (context) => (
            <AmountWithSymbolCell
              amount={context.getValue()}
              symbol={context.row.original.quoteSymbol}
              formatSpecifier={getMarketQuoteSizeFormatSpecifier({
                isPrimaryQuote: context.row.original.isPrimaryQuote,
                isSigned: true,
              })}
            />
          ),
          sortingFn: bigNumberSortFn,
          meta: {
            cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
          },
        }),
      ];
    }, [t]);

  return (
    <DataTable
      columns={columns}
      data={mappedData}
      isLoading={isLoading}
      pagination={showPagination ? pagination : undefined}
      emptyState={<EmptyTablePlaceholder type="history_settlements" />}
    />
  );
}
