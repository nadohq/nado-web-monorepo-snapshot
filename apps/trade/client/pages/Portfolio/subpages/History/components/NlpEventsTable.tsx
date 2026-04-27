import {
  CustomNumberFormatSpecifier,
  NLP_TOKEN_INFO,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { Pill } from '@nadohq/web-ui';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { StackedTableCell } from 'client/components/DataTable/cells/StackedTableCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { AmountWithSymbolCell } from 'client/modules/tables/cells/AmountWithSymbolCell';
import { DateTimeCell } from 'client/modules/tables/cells/DateTimeCell';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import {
  HistoricalNlpEventsTableItem,
  useNlpEventsTable,
} from 'client/pages/Portfolio/subpages/History/hooks/useNlpEventsTable';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<HistoricalNlpEventsTableItem>();

interface Props extends WithClassnames {
  pageSize: number;
  showPagination?: boolean;
}

export function NlpEventsTable({ className, pageSize, showPagination }: Props) {
  const { t } = useTranslation();

  const {
    primaryQuoteToken: { symbol: primaryQuoteSymbol },
  } = useNadoMetadataContext();
  const {
    mappedData: pools,
    isLoading,
    pagination,
  } = useNlpEventsTable({ pageSize });

  const columns: ColumnDef<HistoricalNlpEventsTableItem, any>[] =
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
        columnHelper.accessor('action', {
          header: ({ header }) => (
            <HeaderCell header={header}>{t(($) => $.action)}</HeaderCell>
          ),
          cell: (context) => {
            const action =
              context.getValue<HistoricalNlpEventsTableItem['action']>();
            return (
              <TableCell>
                <Pill colorVariant="primary" sizeVariant="xs">
                  {t(($) => $[action])}
                </Pill>
              </TableCell>
            );
          },
          enableSorting: false,
          meta: {
            cellContainerClassName: 'w-32',
          },
        }),
        columnHelper.accessor('amountChanges', {
          header: ({ header }) => (
            <HeaderCell
              header={header}
              definitionTooltipId="historicalNlpChangeInBalances"
            >
              {t(($) => $.changeInBalances)}
            </HeaderCell>
          ),
          cell: (context) => {
            const { nlpAmount, primaryQuoteAmount } =
              context.getValue<HistoricalNlpEventsTableItem['amountChanges']>();

            return (
              <StackedTableCell
                top={
                  <AmountWithSymbolCell
                    amount={nlpAmount}
                    symbol={NLP_TOKEN_INFO.symbol}
                    formatSpecifier={
                      CustomNumberFormatSpecifier.SIGNED_NUMBER_AUTO
                    }
                  />
                }
                bottom={
                  <AmountWithSymbolCell
                    amount={primaryQuoteAmount}
                    symbol={primaryQuoteSymbol}
                    formatSpecifier={
                      CustomNumberFormatSpecifier.SIGNED_NUMBER_AUTO
                    }
                  />
                }
              />
            );
          },
          enableSorting: false,
          meta: {
            cellContainerClassName:
              TABLE_CELL_CONTAINER_CLASSNAME.amountWithSymbol,
          },
        }),
      ];
    }, [primaryQuoteSymbol, t]);

  return (
    <DataTable
      columns={columns}
      data={pools}
      isLoading={isLoading}
      tableContainerClassName={className}
      pagination={showPagination ? pagination : undefined}
      emptyState={<EmptyTablePlaceholder type="history_nlp" />}
    />
  );
}
