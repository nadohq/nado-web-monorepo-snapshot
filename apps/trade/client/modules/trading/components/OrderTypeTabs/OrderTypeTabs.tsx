import { AdvancedOrderTypeSelect } from 'client/modules/trading/components/OrderTypeTabs/AdvancedOrderTypeSelect';
import { BasicOrderTypeTabButtons } from 'client/modules/trading/components/OrderTypeTabs/BasicOrderTypeTabButtons';
import { OrderTypeInfoTooltip } from 'client/modules/trading/components/OrderTypeTabs/OrderTypeInfoTooltip';

import { PlaceOrderType } from 'client/modules/trading/types/placeOrderTypes';
import { useCallback } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

interface Props {
  /**
   * Used to determine if advanced order types (stop/stop-limit) should be disabled.
   */
  isIso?: boolean;
  /**
   * Whether spot leverage/margin is enabled. Used to determine if TWAP should be disabled.
   */
  spotLeverageEnabled?: boolean;
}

export function OrderTypeTabs({ isIso, spotLeverageEnabled }: Props) {
  const { setValue, control } = useFormContext<{
    orderType: PlaceOrderType;
  }>();
  const selectedOrderType = useWatch({
    control,
    name: 'orderType',
  });

  // Updates orderType field when a price type is selected
  const handleOrderTypeChange = useCallback(
    (type: PlaceOrderType) => {
      setValue('orderType', type);
    },
    [setValue],
  );

  return (
    <div className="flex items-center gap-x-4 text-sm">
      {/* Basic order type tab buttons */}
      <BasicOrderTypeTabButtons
        isIso={isIso}
        spotLeverageEnabled={spotLeverageEnabled}
        handleOrderTypeChange={handleOrderTypeChange}
        selectedOrderType={selectedOrderType}
      />
      {/* Advanced dropdown */}
      <AdvancedOrderTypeSelect
        isIso={isIso}
        spotLeverageEnabled={spotLeverageEnabled}
        selectedOrderType={selectedOrderType}
        onSelectOrderTypeChange={handleOrderTypeChange}
      />
      {/* Info tooltip aligned to the right */}
      <OrderTypeInfoTooltip
        className="ml-auto"
        selectedOrderType={selectedOrderType}
      />
    </div>
  );
}
