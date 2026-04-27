import { Icons, TextButton } from '@nadohq/web-ui';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { DateTimeCell } from 'client/modules/tables/cells/DateTimeCell';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { LiquidationAmountInfoCell } from 'client/modules/tables/liquidations/LiquidationEventsTable/cells/LiquidationAmountInfoCell/LiquidationAmountInfoCell';
import { LiquidationBalanceChangesCell } from 'client/modules/tables/liquidations/LiquidationEventsTable/cells/LiquidationBalanceChangesCell';
import { LiquidationOraclePriceCell } from 'client/modules/tables/liquidations/LiquidationEventsTable/cells/LiquidationOraclePriceCell';
import { LiquidationTypeCell } from 'client/modules/tables/liquidations/LiquidationEventsTable/cells/LiquidationTypeCell';
import { useLiquidationEventsTable } from 'client/modules/tables/liquidations/LiquidationEventsTable/useLiquidationEventsTable';
import { LiquidationEventsTableItem } from 'client/modules/tables/liquidations/types';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<LiquidationEventsTableItem>();

interface Props {
  pageSize: number;
  showPagination?: boolean;
  productIds?: number[];
}

/**
 * Renders a table of liquidation events with columns for time, type, liquidation amount, oracle price, and position changes.
 * Includes actions column for viewing details of each liquidation event.
 */
export function LiquidationEventsTable({
  pageSize,
  showPagination,
  productIds,
}: Props) {
  const { t } = useTranslation();

  const { show } = useDialog();
  const { mappedData, isLoading, pagination } = useLiquidationEventsTable({
    pageSize,
    productIds,
  });

  const columns: ColumnDef<LiquidationEventsTableItem, any>[] = useMemo(() => {
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
      columnHelper.accessor('liquidatedBalanceTypes', {
        header: ({ header }) => (
          <HeaderCell header={header}>
            <DefinitionTooltip definitionId="liquidationType">
              {t(($) => $.type)}
            </DefinitionTooltip>
          </HeaderCell>
        ),
        cell: (context) => {
          const liquidatedBalanceTypes = context.getValue();
          return (
            <LiquidationTypeCell
              liquidatedBalanceTypes={liquidatedBalanceTypes}
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: 'w-24',
        },
      }),
      columnHelper.display({
        id: 'liquidationDetails',
        header: ({ header }) => (
          <HeaderCell header={header}>
            <DefinitionTooltip definitionId="historicalLiquidationAffectedPositions">
              {t(($) => $.liquidation)}
            </DefinitionTooltip>
          </HeaderCell>
        ),
        cell: (context) => (
          <LiquidationAmountInfoCell
            spot={context.row.original.spot}
            perp={context.row.original.perp}
          />
        ),
        enableSorting: false,
        meta: {
          cellContainerClassName: 'min-w-72 max-w-76',
        },
      }),
      columnHelper.display({
        id: 'tradingOraclePrice',
        header: ({ header }) => (
          <HeaderCell
            header={header}
            definitionTooltipId="historicalLiquidationOraclePrice"
          >
            {t(($) => $.oraclePrice)}
          </HeaderCell>
        ),
        cell: (context) => (
          <LiquidationOraclePriceCell
            spot={context.row.original.spot}
            perp={context.row.original.perp}
          />
        ),
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.price,
        },
      }),
      columnHelper.display({
        id: 'balanceChanges',
        header: ({ header }) => (
          <HeaderCell
            header={header}
            definitionTooltipId="historicalLiquidationPositionChanges"
          >
            {t(($) => $.positionChanges)}
          </HeaderCell>
        ),
        cell: (context) => (
          <LiquidationBalanceChangesCell
            spot={context.row.original.spot}
            perp={context.row.original.perp}
          />
        ),
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: () => null,
        cell: (context) => {
          return (
            <TableCell>
              <TextButton
                className=""
                colorVariant="secondary"
                onClick={() => {
                  show({
                    type: 'pre_liquidation_details',
                    params: {
                      liquidationTimestampMillis:
                        context.row.original.timestampMillis,
                    },
                  });
                }}
              >
                <Icons.Info size={16} />
              </TextButton>
            </TableCell>
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.actions,
        },
      }),
    ];
  }, [show, t]);

  return (
    <DataTable
      fitDataRowHeight
      columns={columns}
      data={mappedData}
      isLoading={isLoading}
      pagination={showPagination ? pagination : undefined}
      emptyState={<EmptyTablePlaceholder type="history_liquidations" />}
    />
  );
}
