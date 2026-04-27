import { Select, SelectOption, useSelect } from '@nadohq/web-ui';
import { HistoryExportType } from 'client/pages/Portfolio/subpages/History/exportHistory/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  selectedValue: HistoryExportType;
  onSelectedValueChange: (table: HistoryExportType) => void;
}

export function ExportHistoryTypeSelect({
  selectedValue,
  onSelectedValueChange,
}: Props) {
  const { t } = useTranslation();

  const exportHistoryTypeSelectOptions: SelectOption<HistoryExportType>[] =
    useMemo(
      () => [
        {
          value: 'trades',
          label: t(($) => $.exportTypes.trades),
        },
        {
          value: 'historical_engine_orders',
          label: t(($) => $.exportTypes.limitAndMarketOrders),
        },
        {
          value: 'historical_stop_orders',
          label: t(($) => $.exportTypes.stopOrders),
        },
        {
          value: 'historical_tp_sl',
          label: t(($) => $.exportTypes.tpslOrders),
        },
        {
          value: 'historical_twap',
          label: t(($) => $.exportTypes.twapOrders),
        },
        {
          value: 'funding_payments',
          label: t(($) => $.exportTypes.fundingPayments),
        },
        {
          value: 'interest_payments',
          label: t(($) => $.exportTypes.interestPayments),
        },
        {
          value: 'deposits',
          label: t(($) => $.exportTypes.deposits),
        },
        {
          value: 'withdrawals',
          label: t(($) => $.exportTypes.withdrawals),
        },
        {
          value: 'transfers',
          label: t(($) => $.exportTypes.transfers),
        },
        {
          value: 'nlp',
          label: t(($) => $.exportTypes.nlpAbbrev),
        },
        {
          value: 'settlements',
          label: t(($) => $.exportTypes.settlements),
        },
        {
          value: 'liquidations',
          label: t(($) => $.exportTypes.liquidations),
        },
      ],
      [t],
    );

  const {
    open,
    onOpenChange,
    selectOptions,
    value,
    selectedOption,
    onValueChange,
  } = useSelect({
    onSelectedValueChange,
    selectedValue,
    options: exportHistoryTypeSelectOptions,
  });

  return (
    <Select.Root
      value={value}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={onOpenChange}
    >
      <Select.Trigger
        withChevron
        open={open}
        className="bg-surface-2 px-3 py-2"
        borderRadiusVariant="sm"
      >
        {selectedOption?.label ?? t(($) => $.inputPlaceholders.select)}
      </Select.Trigger>
      {/*height of 64 results in half an item shown at the end to indicate scrollable container*/}
      <Select.Options align="end" viewportClassName="max-h-64">
        {selectOptions.map((option) => (
          <Select.Option value={option.value} key={option.value}>
            {option.label}
          </Select.Option>
        ))}
      </Select.Options>
    </Select.Root>
  );
}
