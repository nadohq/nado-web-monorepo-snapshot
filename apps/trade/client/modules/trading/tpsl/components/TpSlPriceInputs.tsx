import { getMarketPriceFormatSpecifier } from '@nadohq/react-client';
import { Checkbox, Divider, Icons, TextButton } from '@nadohq/web-ui';
import { CheckedState } from '@radix-ui/react-checkbox';
import { BigNumber } from 'bignumber.js';
import { NumberInputWithLabel } from 'client/components/NumberInputWithLabel';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import { TpSlGainOrLossInputTypeSelect } from 'client/modules/trading/tpsl/components/TpSlGainOrLossInputTypeSelect';
import { TpSlTriggerReferencePriceTypeSelect } from 'client/modules/trading/tpsl/components/TpSlTriggerReferencePriceTypeSelect';
import { getTpSlFormPriceValuesKey } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/getTpSlFormPriceValuesKey';
import {
  TpSlOrderFormPriceState,
  TpSlOrderFormValues,
} from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { useTpSlLimitPriceErrorTooltipContent } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/useTpSlLimitPriceErrorTooltipContent';
import { useTpSlTriggerPriceErrorTooltipContent } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/useTpSlTriggerPriceErrorTooltipContent';
import { FieldPathByValue, UseFormReturn, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Props {
  form: UseFormReturn<TpSlOrderFormValues>;
  priceState: TpSlOrderFormPriceState;
  isTakeProfit: boolean;
  priceIncrement: BigNumber | undefined;
  setActiveField: (
    field: FieldPathByValue<TpSlOrderFormValues, string>,
  ) => void;
}

export function TpSlPriceInputs({
  form,
  priceState,
  isTakeProfit,
  priceIncrement,
  setActiveField,
}: Props) {
  const { t } = useTranslation();
  const formPriceValuesKey = getTpSlFormPriceValuesKey(isTakeProfit);
  const title = isTakeProfit
    ? t(($) => $.orderTypes.takeProfit)
    : t(($) => $.orderTypes.stopLoss);

  const priceFormatSpecifier = getMarketPriceFormatSpecifier(priceIncrement);

  const triggerPriceErrorTooltipContent =
    useTpSlTriggerPriceErrorTooltipContent({
      state: priceState,
      isTakeProfit,
      priceFormatSpecifier,
    });

  const limitPriceErrorTooltipContent = useTpSlLimitPriceErrorTooltipContent({
    error: priceState.limitPriceError,
  });

  const checkboxId = `${formPriceValuesKey}-limit-order`;
  const isLimitOrderChecked = useWatch({
    control: form.control,
    name: `${formPriceValuesKey}.isLimitOrder`,
  });
  const onLimitOrderCheckedChange = (checkedState: CheckedState) => {
    form.setValue(`${formPriceValuesKey}.isLimitOrder`, !!checkedState);
  };

  const pricePlaceholder = useNumericInputPlaceholder();
  const pnlPlaceholder = useNumericInputPlaceholder();

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-tertiary">{title}</span>
        <div className="flex items-center gap-x-2">
          <Checkbox.Row>
            <Checkbox.Check
              id={checkboxId}
              checked={isLimitOrderChecked}
              onCheckedChange={onLimitOrderCheckedChange}
              sizeVariant="xs"
            />
            <Checkbox.Label id={checkboxId} sizeVariant="xs">
              {t(($) => $.orderTypes.limit)}
            </Checkbox.Label>
          </Checkbox.Row>
          <Divider vertical className="h-3" />
          <TextButton
            colorVariant="tertiary"
            onClick={priceState?.clearInputs}
            startIcon={<Icons.ArrowCounterClockwise className="size-4" />}
            title={t(($) => $.buttons.reset)}
          />
        </div>
      </div>
      <div className="grid grid-cols-5 gap-x-2">
        <NumberInputWithLabel
          {...form.register(`${formPriceValuesKey}.triggerPrice`, {
            validate: priceState.validateTriggerPrice,
          })}
          label={t(($) => $.trigger)}
          placeholder={pricePlaceholder}
          errorTooltipContent={triggerPriceErrorTooltipContent}
          className="col-span-3"
          dataTestId="tpsl-price-inputs-trigger-price-input"
          endElement={
            <div className="flex items-center gap-x-2">
              <Divider vertical />
              <TpSlTriggerReferencePriceTypeSelect
                form={form}
                formPriceValuesKey={formPriceValuesKey}
              />
            </div>
          }
          onFocus={() => {
            form.setValue(`${formPriceValuesKey}.triggerPriceSource`, 'price');
            setActiveField(`${formPriceValuesKey}.triggerPrice`);
          }}
          step={priceIncrement?.toString()}
        />
        <NumberInputWithLabel
          {...form.register(`${formPriceValuesKey}.gainOrLossValue`)}
          className="col-span-2"
          label={isTakeProfit ? t(($) => $.gain) : t(($) => $.loss)}
          dataTestId="tpsl-price-inputs-gain-or-loss-input"
          placeholder={pnlPlaceholder}
          endElement={
            <TpSlGainOrLossInputTypeSelect
              form={form}
              priceState={priceState}
            />
          }
          errorTooltipContent={triggerPriceErrorTooltipContent}
          onFocus={() =>
            form.setValue(
              `${formPriceValuesKey}.triggerPriceSource`,
              'gainOrLossValue',
            )
          }
        />
      </div>
      {isLimitOrderChecked && (
        <NumberInputWithLabel
          {...form.register(`${formPriceValuesKey}.limitPrice`, {
            validate: priceState.validateLimitPrice,
          })}
          label={t(($) => $.limitPrice)}
          placeholder={pricePlaceholder}
          errorTooltipContent={limitPriceErrorTooltipContent}
          step={priceIncrement?.toString()}
          onFocus={() => {
            setActiveField(`${formPriceValuesKey}.limitPrice`);
          }}
        />
      )}
    </div>
  );
}
