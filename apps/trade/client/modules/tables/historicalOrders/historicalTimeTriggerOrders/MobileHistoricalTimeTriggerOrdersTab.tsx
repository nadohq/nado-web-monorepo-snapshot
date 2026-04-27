import { formatDurationMillis, TimeFormatSpecifier } from '@nadohq/web-ui';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { OrderDirectionLabel } from 'client/modules/tables/components/OrderDirectionLabel';
import { OrderFilledTotal } from 'client/modules/tables/components/OrderFilledTotal';
import { OrderIdCopyButton } from 'client/modules/tables/components/OrderIdCopyButton';
import { OrderIsReduceOnly } from 'client/modules/tables/components/OrderIsReduceOnly';
import { OrderMarketLabel } from 'client/modules/tables/components/OrderMarketLabel';
import { TriggerOrderStatusDisplay } from 'client/modules/tables/components/TriggerOrderStatusDisplay';
import { ViewTwapExecutionsButton } from 'client/modules/tables/components/ViewTwapExecutionsButton';
import { useHistoricalTimeTriggerOrdersTable } from 'client/modules/tables/historicalOrders/historicalTimeTriggerOrders/useHistoricalTimeTriggerOrdersTable';
import { MobileDataTabCard } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCard';
import { MobileDataTabCardDateTime } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCardDateTime';
import { MobileDataTabCards } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCards';
import { isReversalFillEvent } from 'client/utils/isReversalFillEvent';
import { useTranslation } from 'react-i18next';

interface Props {
  pageSize: number;
  productIds?: number[];
}

/**
 * Mobile component for displaying historical time-based trigger orders (TWAP orders) in card format
 */
export function MobileHistoricalTimeTriggerOrdersTab({
  pageSize,
  productIds,
}: Props) {
  const { t } = useTranslation();

  const { mappedData: data, isLoading } = useHistoricalTimeTriggerOrdersTable({
    pageSize,
    productIds,
  });

  return (
    <MobileDataTabCards
      emptyTablePlaceholderType="history_trigger_orders"
      isLoading={isLoading}
      hasData={!!data?.length}
    >
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
              <MobileDataTabCardDateTime
                timestampMillis={order.timeUpdatedMillis}
              />
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
                          productType={order.productType}
                          orderSide={order.orderSide}
                          isReduceOnly={order.isReduceOnly}
                          isReversal={isReversalFillEvent(
                            order.closedBaseSize,
                            order.filledBaseSize,
                          )}
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
                      label={t(($) => $.orderIdAbbrev)}
                      valueContent={
                        <OrderIdCopyButton orderId={order.digest} />
                      }
                    />
                    <ValueWithLabel.Vertical
                      sizeVariant="xs"
                      label={t(($) => $.status)}
                      valueClassName="items-center"
                      valueContent={
                        <>
                          <TriggerOrderStatusDisplay status={order.status} />
                          <ViewTwapExecutionsButton digest={order.digest} />
                        </>
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
                  label={t(($) => $.twapRuntime)}
                  valueContent={formatDurationMillis(
                    order.totalRuntimeInMillis,
                    {
                      formatSpecifier: TimeFormatSpecifier.HH_MM_SS,
                    },
                  )}
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
