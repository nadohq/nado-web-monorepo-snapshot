import { Icons, LabelTooltip } from '@nadohq/web-ui';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { OrderDirectionLabel } from 'client/modules/tables/components/OrderDirectionLabel';
import { OrderFilledPrice } from 'client/modules/tables/components/OrderFilledPrice';
import { OrderFilledQuoteValue } from 'client/modules/tables/components/OrderFilledQuoteValue';
import { OrderFilledTotal } from 'client/modules/tables/components/OrderFilledTotal';
import { OrderIdCopyButton } from 'client/modules/tables/components/OrderIdCopyButton';
import { OrderIsReduceOnly } from 'client/modules/tables/components/OrderIsReduceOnly';
import { OrderMarketLabel } from 'client/modules/tables/components/OrderMarketLabel';
import { OrderPriceTriggerCondition } from 'client/modules/tables/components/OrderPriceTriggerCondition';
import { OrderTypeLabel } from 'client/modules/tables/components/OrderTypeLabel';
import { useHistoricalPriceTriggerOrdersTable } from 'client/modules/tables/historicalOrders/historicalPriceTriggerOrders/useHistoricalPriceTriggerOrdersTable';
import { MobileDataTabCard } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCard';
import { MobileDataTabCardDateTime } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCardDateTime';
import { MobileDataTabCards } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCards';
import { isReversalFillEvent } from 'client/utils/isReversalFillEvent';
import { useTranslation } from 'react-i18next';

interface Props {
  pageSize: number;
  reduceOnly: boolean;
  productIds?: number[];
}

export function MobileHistoricalPriceTriggerOrdersTab({
  pageSize,
  reduceOnly,
  productIds,
}: Props) {
  const { t } = useTranslation();

  const { mappedData: data, isLoading } = useHistoricalPriceTriggerOrdersTable({
    pageSize,
    productIds,
    reduceOnly,
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
                      label={t(($) => $.filledOrderValue)}
                      valueContent={
                        <OrderFilledQuoteValue
                          filledQuoteSize={order.filledQuoteSize}
                          totalQuoteSize={order.totalQuoteSize}
                          isPrimaryQuote={order.isPrimaryQuote}
                          quoteSymbol={order.quoteSymbol}
                          isMarket={order.isMarket}
                          isCloseEntirePosition={order.isCloseEntirePosition}
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
                      valueContent={
                        order.status.detailsText ? (
                          <LabelTooltip
                            label={order.status.detailsText}
                            noHelpCursor
                          >
                            <span className="flex items-center gap-1">
                              {order.status.statusText} <Icons.Info />
                            </span>
                          </LabelTooltip>
                        ) : (
                          order.status.statusText
                        )
                      }
                    />
                  </>
                }
              >
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
                  label={t(($) => $.orderType)}
                  valueContent={
                    <OrderTypeLabel
                      orderAppendix={order.orderAppendix}
                      priceTriggerCriteria={order.priceTriggerCriteria}
                      orderSide={order.orderSide}
                    />
                  }
                />
                <ValueWithLabel.Vertical
                  sizeVariant="xs"
                  label={t(($) => $.avgOrderPrice)}
                  valueContent={
                    <OrderFilledPrice
                      filledAvgPrice={order.filledAvgPrice}
                      orderPrice={order.orderPrice}
                      isMarket={order.isMarket}
                      formatSpecifier={order.formatSpecifier.price}
                    />
                  }
                />
                <ValueWithLabel.Vertical
                  sizeVariant="xs"
                  label={t(($) => $.triggerCondition)}
                  valueContent={
                    <OrderPriceTriggerCondition
                      className="gap-1"
                      priceTriggerCriteria={order.priceTriggerCriteria}
                      formatSpecifier={order.formatSpecifier.price}
                    />
                  }
                />
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
              </MobileDataTabCard.Cols2>
            </MobileDataTabCard.Body>
          </MobileDataTabCard.Container>
        );
      })}
    </MobileDataTabCards>
  );
}
