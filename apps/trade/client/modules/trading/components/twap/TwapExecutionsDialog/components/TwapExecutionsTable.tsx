import { joinClassNames } from '@nadohq/web-common';
import { LabelTooltip } from '@nadohq/web-ui';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { FixedHeaderDataTable } from 'client/components/DataTable/FixedHeaderDataTable';
import { DateTimeCell } from 'client/modules/tables/cells/DateTimeCell';
import { TwapExecution } from 'client/modules/trading/components/twap/TwapExecutionsDialog/hooks/useTwapExecutions';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<TwapExecution>();

interface Props {
  executions: TwapExecution[] | undefined;
  isLoading: boolean;
}

/**
 * Table to display TWAP executions
 */
export function TwapExecutionsTable({ executions, isLoading }: Props) {
  const { t } = useTranslation();

  const columns: ColumnDef<TwapExecution, any>[] = useMemo(() => {
    return [
      columnHelper.accessor('executionId', {
        header: ({ header }) => <HeaderCell header={header}>#</HeaderCell>,
        cell: (context) => <TableCell>{context.getValue()}</TableCell>,
        sortingFn: 'basic',
        meta: {
          cellContainerClassName: 'w-12',
        },
      }),
      columnHelper.accessor('scheduledTimeMillis', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.time)}</HeaderCell>
        ),
        cell: (context) => {
          return <DateTimeCell timestampMillis={context.getValue()} />;
        },
        sortingFn: 'basic',
        meta: {
          cellContainerClassName: 'w-24',
        },
      }),
      columnHelper.accessor('type', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.status)}</HeaderCell>
        ),
        cell: (context) => {
          return <ExecutionStatusCell status={context.getValue()} />;
        },
        sortingFn: 'basic',
        meta: {
          cellContainerClassName: 'w-20',
        },
      }),
      columnHelper.accessor('reason', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.reason)}</HeaderCell>
        ),
        cell: (context) => {
          const reason = context.getValue();

          return (
            <TableCell className="whitespace-normal">
              {reason ? (
                <LabelTooltip label={reason} noHelpCursor>
                  <span className="text-text-secondary wrap-break-words line-clamp-2 text-xs">
                    {reason}
                  </span>
                </LabelTooltip>
              ) : (
                '-'
              )}
            </TableCell>
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: 'flex-1',
        },
      }),
    ];
  }, [t]);

  return (
    <FixedHeaderDataTable
      columns={columns}
      data={executions}
      isLoading={isLoading}
      scrollContainerClassName="max-h-86 gap-y-1.5"
      rowClassName="py-2"
    />
  );
}

interface ExecutionStatusCellProps {
  status: TwapExecution['type'];
}

function ExecutionStatusCell({ status }: ExecutionStatusCellProps) {
  const { t } = useTranslation();

  const { label, className } = {
    pending: {
      label: t(($) => $.executionStatus.pending),
      className: 'text-text-tertiary',
    },
    executed: {
      label: t(($) => $.executionStatus.executed),
      className: 'text-positive',
    },
    failed: {
      label: t(($) => $.executionStatus.failed),
      className: 'text-negative',
    },
    cancelled: {
      label: t(($) => $.executionStatus.cancelled),
      className: 'text-warning',
    },
  }[status];

  return (
    <TableCell className={joinClassNames('text-xs', className)}>
      {label}
    </TableCell>
  );
}
