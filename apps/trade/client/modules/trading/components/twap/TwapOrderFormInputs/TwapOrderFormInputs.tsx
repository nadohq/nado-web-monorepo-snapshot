import { SecondaryButton } from '@nadohq/web-ui';
import { NumberInputWithLabel } from 'client/components/NumberInputWithLabel';
import { OrderFormInputsSection } from 'client/modules/trading/components/OrderFormInputsSection';
import { useTwapOrderFormInputs } from 'client/modules/trading/components/twap/TwapOrderFormInputs/hooks/useTwapOrderFormInputs';
import { TwapFrequencySelect } from 'client/modules/trading/components/twap/TwapOrderFormInputs/TwapFrequencySelect';
import {
  OrderFormError,
  OrderFormValidators,
} from 'client/modules/trading/types/orderFormTypes';
import { useTranslation } from 'react-i18next';

interface Props {
  validators: OrderFormValidators;
  formError: OrderFormError | undefined;
}

export function TwapOrderFormInputs({ validators, formError }: Props) {
  const { t } = useTranslation();

  const {
    durationHoursErrorTooltipContent,
    durationMinutesErrorTooltipContent,
    frequencyInSeconds,
    durationPresets,
    handleDurationPresetClick,
    durationHoursInputRegister,
    durationMinutesInputRegister,
    handleFrequencyChange,
  } = useTwapOrderFormInputs({
    validators,
    formError,
  });

  return (
    <div className="flex flex-col gap-y-4">
      <OrderFormInputsSection label={t(($) => $.runningTimeRange)}>
        {/* Duration Inputs */}
        <div className="grid grid-cols-2 gap-x-2">
          <NumberInputWithLabel
            label={t(($) => $.durations.hours)}
            placeholder="0"
            errorTooltipContent={durationHoursErrorTooltipContent}
            dataTestId="twap-order-duration-hours-input"
            {...durationHoursInputRegister}
          />
          <NumberInputWithLabel
            label={t(($) => $.durations.minutes)}
            placeholder="0"
            errorTooltipContent={durationMinutesErrorTooltipContent}
            dataTestId="twap-order-duration-minutes-input"
            {...durationMinutesInputRegister}
          />
        </div>
        {/* Duration Presets */}
        <div className="flex gap-x-2">
          {durationPresets.map((preset) => (
            <SecondaryButton
              size="xs"
              className="flex-1"
              key={preset.label}
              onClick={() => handleDurationPresetClick(preset)}
              dataTestId={`twap-order-duration-preset-${preset.label}-button`}
            >
              {preset.label}
            </SecondaryButton>
          ))}
        </div>
      </OrderFormInputsSection>
      {/* Frequency Section */}
      <div className="flex items-center gap-x-1.5">
        <div className="text-text-tertiary text-xs">
          {t(($) => $.frequency)}
        </div>
        <TwapFrequencySelect
          value={frequencyInSeconds}
          onValueChange={handleFrequencyChange}
        />
      </div>
    </div>
  );
}
