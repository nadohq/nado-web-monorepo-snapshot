import { CancelOrderButton } from 'client/components/ActionButtons/CancelOrderButton';
import { DateTime } from 'client/components/DateTime';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { CancelOrdersButtons } from 'client/modules/tables/components/CancelOrdersButtons';
import { EditOrderFieldPopover } from 'client/modules/tables/components/EditOrderFieldPopover/EditOrderFieldPopover';
import { OrderDirectionLabel } from 'client/modules/tables/components/OrderDirectionLabel';
import { OrderFilledTotal } from 'client/modules/tables/components/OrderFilledTotal';
import { OrderIsReduceOnly } from 'client/modules/tables/components/OrderIsReduceOnly';
import { OrderMarketLabel } from 'client/modules/tables/components/OrderMarketLabel';
import { OrderTypeLabel } from 'client/modules/tables/components/OrderTypeLabel';
import { QuoteAmount } from 'client/modules/tables/components/QuoteAmount';
import { useOpenEngineOrdersTable } from 'client/modules/tables/openOrders/openEngineOrders/useOpenEngineOrdersTable';
import { MobileDataTabCard } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCard';
import { MobileDataTabCards } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCards';
import { ORDER_DISPLAY_TYPES } from 'client/modules/trading/consts/orderDisplayTypes';
import { useTranslation } from 'react-i18next';

interface Props {
  productIds?: number[];
}

export function MobileOpenEngineOrdersTab({ productIds }: Props) {
  const { t } = useTranslation();

  const { data, isLoading } = useOpenEngineOrdersTable(productIds);

  return (
    <MobileDataTabCards
      emptyTablePlaceholderType="open_limit_orders"
      isLoading={isLoading}
      hasData={!!data?.length}
    >
      <CancelOrdersButtons
        cancelOrdersFilter={{
          productIds,
          orderDisplayTypes: ORDER_DISPLAY_TYPES.engine,
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
                      label={t(($) => $.orderValue)}
                      valueContent={
                        <QuoteAmount
                          quoteAmount={order.totalQuoteSize}
                          isPrimaryQuote={order.isPrimaryQuote}
                          quoteSymbol={order.quoteSymbol}
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
                      label={t(($) => $.time)}
                      valueContent={
                        <DateTime
                          className="flex flex-col gap-1 text-xs"
                          timeClassName="text-text-tertiary"
                          timestampMillis={order.timePlacedMillis}
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
                      priceTriggerCriteria={undefined}
                    />
                  }
                />

                <ValueWithLabel.Vertical
                  sizeVariant="xs"
                  label={t(($) => $.orderPrice)}
                  tooltip={{ id: 'openEngineOrdersLimitPrice' }}
                  value={order.orderPrice}
                  numberFormatSpecifier={order.formatSpecifier.price}
                  valueEndElement={
                    <EditOrderFieldPopover
                      currentValue={order.orderPrice}
                      productId={order.productId}
                      digest={order.digest}
                      isTrigger={false}
                      field="orderPrice"
                      triggerClassName="text-xs"
                      orderPrice={undefined}
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
                  valueEndElement={
                    <EditOrderFieldPopover
                      currentValue={order.totalBaseAmount}
                      productId={order.productId}
                      digest={order.digest}
                      isTrigger={false}
                      field="amount"
                      triggerClassName="text-xs"
                      orderPrice={order.orderPrice}
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
