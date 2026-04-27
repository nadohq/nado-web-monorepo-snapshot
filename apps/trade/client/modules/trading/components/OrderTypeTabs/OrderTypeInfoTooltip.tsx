import { WithClassnames } from '@nadohq/web-common';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import { DefinitionTooltipID } from 'client/modules/tooltips/DefinitionTooltip/definitionTooltipConfig';

import { PlaceOrderType } from 'client/modules/trading/types/placeOrderTypes';

const ORDER_TYPE_TOOLTIP_DEFINITION_IDS: Record<
  PlaceOrderType,
  DefinitionTooltipID
> = {
  market: 'tradingOrderTypeMarket',
  limit: 'tradingOrderTypeLimit',
  stop_market: 'tradingOrderTypeStopMarket',
  stop_limit: 'tradingOrderTypeStopLimit',
  twap: 'tradingOrderTypeTwap',
  multi_limit: 'tradingOrderTypeScaledOrder',
};

interface Props extends WithClassnames {
  selectedOrderType: PlaceOrderType;
}

export function OrderTypeInfoTooltip({ className, selectedOrderType }: Props) {
  return (
    <DefinitionTooltip
      contentWrapperClassName={className}
      definitionId={ORDER_TYPE_TOOLTIP_DEFINITION_IDS[selectedOrderType]}
      decoration={{
        icon: true,
      }}
    />
  );
}
