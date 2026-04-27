import { PlaceOrderType } from 'client/modules/trading/types/placeOrderTypes';
import type { TFunction } from 'i18next';

interface Params {
  t: TFunction;
  isIso: boolean | undefined;
  spotLeverageEnabled: boolean | undefined;
  orderType: PlaceOrderType;
}

/**
 * Returns data about whether an order type is disabled and a tooltip to display if it is.
 * @param isIso Whether the margin mode is isolated
 * @param spotLeverageEnabled Whether spot leverage/margin is enabled
 * @param orderType The order type to check
 * @returns Data about whether the order type is disabled and a tooltip to display if it is
 */
export function getOrderTypeDisabledData({
  t,
  isIso,
  spotLeverageEnabled,
  orderType,
}: Params): {
  isDisabled: boolean;
  disabledTooltip?: string;
} {
  switch (orderType) {
    case 'twap':
      if (isIso) {
        return {
          isDisabled: true,
          disabledTooltip: t(
            ($) => $.tooltips.twapOrdersNotAvailableForIsolated,
          ),
        };
      }

      if (spotLeverageEnabled === false) {
        return {
          isDisabled: true,
          disabledTooltip: t(($) => $.tooltips.twapOrdersRequireSpotMargin),
        };
      }
      return { isDisabled: false, disabledTooltip: undefined };
    case 'stop_market':
    case 'stop_limit':
    case 'market':
    case 'limit':
    case 'multi_limit':
      return { isDisabled: false, disabledTooltip: undefined };
  }
}
