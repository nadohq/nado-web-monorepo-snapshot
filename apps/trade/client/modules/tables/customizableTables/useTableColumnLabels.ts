import { CustomizableTableType } from 'client/modules/tables/customizableTables/tableConfig';
import { PerpPositionsColumnId } from 'client/modules/tables/customizableTables/tableConfigs/perpPositions';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// Used for tables columns with CustomizableTableColumnsDialog
export function useTableColumnLabels() {
  const { t } = useTranslation();

  return useMemo(() => {
    return {
      perpPositions: {
        productName: t(($) => $.market),
        positionSize: t(($) => $.size),
        notionalValueUsd: t(($) => $.value),
        averageEntryPrice: t(($) => $.entryPrice),
        oraclePrice: t(($) => $.oraclePrice),
        estimatedLiquidationPrice: t(($) => $.estimatedAbbrevLiqPrice),
        tpSl: t(($) => $.tpSl),
        pnlInfo: t(($) => $.estimatedAbbrevPnlRoeParens),
        margin: t(($) => $.margin),
        netFunding: t(($) => $.funding),
        actions: t(($) => $.actions),
      },
    } satisfies Record<
      CustomizableTableType,
      Record<PerpPositionsColumnId, string>
    >;
  }, [t]);
}
