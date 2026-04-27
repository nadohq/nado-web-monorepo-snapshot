import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { BaseTestProps } from '@nadohq/web-common';
import { Icons, TextButton } from '@nadohq/web-ui';
import {
  TableCell,
  TableCellProps,
} from 'client/components/DataTable/cells/TableCell';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { PerpPositionsTableItem } from 'client/modules/tables/types/PerpPositionsTableItem';
import { useTranslation } from 'react-i18next';

interface Props extends TableCellProps, BaseTestProps {
  margin: PerpPositionsTableItem['margin'];
  isoSubaccountName: string | undefined;
}

export function PerpMarginCell({
  margin: { crossMarginUsedUsd, isoMarginUsedUsd },
  isoSubaccountName,
  dataTestId,
  ...rest
}: Props) {
  const { t } = useTranslation();
  const { show } = useDialog();

  const isIsoPosition = !!isoSubaccountName && !!isoMarginUsedUsd;
  const formattedMarginUsedUsd = formatNumber(
    crossMarginUsedUsd ?? isoMarginUsedUsd,
    {
      formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
    },
  );

  return (
    <TableCell {...rest} dataTestId={dataTestId}>
      <div className="flex items-center">
        {formattedMarginUsedUsd}
        {isIsoPosition && (
          <TextButton
            aria-label={t(($) => $.buttons.adjustMargin)}
            startIcon={<Icons.PencilSimpleFill />}
            colorVariant="secondary"
            className="p-2 text-xs"
            onClick={() => {
              show({
                type: 'adjust_iso_margin',
                params: { isoSubaccountName },
              });
            }}
          />
        )}
      </div>
    </TableCell>
  );
}
