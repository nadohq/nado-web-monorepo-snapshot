import { formatNumber } from '@nadohq/react-client';
import { CancelOrderButton } from 'client/components/ActionButtons/CancelOrderButton';
import { AmountWithSymbol } from 'client/components/AmountWithSymbol';
import { DateTime } from 'client/components/DateTime';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { CancelOrdersButtons } from 'client/modules/tables/components/CancelOrdersButtons';
import { EditOrderFieldPopover } from 'client/modules/tables/components/EditOrderFieldPopover/EditOrderFieldPopover';
import { OrderDirectionLabel } from 'client/modules/tables/components/OrderDirectionLabel';
import { OrderIsReduceOnly } from 'client/modules/tables/components/OrderIsReduceOnly';
import { OrderMarketLabel } from 'client/modules/tables/components/OrderMarketLabel';
import { OrderPrice } from 'client/modules/tables/components/OrderPrice';
import { OrderPriceTriggerCondition } from 'client/modules/tables/components/OrderPriceTriggerCondition';
import { OrderTypeLabel } from 'client/modules/tables/components/OrderTypeLabel';
import { QuoteAmount } from 'client/modules/tables/components/QuoteAmount';
import { useOpenPriceTriggerOrdersTable } from 'client/modules/tables/openOrders/openPriceTriggerOrders/useOpenPriceTriggerOrdersTable';
import { MobileDataTabCard } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCard';
import { MobileDataTabCards } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCards';
import { PriceTriggerOrderDisplayType } from 'client/modules/trading/types/orderDisplayTypes';
import { useTranslation } from 'react-i18next';

interface Props {
  productIds?: number[];
  triggerOrderDisplayTypes?: PriceTriggerOrderDisplayType[];
}

export function MobileOpenPriceTriggerOrdersTab({
  productIds,
  triggerOrderDisplayTypes,
}: Props) {
  const { t } = useTranslation();

  const { data, isLoading } = useOpenPriceTriggerOrdersTable({
    productIds,
    triggerOrderDisplayTypes,
  });

  return (
    <MobileDataTabCards
      emptyTablePlaceholderType="open_price_trigger_orders"
      isLoading={isLoading}
      hasData={!!data?.length}
    >
      <CancelOrdersButtons
        cancelOrdersFilter={{
          productIds,
          orderDisplayTypes: triggerOrderDisplayTypes,
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
                      label={t(($) => $.orderPrice)}
                      valueContent={
                        <OrderPrice
                          isMarket={order.isMarket}
                          orderPrice={order.orderPrice}
                          formatSpecifier={order.formatSpecifier.price}
                        />
                      }
                    />
                    <ValueWithLabel.Vertical
                      sizeVariant="xs"
                      label={t(($) => $.orderValue)}
                      valueContent={
                        order.isCloseEntirePosition ? (
                          '-'
                        ) : (
                          <QuoteAmount
                            quoteAmount={order.totalQuoteSize}
                            isPrimaryQuote={order.isPrimaryQuote}
                            quoteSymbol={order.quoteSymbol}
                          />
                        )
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
                  label={t(($) => $.direction)}
                  valueContent={
                    <OrderDirectionLabel
                      productType={order.productType}
                      orderSide={order.orderSide}
                      isReduceOnly={order.isReduceOnly}
                    />
                  }
                />
                <ValueWithLabel.Vertical
                  sizeVariant="xs"
                  label={t(($) => $.orderType)}
                  valueContent={
                    <OrderTypeLabel
                      orderAppendix={order.orderAppendix}
                      orderSide={order.orderSide}
                      priceTriggerCriteria={order.priceTriggerCriteria}
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
                  label={t(($) => $.orderAmount)}
                  valueContent={
                    order.isCloseEntirePosition ? (
                      t(($) => $.entirePosition)
                    ) : (
                      <AmountWithSymbol
                        formattedAmount={formatNumber(order.totalBaseSize, {
                          formatSpecifier: order.formatSpecifier.size,
                        })}
                        symbol={order.baseSymbol}
                      />
                    )
                  }
                  valueEndElement={
                    order.isCloseEntirePosition ? undefined : (
                      <EditOrderFieldPopover
                        currentValue={order.totalBaseAmount}
                        productId={order.productId}
                        digest={order.digest}
                        isTrigger={true}
                        field="amount"
                        triggerClassName="text-xs"
                        orderPrice={order.orderPrice}
                      />
                    )
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
