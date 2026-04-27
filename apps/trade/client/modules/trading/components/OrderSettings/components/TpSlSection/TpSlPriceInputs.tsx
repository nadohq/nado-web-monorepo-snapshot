import { getMarketPriceFormatSpecifier } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { NumberInputWithLabel } from 'client/components/NumberInputWithLabel';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import { TpSlGainOrLossInputTypeSelect } from 'client/modules/trading/tpsl/components/TpSlGainOrLossInputTypeSelect';
import { TpSlTriggerReferencePriceTypeSelect } from 'client/modules/trading/tpsl/components/TpSlTriggerReferencePriceTypeSelect';
import { UseTpSlOrderForm } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { useTpSlTriggerPriceErrorTooltipContent } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/useTpSlTriggerPriceErrorTooltipContent';
import { useTranslation } from 'react-i18next';

interface Props {
  tpSlOrderForm: UseTpSlOrderForm;
  isTakeProfit: boolean;
  priceIncrement: BigNumber | undefined;
}

export function TpSlPriceInputs({
  tpSlOrderForm,
  isTakeProfit,
  priceIncrement,
}: Props) {
  const { t } = useTranslation();

  const { form, tpState, slState } = tpSlOrderForm;
  const priceState = isTakeProfit ? tpState : slState;
  const { formPriceValuesKey } = priceState;

  const triggerPriceErrorTooltipContent =
    useTpSlTriggerPriceErrorTooltipContent({
      state: priceState,
      isTakeProfit,
      priceFormatSpecifier: getMarketPriceFormatSpecifier(priceIncrement),
    });

  const pricePlaceholder = useNumericInputPlaceholder({
    increment: priceIncrement,
  });
  const pnlPlaceholder = useNumericInputPlaceholder();

  return (
    <div className="flex flex-col gap-y-2">
      <div className="flex items-center gap-x-2">
        {isTakeProfit
          ? t(($) => $.takeProfitAbbrevPrice)
          : t(($) => $.stopLossAbbrevPrice)}{' '}
        <TpSlTriggerReferencePriceTypeSelect
          hasBackground
          form={form}
          formPriceValuesKey={formPriceValuesKey}
        />
      </div>
      <div className="grid grid-cols-2 gap-x-2">
        <NumberInputWithLabel
          {...form.register(`${formPriceValuesKey}.triggerPrice`, {
            validate: priceState.validateTriggerPrice,
          })}
          label={
            isTakeProfit
              ? t(($) => $.takeProfitAbbrev)
              : t(($) => $.stopLossAbbrev)
          }
          placeholder={pricePlaceholder}
          min={0}
          step={priceIncrement?.toString()}
          errorTooltipContent={triggerPriceErrorTooltipContent}
          onFocus={() =>
            form.setValue(`${formPriceValuesKey}.triggerPriceSource`, 'price')
          }
          dataTestId={`order-settings-${isTakeProfit ? 'tp' : 'sl'}-trigger-price-input`}
        />
        <NumberInputWithLabel
          {...form.register(`${formPriceValuesKey}.gainOrLossValue`)}
          label={isTakeProfit ? t(($) => $.gain) : t(($) => $.loss)}
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
          dataTestId={`order-settings-${isTakeProfit ? 'tp' : 'sl'}-gain-or-loss-input`}
        />
      </div>
    </div>
  );
}
