'use client';

import { BigNumbers } from '@nadohq/client';
import { PresetNumberFormatSpecifier } from '@nadohq/react-client';
import { WithClassnames } from '@nadohq/web-common';
import { IconButton, Icons } from '@nadohq/web-ui';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import { bigNumberSortFn } from 'client/components/DataTable/utils/sortingFns';
import { useCanUserExecute } from 'client/hooks/subaccount/useCanUserExecute';
import { useNotificationManagerContext } from 'client/modules/notifications/NotificationManagerContext';
import { useExecuteDeleteFuulReferee } from 'client/modules/referrals/hooks/execute/useExecuteDeleteFuulReferee';
import { useQueryAddressFuulReferralCode } from 'client/modules/referrals/hooks/query/useQueryAddressFuulReferralCode';
import { AddressCell } from 'client/modules/tables/cells/AddressCell';
import { CurrencyCell } from 'client/modules/tables/cells/CurrencyCell';
import { NumberCell } from 'client/modules/tables/cells/NumberCell';
import { TABLE_CELL_CONTAINER_CLASSNAME } from 'client/modules/tables/consts';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import {
  ReferredTradersTableItem,
  useReferredTradersTable,
} from 'client/pages/Referrals/components/ReferredTradersTable/useReferredTradersTable';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<ReferredTradersTableItem>();

export function ReferredTradersTable({ className }: WithClassnames) {
  const { t } = useTranslation();
  const { data, isLoading } = useReferredTradersTable();

  const { dispatchNotification } = useNotificationManagerContext();
  const { data: referralCodeData } = useQueryAddressFuulReferralCode();
  const canExecute = useCanUserExecute();
  const { mutateAsync: deleteReferee, isPending: isDeletingReferee } =
    useExecuteDeleteFuulReferee();
  const referralCode = referralCodeData?.code;

  const columns: ColumnDef<ReferredTradersTableItem, any>[] = useMemo(() => {
    return [
      columnHelper.accessor('number', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.rankNumberSign)}</HeaderCell>
        ),
        cell: (context) => {
          return (
            <NumberCell
              value={context.getValue()}
              formatSpecifier={PresetNumberFormatSpecifier.NUMBER_INT}
            />
          );
        },
        meta: {
          cellContainerClassName: 'w-12',
        },
        enableSorting: false,
      }),
      columnHelper.accessor('address', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.wallet)}</HeaderCell>
        ),
        cell: (context) => <AddressCell address={context.getValue()} />,
        meta: {
          cellContainerClassName: 'w-36',
        },
        enableSorting: false,
      }),
      columnHelper.accessor('usedAtDate', {
        header: ({ header }) => (
          <HeaderCell header={header}>
            {t(($) => $.referrals.joined)}
          </HeaderCell>
        ),
        cell: (context) => <TableCell>{context.getValue()}</TableCell>,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.time,
        },
        enableSorting: false,
      }),
      columnHelper.accessor('referredVolumeUsdt', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.volume)}</HeaderCell>
        ),
        cell: (context) => <CurrencyCell value={context.getValue()} />,
        meta: {
          cellContainerClassName: TABLE_CELL_CONTAINER_CLASSNAME.amount,
        },
        sortingFn: bigNumberSortFn,
      }),
      columnHelper.display({
        id: 'actions',
        header: ({ header }) => <HeaderCell header={header} />,
        cell: (context) => {
          const row = context.row.original;
          const hasVolume = row.referredVolumeUsdt.gt(BigNumbers.ZERO);
          const disabled =
            !canExecute || hasVolume || isDeletingReferee || !referralCode;

          return (
            <TableCell className="justify-end">
              <IconButton
                tooltipLabel={
                  hasVolume
                    ? t(($) => $.referrals.cannotDeleteRefereeWithTradingVolume)
                    : t(($) => $.buttons.deleteReferee)
                }
                size="sm"
                icon={Icons.Trash}
                disabled={disabled}
                onClick={() => {
                  if (disabled) {
                    return;
                  }

                  const mutationPromise = deleteReferee({
                    referralCode,
                    refereeAddress: row.address,
                  });
                  dispatchNotification({
                    type: 'action_error_handler',
                    data: {
                      errorNotificationTitle: t(
                        ($) => $.errors.deleteRefereeFailed,
                      ),
                      executionData: {
                        serverExecutionResult: mutationPromise,
                      },
                    },
                  });
                }}
              />
            </TableCell>
          );
        },
        meta: {
          cellContainerClassName: 'w-10 ml-auto',
        },
        enableSorting: false,
      }),
    ];
  }, [
    canExecute,
    deleteReferee,
    dispatchNotification,
    isDeletingReferee,
    referralCode,
    t,
  ]);

  return (
    <DataTable
      columns={columns}
      data={data}
      pagination={undefined}
      isLoading={isLoading}
      tableContainerClassName={className}
      emptyState={<EmptyTablePlaceholder type="referred_traders" />}
    />
  );
}
