import { joinClassNames } from '@nadohq/web-common';
import { CompactInput, Icons, TextButton } from '@nadohq/web-ui';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import { UseOrderSlippageSettingForType } from 'client/modules/settings/components/OrderSlippageSettings/hooks/useOrderSlippageFormForType';
import { useOrderSlippageValueErrorTooltipContent } from 'client/modules/settings/components/OrderSlippageSettings/hooks/useOrderSlippageValueErrorTooltipContent';
import { SettingWithLabel } from 'client/modules/settings/components/SettingWithLabel';
import { SETTINGS_SEGMENTED_CONTROL_CONTAINER_CLASSNAMES } from 'client/modules/settings/consts';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import { useTranslation } from 'react-i18next';

interface Props {
  formForType: UseOrderSlippageSettingForType;
}

export function OrderSlippageFormForType({ formForType }: Props) {
  const { t } = useTranslation();

  const {
    formError,
    form,
    isLowSlippage,
    slippageType,
    validateSlippageInput,
    save,
    resetToDefault,
  } = formForType;

  const label = {
    market: t(($) => $.orderTypes.market),
    stopMarket: t(($) => $.orderTypes.stopMarket),
    takeProfit: t(($) => $.orderTypes.takeProfit),
    stopLoss: t(($) => $.orderTypes.stopLoss),
  }[slippageType];

  const valueErrorTooltipContent = useOrderSlippageValueErrorTooltipContent({
    formError,
  });

  const valuePlaceholder = useNumericInputPlaceholder();

  const labelContent = (
    <span className="text-text-tertiary flex items-center gap-x-1">
      {label}
      {isLowSlippage && (
        <DefinitionTooltip
          definitionId="settingsLowSlippageWarning"
          decoration="none"
        >
          <Icons.ExclamationMark
            className="text-warning bg-warning-muted rounded-full"
            size={16}
          />
        </DefinitionTooltip>
      )}
    </span>
  );

  const controlContent = (
    <div
      className={joinClassNames(
        'flex items-center',
        SETTINGS_SEGMENTED_CONTROL_CONTAINER_CLASSNAMES.width,
      )}
    >
      {/*Input*/}
      <CompactInput
        {...form.register('value', {
          valueAsNumber: true,
          validate: validateSlippageInput,
          onBlur: save,
        })}
        placeholder={valuePlaceholder}
        type="number"
        inputMode="decimal"
        errorTooltipContent={valueErrorTooltipContent}
        endElement="%"
        inputContainerClassName="h-8"
        textAreaClassName="text-left text-sm"
      />
      {/*Reset*/}
      <TextButton
        colorVariant="secondary"
        endIcon={<Icons.ArrowClockwise size={16} />}
        className="self-stretch px-1"
        onClick={resetToDefault}
      />
    </div>
  );

  return (
    <SettingWithLabel
      labelContent={labelContent}
      controlContent={controlContent}
    />
  );
}
