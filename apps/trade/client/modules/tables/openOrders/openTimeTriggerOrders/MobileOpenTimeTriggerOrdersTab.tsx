import { formatDurationMillis, TimeFormatSpecifier } from '@nadohq/web-ui';
import { CancelOrderButton } from 'client/components/ActionButtons/CancelOrderButton';
import { DateTime } from 'client/components/DateTime';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { CancelOrdersButtons } from 'client/modules/tables/components/CancelOrdersButtons';
import { OrderDirectionLabel } from 'client/modules/tables/components/OrderDirectionLabel';
import { OrderFilledTotal } from 'client/modules/tables/components/OrderFilledTotal';
import { OrderIsReduceOnly } from 'client/modules/tables/components/OrderIsReduceOnly';
import { OrderMarketLabel } from 'client/modules/tables/components/OrderMarketLabel';
import { TriggerOrderStatusDisplay } from 'client/modules/tables/components/TriggerOrderStatusDisplay';
import { ViewTwapExecutionsButton } from 'client/modules/tables/components/ViewTwapExecutionsButton';
import { useOpenTimeTriggerOrdersTable } from 'client/modules/tables/openOrders/openTimeTriggerOrders/useOpenTimeTriggerOrdersTable';
import { MobileDataTabCard } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCard';
import { MobileDataTabCards } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCards';
import { TwapOrderRuntimeDisplay } from 'client/modules/trading/components/twap/TwapOrderRuntimeDisplay';
import { ORDER_DISPLAY_TYPES } from 'client/modules/trading/consts/orderDisplayTypes';
import { useTranslation } from 'react-i18next';

interface Props {
  productIds?: number[];
}

/**
 * Mobile component for displaying time-based trigger orders (TWAP orders) in card format
 */
export function MobileOpenTimeTriggerOrdersTab({ productIds }: Props) {
  const { t } = useTranslation();

  const { data, isLoading } = useOpenTimeTriggerOrdersTable({
    productIds,
  });

  return (
    <MobileDataTabCards
      emptyTablePlaceholderType="open_time_trigger_orders"
      isLoading={isLoading}
      hasData={!!data?.length}
    >
      <CancelOrdersButtons
        cancelOrdersFilter={{
          productIds,
          orderDisplayTypes: ORDER_DISPLAY_TYPES.twap,
        }}
      />
      {data?.map((order) => {
        return (
          <MobileDataTabCard.Container key={order.digest}>
            <MobileDataTabCard.Header className="product-label-border-container">
              <OrderMarketLabel
                productId={order.productId}
                marketName={order.productName}
                orderSide={order.orderSide}
                isIso={order.isIsolated}
              />
              <CancelOrderButton order={order.orderForCancellation} />
            </MobileDataTabCard.Header>
            <MobileDataTabCard.Body>
              <MobileDataTabCard.Cols2
                collapsibleContent={
                  <>
                    <ValueWithLabel.Vertical
                      sizeVariant="xs"
                      label={t(($) => $.direction)}
                      valueContent={
                        <OrderDirectionLabel
                          orderSide={order.orderSide}
                          productType={order.productType}
                          isReduceOnly={order.isReduceOnly}
                        />
                      }
                    />
                    <ValueWithLabel.Vertical
                      sizeVariant="xs"
                      label={t(($) => $.reduceOnly)}
                      valueContent={
                        <OrderIsReduceOnly isReduceOnly={order.isReduceOnly} />
                      }
                    />
                    <ValueWithLabel.Vertical
                      sizeVariant="xs"
                      label={t(($) => $.status)}
                      valueClassName="items-center"
                      valueContent={
                        <>
                          <TriggerOrderStatusDisplay status={order.status} />
                          <ViewTwapExecutionsButton
                            digest={order.orderForCancellation.digest}
                          />
                        </>
                      }
                    />
                    <ValueWithLabel.Vertical
                      sizeVariant="xs"
                      label={t(($) => $.time)}
                      valueContent={
                        <DateTime
                          timestampMillis={order.timePlacedMillis}
                          className="flex flex-col gap-1"
                          timeClassName="text-text-tertiary"
                        />
                      }
                    />
                  </>
                }
              >
                <ValueWithLabel.Vertical
                  sizeVariant="xs"
                  label={t(($) => $.filledTotal)}
                  valueContent={
                    <OrderFilledTotal
                      filledBaseSize={order.filledBaseSize}
                      totalBaseSize={order.totalBaseSize}
                      baseSymbol={order.baseSymbol}
                      formatSpecifier={order.formatSpecifier.size}
                      isCloseEntirePosition={order.isCloseEntirePosition}
                    />
                  }
                />
                <ValueWithLabel.Vertical
                  sizeVariant="xs"
                  label={t(($) => $.runtimeTotal)}
                  valueContent={
                    <TwapOrderRuntimeDisplay
                      timePlacedMillis={order.timePlacedMillis}
                      totalRuntimeInMillis={order.totalRuntimeInMillis}
                    />
                  }
                />
                <ValueWithLabel.Vertical
                  sizeVariant="xs"
                  label={t(($) => $.avgFilledPrice)}
                  value={order.filledAvgPrice}
                  numberFormatSpecifier={order.formatSpecifier.price}
                />
                <ValueWithLabel.Vertical
                  sizeVariant="xs"
                  label={t(($) => $.frequency)}
                  valueContent={formatDurationMillis(order.frequencyInMillis, {
                    formatSpecifier: TimeFormatSpecifier.HH_MM_SS,
                  })}
                />
              </MobileDataTabCard.Cols2>
            </MobileDataTabCard.Body>
          </MobileDataTabCard.Container>
        );
      })}
    </MobileDataTabCards>
  );
}
