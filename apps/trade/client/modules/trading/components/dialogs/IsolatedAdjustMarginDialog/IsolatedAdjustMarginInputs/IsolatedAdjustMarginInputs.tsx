import { Token } from '@nadohq/react-client';
import { InputValidatorFn } from '@nadohq/web-common';
import { CompactInput } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { EnableBorrowsSwitch } from 'client/components/EnableBorrowsSwitch';
import { InputProductSymbolWithIcon } from 'client/components/InputProductSymbolWithIcon';
import { useSanitizedNumericOnChange } from 'client/hooks/ui/form/useSanitizedNumericOnChange';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import { EstimatedCurrencyValueItem } from 'client/modules/collateral/components/EstimatedCurrencyValueItem';
import { IsolatedAdjustMarginInputsSummary } from 'client/modules/trading/components/dialogs/IsolatedAdjustMarginDialog/IsolatedAdjustMarginInputs/IsolatedAdjustMarginInputsSummary';
import {
  IsolatedAdjustMarginFormErrorType,
  IsolatedAdjustMarginFormValues,
} from 'client/modules/trading/hooks/useIsolatedAdjustMarginForm/types';
import { useIsolatedAdjustMarginAmountErrorTooltipContent } from 'client/modules/trading/hooks/useIsolatedAdjustMarginForm/useIsolatedAdjustMarginAmountErrorTooltipContent';
import { UseFormReturn } from 'react-hook-form';

interface Props {
  maxWithdrawable: BigNumber | undefined;
  enableBorrows: boolean;
  isAddMargin: boolean;
  primaryQuoteToken: Token;
  form: UseFormReturn<IsolatedAdjustMarginFormValues>;
  formError: IsolatedAdjustMarginFormErrorType | undefined;
  validAmount: BigNumber | undefined;
  validateAmount: InputValidatorFn<string, IsolatedAdjustMarginFormErrorType>;
  onEnableBorrowsChange(enabled: boolean): void;
  onMaxAmountClicked(): void;
}

export function IsolatedAdjustMarginInputs({
  maxWithdrawable,
  enableBorrows,
  isAddMargin,
  primaryQuoteToken,
  form,
  formError,
  validAmount,
  validateAmount,
  onEnableBorrowsChange,
  onMaxAmountClicked,
}: Props) {
  const amountErrorTooltipContent =
    useIsolatedAdjustMarginAmountErrorTooltipContent({
      formError,
    });

  const amountPlaceholder = useNumericInputPlaceholder({
    decimals: primaryQuoteToken.tokenDecimals,
  });

  const amountRegister = form.register('amount', {
    validate: validateAmount,
  });
  const handleChange = useSanitizedNumericOnChange(amountRegister.onChange);

  return (
    <div className="flex flex-col gap-y-1.5">
      {isAddMargin && (
        <EnableBorrowsSwitch
          className="text-xs"
          enableBorrows={enableBorrows}
          onEnableBorrowsChange={onEnableBorrowsChange}
        />
      )}
      <CompactInput
        {...amountRegister}
        placeholder={amountPlaceholder}
        onChange={handleChange}
        errorTooltipContent={amountErrorTooltipContent}
        startElement={
          <InputProductSymbolWithIcon
            productImageSrc={primaryQuoteToken.icon.asset}
            symbol={primaryQuoteToken.symbol}
          />
        }
        endElement={
          <EstimatedCurrencyValueItem estimatedValueUsd={validAmount} />
        }
      />
      <IsolatedAdjustMarginInputsSummary
        enableBorrows={enableBorrows}
        isAddMargin={isAddMargin}
        maxWithdrawable={maxWithdrawable}
        onMaxAmountClicked={onMaxAmountClicked}
        primaryQuoteSymbol={primaryQuoteToken.symbol}
      />
    </div>
  );
}
