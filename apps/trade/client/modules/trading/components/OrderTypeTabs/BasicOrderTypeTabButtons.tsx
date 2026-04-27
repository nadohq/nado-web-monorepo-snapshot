import { LabelTooltip, TabTextButton } from '@nadohq/web-ui';
import { BASIC_ORDER_TYPES } from 'client/modules/trading/components/OrderTypeTabs/consts';
import { getOrderTypeDisabledData } from 'client/modules/trading/components/OrderTypeTabs/utils';
import { PlaceOrderType } from 'client/modules/trading/types/placeOrderTypes';
import { getPlaceOrderTypeLabel } from 'client/modules/trading/utils/getPlaceOrderTypeLabel';
import { useTranslation } from 'react-i18next';

interface Props {
  handleOrderTypeChange: (orderType: PlaceOrderType) => void;
  selectedOrderType: PlaceOrderType;
  isIso: boolean | undefined;
  spotLeverageEnabled: boolean | undefined;
}

export function BasicOrderTypeTabButtons({
  handleOrderTypeChange,
  selectedOrderType,
  isIso,
  spotLeverageEnabled,
}: Props) {
  const { t } = useTranslation();

  return BASIC_ORDER_TYPES.map((orderType) => {
    const buttonLabel = getPlaceOrderTypeLabel(t, orderType);
    const { isDisabled, disabledTooltip } = getOrderTypeDisabledData({
      orderType,
      isIso,
      spotLeverageEnabled,
      t,
    });

    const shouldShowTooltip = isDisabled && disabledTooltip;
    const isActive = selectedOrderType === orderType;

    return (
      <TabTextButton
        dataTestId={`order-type-basic-option-${orderType}-button`}
        key={orderType}
        onClick={() => handleOrderTypeChange(orderType)}
        disabled={isDisabled}
        active={isActive}
        className="font-medium"
      >
        {shouldShowTooltip ? (
          <LabelTooltip noHelpCursor label={disabledTooltip} showInfoIcon>
            {buttonLabel}
          </LabelTooltip>
        ) : (
          buttonLabel
        )}
      </TabTextButton>
    );
  });
}
