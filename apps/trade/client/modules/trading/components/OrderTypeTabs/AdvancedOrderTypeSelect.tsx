import {
  LabelTooltip,
  Select,
  TabTextButton,
  UpDownChevronIcon,
  useSelect,
} from '@nadohq/web-ui';
import { ADVANCED_ORDER_TYPES } from 'client/modules/trading/components/OrderTypeTabs/consts';
import { getOrderTypeDisabledData } from 'client/modules/trading/components/OrderTypeTabs/utils';
import { PlaceOrderType } from 'client/modules/trading/types/placeOrderTypes';
import { getPlaceOrderTypeLabel } from 'client/modules/trading/utils/getPlaceOrderTypeLabel';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  isIso: boolean | undefined;
  spotLeverageEnabled: boolean | undefined;
  selectedOrderType: PlaceOrderType;
  onSelectOrderTypeChange: (value: PlaceOrderType) => void;
}

export function AdvancedOrderTypeSelect({
  isIso,
  spotLeverageEnabled,
  selectedOrderType,
  onSelectOrderTypeChange,
}: Props) {
  const { t } = useTranslation();

  // Determine if currently selected type is one of the advanced options
  const isAdvancedMode = ADVANCED_ORDER_TYPES.includes(selectedOrderType);

  const options = useMemo(
    () =>
      ADVANCED_ORDER_TYPES.map((type) => ({
        value: type,
        label: getPlaceOrderTypeLabel(t, type),
      })),
    [t],
  );

  const {
    open,
    onOpenChange,
    value,
    onValueChange,
    selectOptions,
    selectedOption,
  } = useSelect({
    selectedValue: selectedOrderType,
    onSelectedValueChange: onSelectOrderTypeChange,
    options,
  });

  const selectedOptionLabel = selectedOption?.label ?? t(($) => $.advanced);

  return (
    <Select.Root
      open={open}
      onOpenChange={onOpenChange}
      value={value}
      onValueChange={onValueChange}
    >
      <Select.UnstyledTrigger asChild>
        <TabTextButton
          endIcon={<UpDownChevronIcon open={open} size={12} />}
          active={isAdvancedMode}
          className="font-medium"
          dataTestId={`order-type-advanced-option-${selectedOrderType}-button`}
        >
          {selectedOptionLabel}
        </TabTextButton>
      </Select.UnstyledTrigger>
      <Select.Options className="min-w-36">
        {selectOptions.map(
          ({ label, value: optionValue, original: orderType }) => {
            const { isDisabled, disabledTooltip } = getOrderTypeDisabledData({
              t,
              orderType,
              isIso,
              spotLeverageEnabled,
            });
            const shouldShowTooltip = isDisabled && disabledTooltip;

            return (
              <Select.Option
                key={optionValue}
                value={optionValue}
                disabled={isDisabled}
                data-testid={`order-type-advanced-option-${optionValue}-select-option`}
              >
                {shouldShowTooltip ? (
                  <LabelTooltip
                    noHelpCursor
                    label={disabledTooltip}
                    showInfoIcon
                  >
                    {label}
                  </LabelTooltip>
                ) : (
                  label
                )}
              </Select.Option>
            );
          },
        )}
      </Select.Options>
    </Select.Root>
  );
}
