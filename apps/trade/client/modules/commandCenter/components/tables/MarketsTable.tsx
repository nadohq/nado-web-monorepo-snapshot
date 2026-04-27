import {
  formatNumber,
  PresetNumberFormatSpecifier,
  useNadoMetadataContext,
} from '@nadohq/react-client';
import { Icons } from '@nadohq/web-ui';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { MarketProductInfoCell } from 'client/components/DataTable/cells/MarketProductInfoCell';
import { StackedTableCell } from 'client/components/DataTable/cells/StackedTableCell';
import {
  bigNumberSortFn,
  getKeyedBigNumberSortFn,
} from 'client/components/DataTable/utils/sortingFns';
import { ActionName } from 'client/modules/commandCenter/components/cells/ActionName';
import { BaseTable } from 'client/modules/commandCenter/components/tables/BaseTable/BaseTable';
import { MarketTableItem } from 'client/modules/commandCenter/hooks/useCommandCenterMarketItems';
import { NumberCell } from 'client/modules/tables/cells/NumberCell';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const columnHelper = createColumnHelper<MarketTableItem>();

interface Props {
  markets: MarketTableItem[] | undefined;
}

export function MarketsTable({ markets }: Props) {
  const { t } = useTranslation();
  const {
    primaryQuoteToken: { symbol: primaryQuoteTokenSymbol },
  } = useNadoMetadataContext();

  const columns: ColumnDef<MarketTableItem, any>[] = useMemo(() => {
    return [
      columnHelper.accessor('metadata', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.market)}</HeaderCell>
        ),
        cell: (context) => {
          const value = context.getValue<MarketTableItem['metadata']>();
          const { icon } = getSharedProductMetadata(value);

          return (
            <MarketProductInfoCell
              symbol={value.marketName}
              iconSrc={icon.asset}
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: 'w-40',
        },
      }),
      columnHelper.accessor('price', {
        header: ({ header }) => (
          <HeaderCell header={header}>{t(($) => $.price)}</HeaderCell>
        ),
        cell: (context) => {
          const {
            currentPrice,
            priceChangeFrac24h,
            marketPriceFormatSpecifier,
          } = context.getValue<MarketTableItem['price']>();

          const color = getSignDependentColorClassName(priceChangeFrac24h);

          return (
            <StackedTableCell
              top={formatNumber(currentPrice, {
                formatSpecifier: marketPriceFormatSpecifier,
              })}
              bottom={
                <span className={color}>
                  {formatNumber(priceChangeFrac24h, {
                    formatSpecifier:
                      PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_2DP,
                  })}
                </span>
              }
            />
          );
        },
        sortingFn: getKeyedBigNumberSortFn('priceChangeFrac24h'),
        meta: {
          cellContainerClassName: 'min-w-32 max-w-44',
        },
      }),
      columnHelper.accessor('pastDayVolumeInPrimaryQuote', {
        header: ({ header }) => (
          <HeaderCell header={header}>
            {t(($) => $.volumeSymbol, { primaryQuoteTokenSymbol })}
          </HeaderCell>
        ),
        cell: (context) => (
          <NumberCell
            value={context.getValue()}
            formatSpecifier={PresetNumberFormatSpecifier.NUMBER_INT}
          />
        ),
        sortingFn: bigNumberSortFn,
        meta: {
          cellContainerClassName: 'min-w-28',
        },
      }),
      columnHelper.display({
        id: 'isFavorited',
        header: () => null,
        cell: (context) => (
          <ActionName>
            {context.row.original.isFavorited && (
              <Icons.StarFill className="text-accent" size={12} />
            )}
            <span
              // Need to push this down just a tad to get it optically centered.
              className="relative top-[0.5px]"
            >
              {t(($) => $.buttons.trade)}
            </span>
          </ActionName>
        ),
        meta: {
          // A width not required as we're using the `ml-auto` class to push it to the right and there is no header cell.
          cellContainerClassName: 'hidden lg:flex ml-auto',
        },
      }),
    ];
  }, [primaryQuoteTokenSymbol, t]);

  return (
    <BaseTable
      id="markets"
      columns={columns}
      data={markets}
      initialSortingState={[{ id: 'pastDayVolumeInPrimaryQuote', desc: true }]}
      onSelect={(row) => row.original.action()}
    />
  );
}
