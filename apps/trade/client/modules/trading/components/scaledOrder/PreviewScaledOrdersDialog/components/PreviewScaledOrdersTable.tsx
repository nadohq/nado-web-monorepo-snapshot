import { WithClassnames } from '@nadohq/web-common';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { BigNumber } from 'bignumber.js';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { FixedHeaderDataTable } from 'client/components/DataTable/FixedHeaderDataTable';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { bigNumberSortFn } from 'client/components/DataTable/utils/sortingFns';
import { NumberCell } from 'client/modules/tables/cells/NumberCell';
import { PercentageCell } from 'client/modules/tables/cells/PercentageCell';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface PreviewScaledOrderTableItem extends WithDataTableRowId {
  price: BigNumber;
  size: BigNumber;
  ratioFrac: BigNumber;
}

const columnHelper = createColumnHelper<PreviewScaledOrderTableItem>();

interface Props extends WithClassnames {
  orders: PreviewScaledOrderTableItem[];
  priceFormatSpecifier: string;
  sizeFormatSpecifier: string;
}

const COLUMN_CONTAINER_CLASSNAME = 'flex-1';

/**
 * Table to preview scaled orders
 */
export function PreviewScaledOrdersTable({
  orders,
  priceFormatSpecifier,
  sizeFormatSpecifier,
  className,
}: Props) {
  const { t } = useTranslation();

  const columns: ColumnDef<PreviewScaledOrderTableItem, any>[] = useMemo(() => {
    return [
      columnHelper.accessor('price', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.price)}</HeaderCell>
        ),
        cell: (context) => (
          <NumberCell
            value={context.getValue()}
            formatSpecifier={priceFormatSpecifier}
          />
        ),
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: COLUMN_CONTAINER_CLASSNAME,
        },
      }),
      columnHelper.accessor('ratioFrac', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.ratio)}</HeaderCell>
        ),
        cell: (context) => <PercentageCell fraction={context.getValue()} />,
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: COLUMN_CONTAINER_CLASSNAME,
        },
      }),
      columnHelper.accessor('size', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.size)}</HeaderCell>
        ),
        cell: (context) => (
          <NumberCell
            value={context.getValue()}
            formatSpecifier={sizeFormatSpecifier}
          />
        ),
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: COLUMN_CONTAINER_CLASSNAME,
        },
      }),
    ];
  }, [priceFormatSpecifier, sizeFormatSpecifier, t]);

  return (
    <FixedHeaderDataTable
      columns={columns}
      data={orders}
      className={className}
      scrollContainerClassName="max-h-92 gap-y-1.5"
      rowClassName="py-2"
      dataTestId="preview-scaled-orders-data-table"
    />
  );
}
