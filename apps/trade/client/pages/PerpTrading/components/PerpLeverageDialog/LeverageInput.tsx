import { CompactInput } from '@nadohq/web-ui';
import {
  PerpLeverageDialogFormLeverageAmountErrorType,
  PerpLeverageDialogFormValues,
} from 'client/pages/PerpTrading/components/PerpLeverageDialog/hooks/usePerpLeverageDialog';
import { useMemo } from 'react';
import { UseFormRegisterReturn, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Props {
  setValue: UseFormReturn<PerpLeverageDialogFormValues>['setValue'];
  leverageAmountInputRegister: UseFormRegisterReturn<'leverageAmount'>;
  leverageAmountError:
    | PerpLeverageDialogFormLeverageAmountErrorType
    | undefined;
  leverageIncrement: number;
}

export function LeverageInput({
  leverageAmountInputRegister,
  setValue,
  leverageAmountError,
  leverageIncrement,
}: Props) {
  const { t } = useTranslation();

  const leverageAmountErrorTooltipContent = useMemo(() => {
    switch (leverageAmountError) {
      case 'invalid_input':
        return t(($) => $.errors.invalidLeverageValue);
      case 'below_min':
        return t(($) => $.errors.leverageBelowMin);
      case 'invalid_increment':
        return t(($) => $.errors.leverageInvalidIncrement, {
          leverageIncrement,
        });
      case 'above_max':
        return t(($) => $.errors.leverageAboveMax);
      default:
        return undefined;
    }
  }, [leverageAmountError, leverageIncrement, t]);

  return (
    <CompactInput
      {...leverageAmountInputRegister}
      type="number"
      step={leverageIncrement}
      placeholder=""
      textAreaClassName="text-center"
      errorTooltipContent={leverageAmountErrorTooltipContent}
      onFocus={() => {
        setValue('leverageAmountSource', 'absolute');
      }}
      dataTestId="perp-leverage-dialog-leverage-amount-input"
    />
  );
}
