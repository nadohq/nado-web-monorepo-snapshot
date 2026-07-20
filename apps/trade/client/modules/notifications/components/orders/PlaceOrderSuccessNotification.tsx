import { removeDecimals, toBigNumber } from '@nadohq/client';
import {
  formatNumber,
  getMarketPriceFormatSpecifier,
  getMarketSizeFormatSpecifier,
} from '@nadohq/react-client';
import { ActionToast } from 'client/components/Toast/ActionToast/ActionToast';
import { ToastProps } from 'client/components/Toast/types';
import {
  ExecuteMultiLimitOrderParams,
  ExecutePlacePriceTriggerOrderParams,
} from 'client/hooks/execute/placeOrder/types';
import { NotificationMarketDisplay } from 'client/modules/notifications/components/NotificationMarketDisplay';
import { NotificationOrderInfoDisplay } from 'client/modules/notifications/components/NotificationOrderInfoDisplay';
import { OrderSuccessIcon } from 'client/modules/notifications/components/OrderSuccessIcon';
import { PlaceOrderNotificationData } from 'client/modules/notifications/types';
import { PRICE_TRIGGER_PLACE_ORDER_TYPES } from 'client/modules/trading/types/placeOrderTypes';
import { getPlaceOrderTypeLabel } from 'client/modules/trading/utils/getPlaceOrderTypeLabel';
import { useGetXStocksExchangeRate } from 'client/modules/xStocks/hooks/useGetXStocksExchangeRate';
import { first, last } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface PlaceOrderSuccessProps extends ToastProps {
  orderData: PlaceOrderNotificationData;
}

export function PlaceOrderSuccessNotification({
  orderData,
  ttl,
  onDismiss,
}: PlaceOrderSuccessProps) {
  const { t } = useTranslation();

  const { metadata, orderType, placeOrderParams, orderMarketType } = orderData;
  const decimalAdjustedAmount = removeDecimals(
    toBigNumber(placeOrderParams.amount),
  );

  const { getExchangeRate } = useGetXStocksExchangeRate();
  const exchangeRate = useMemo(() => {
    return getExchangeRate(placeOrderParams.productId);
  }, [getExchangeRate, placeOrderParams.productId]);

  const isPriceTriggerOrder =
    PRICE_TRIGGER_PLACE_ORDER_TYPES.includes(orderType);

  const price = (() => {
    if (isPriceTriggerOrder) {
      return (placeOrderParams as ExecutePlacePriceTriggerOrderParams)
        .priceTriggerCriteria.triggerPrice;
    }

    return placeOrderParams.price;
  })();

  const formattedAmount = formatNumber(decimalAdjustedAmount.abs(), {
    formatSpecifier: getMarketSizeFormatSpecifier({
      sizeIncrement: metadata.sizeIncrement,
      exchangeRate,
    }),
  });

  const showMarketPrice = orderType === 'twap' || orderType === 'market';

  const formattedPrice = useMemo(() => {
    if (showMarketPrice) {
      return t(($) => $.market);
    }

    const formatSpecifier = getMarketPriceFormatSpecifier({
      priceIncrement: metadata.priceIncrement,
      exchangeRate,
    });

    // For scaled orders, show price range from start to end
    if (orderType === 'multi_limit') {
      const multiLimitParams = placeOrderParams as ExecuteMultiLimitOrderParams;

      // Orders are in start → end price order
      const startPrice = first(multiLimitParams.orders)?.price;
      const endPrice = last(multiLimitParams.orders)?.price;

      return t(($) => $.priceRangeValue, {
        startPrice: formatNumber(startPrice, { formatSpecifier }),
        endPrice: formatNumber(endPrice, { formatSpecifier }),
      });
    }

    return `${formatNumber(price, {
      formatSpecifier,
    })}`;
  }, [
    showMarketPrice,
    metadata.priceIncrement,
    exchangeRate,
    orderType,
    price,
    t,
    placeOrderParams,
  ]);

  const sideLabel = decimalAdjustedAmount.isPositive()
    ? t(($) => $.buy)
    : t(($) => $.sell);

  return (
    <ActionToast.Container>
      <ActionToast.TextHeader
        variant="success"
        icon={OrderSuccessIcon}
        onDismiss={onDismiss}
      >
        {t(($) => $.notifications.orderPlaced, {
          orderType: getPlaceOrderTypeLabel(t, orderType),
        })}
      </ActionToast.TextHeader>
      <ActionToast.Separator variant="success" ttl={ttl} />
      <ActionToast.Body variant="success" className="flex flex-col gap-y-2">
        <NotificationMarketDisplay
          marketIcon={metadata.icon.asset}
          marketName={metadata.marketName}
          productType={orderMarketType}
        />
        <NotificationOrderInfoDisplay
          sideLabel={sideLabel}
          amount={formattedAmount}
          price={formattedPrice}
        />
      </ActionToast.Body>
    </ActionToast.Container>
  );
}
