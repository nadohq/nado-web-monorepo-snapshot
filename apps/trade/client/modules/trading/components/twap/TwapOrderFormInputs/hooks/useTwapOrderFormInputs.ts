import { TimeInSeconds } from '@nadohq/client';
import { useTwapOrderDurationHoursInputErrorTooltipContent } from 'client/modules/trading/components/twap/TwapOrderFormInputs/hooks/useTwapOrderDurationHoursInputErrorTooltipContent';
import { useTwapOrderDurationMinutesInputErrorTooltipContent } from 'client/modules/trading/components/twap/TwapOrderFormInputs/hooks/useTwapOrderDurationMinutesInputErrorTooltipContent';
import {
  OrderFormError,
  OrderFormValidators,
  OrderFormValues,
} from 'client/modules/trading/types/orderFormTypes';
import { intervalToDuration, secondsToMilliseconds } from 'date-fns';
import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface DurationPreset {
  label: string;
  value: number;
}

interface Params {
  validators: OrderFormValidators;
  formError: OrderFormError | undefined;
}

export function useTwapOrderFormInputs({ validators, formError }: Params) {
  const { t } = useTranslation();

  const form = useFormContext<OrderFormValues>();
  const frequencyInSeconds = useWatch({
    control: form.control,
    name: 'twapOrder.frequencyInSeconds',
  });

  const durationHoursErrorTooltipContent =
    useTwapOrderDurationHoursInputErrorTooltipContent({
      formError,
    });

  const durationMinutesErrorTooltipContent =
    useTwapOrderDurationMinutesInputErrorTooltipContent({
      formError,
    });

  const handleDurationPresetClick = useCallback(
    (preset: DurationPreset) => {
      const duration = intervalToDuration({
        start: 0,
        end: secondsToMilliseconds(preset.value),
      });

      const { hours = 0, minutes = 0 } = duration;

      form.setValue('twapOrder.durationHours', hours.toString(), {
        shouldValidate: true,
        shouldTouch: true,
      });
      form.setValue('twapOrder.durationMinutes', minutes.toString(), {
        shouldValidate: true,
        shouldTouch: true,
      });
    },
    [form],
  );

  const durationHoursInputRegister = form.register('twapOrder.durationHours', {
    validate: validators.twapDurationHours,
  });

  const durationMinutesInputRegister = form.register(
    'twapOrder.durationMinutes',
    {
      validate: validators.twapDurationMinutes,
    },
  );

  const handleFrequencyChange = useCallback(
    (value: number) => {
      form.setValue('twapOrder.frequencyInSeconds', value);
    },
    [form],
  );

  const durationPresets: DurationPreset[] = useMemo(
    () => [
      {
        label: t(($) => $.durations.label10m),
        value: 10 * TimeInSeconds.MINUTE,
      },
      {
        label: t(($) => $.durations.label30m),
        value: 30 * TimeInSeconds.MINUTE,
      },
      { label: t(($) => $.durations.label1h), value: TimeInSeconds.HOUR },
      { label: t(($) => $.durations.label4h), value: 4 * TimeInSeconds.HOUR },
    ],
    [t],
  );

  return {
    durationHoursInputRegister,
    durationMinutesInputRegister,
    durationHoursErrorTooltipContent,
    durationMinutesErrorTooltipContent,
    frequencyInSeconds,
    handleFrequencyChange,
    durationPresets,
    handleDurationPresetClick,
  };
}
