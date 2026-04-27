import { Select, useSelect } from '@nadohq/web-ui';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import {
  TpSlFormPriceValuesKey,
  TpSlOrderFormValues,
} from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import {
  TRIGGER_REFERENCE_PRICE_TYPES,
  TriggerReferencePriceType,
} from 'client/modules/trading/types/TriggerReferencePriceType';
import { useCallback, useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Props {
  form: UseFormReturn<TpSlOrderFormValues>;
  formPriceValuesKey: TpSlFormPriceValuesKey;
  hasBackground?: boolean;
}

export function TpSlTriggerReferencePriceTypeSelect({
  form,
  formPriceValuesKey,
  hasBackground,
}: Props) {
  const { t } = useTranslation();
  const { setSavedUserState } = useSavedUserState();

  const options: Array<{ label: string; value: TriggerReferencePriceType }> =
    useMemo(() => {
      const priceTypeToLabel: Record<TriggerReferencePriceType, string> = {
        last_price: t(($) => $.lastPriceAbbrev),
        oracle_price: t(($) => $.oraclePriceAbbrev),
        mid_price: t(($) => $.midPriceAbbrev),
      };

      return TRIGGER_REFERENCE_PRICE_TYPES.map((value) => ({
        label: priceTypeToLabel[value],
        value,
      }));
    }, [t]);

  const selectedValue = useWatch({
    control: form.control,
    name: `${formPriceValuesKey}.triggerReferencePriceType`,
  });

  const onSelectedValueChange = useCallback(
    (val: TriggerReferencePriceType) => {
      form.setValue(`${formPriceValuesKey}.triggerReferencePriceType`, val);

      const settingsKey =
        formPriceValuesKey === 'tp' ? 'takeProfit' : 'stopLoss';
      setSavedUserState((prev) => {
        prev.trading.tpSlTriggerPriceType[settingsKey] = val;
        return prev;
      });
    },
    [form, formPriceValuesKey, setSavedUserState],
  );

  const {
    open,
    onValueChange,
    onOpenChange,
    selectedOption,
    selectOptions,
    value,
  } = useSelect({
    selectedValue,
    onSelectedValueChange,
    options,
  });

  const Trigger = hasBackground ? Select.Trigger : Select.TextTrigger;

  return (
    <Select.Root
      value={value}
      open={open}
      onValueChange={onValueChange}
      onOpenChange={onOpenChange}
    >
      {/* min-width to prevent layout shift on change */}
      <Trigger withChevron open={open} className="min-w-[8ch]">
        {selectedOption?.label}
      </Trigger>
      <Select.Options align="end">
        {selectOptions.map(({ label, value }) => {
          return (
            <Select.Option value={value} key={value}>
              {label}
            </Select.Option>
          );
        })}
      </Select.Options>
    </Select.Root>
  );
}
