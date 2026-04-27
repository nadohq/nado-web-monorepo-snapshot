import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { OrderDirectionLabel } from 'client/modules/tables/components/OrderDirectionLabel';
import { OrderFilledPrice } from 'client/modules/tables/components/OrderFilledPrice';
import { OrderFilledQuoteValue } from 'client/modules/tables/components/OrderFilledQuoteValue';
import { OrderFilledTotal } from 'client/modules/tables/components/OrderFilledTotal';
import { OrderIdCopyButton } from 'client/modules/tables/components/OrderIdCopyButton';
import { OrderIsReduceOnly } from 'client/modules/tables/components/OrderIsReduceOnly';
import { OrderMarketLabel } from 'client/modules/tables/components/OrderMarketLabel';
import { OrderTypeLabel } from 'client/modules/tables/components/OrderTypeLabel';
import { PerpPnlShareButton } from 'client/modules/tables/components/PerpPnlShareButton';
import { useHistoricalEngineOrdersTable } from 'client/modules/tables/historicalOrders/historicalEngineOrders/useHistoricalEngineOrdersTable';
import { MobileDataTabCard } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCard';
import { MobileDataTabCardDateTime } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCardDateTime';
import { MobileDataTabCards } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCards';
import { isReversalFillEvent } from 'client/utils/isReversalFillEvent';
import { useTranslation } from 'react-i18next';

interface Props {
  pageSize: number;
  productIds?: number[];
}

export function MobileHistoricalEngineOrdersTab({
  pageSize,
  productIds,
}: Props) {
  const { t } = useTranslation();

  const { mappedData: data, isLoading } = useHistoricalEngineOrdersTable({
    pageSize,
    productIds,
  });

  return (
    <MobileDataTabCards
      emptyTablePlaceholderType="history_orders"
      isLoading={isLoading}
      hasData={!!data?.length}
    >
      {data?.map((order) => {
        const {
          productId,
          isPerp,
          filledAvgPrice: exitPrice,
          marginModeType,
          isoLeverage,
          realizedPnl,
          preClosePositionAmount,
          entryPrice,
        } = order;
        const isPerpWithRealizedPnl = isPerp && realizedPnl;

        return (
          <MobileDataTabCard.Container key={order.digest}>
            <MobileDataTabCard.Header className="product-label-border-container">
              <OrderMarketLabel
                productId={order.productId}
                marketName={order.productName}
                orderSide={order.orderSide}
                isIso={order.isIsolated}
              />
              <div className="flex items-center gap-x-2">
                {isPerpWithRealizedPnl && (
                  <PerpPnlShareButton
                    productId={productId}
                    positionAmount={preClosePositionAmount}
                    pnlFrac={realizedPnl.pnlFrac}
                    pnlUsd={realizedPnl.pnlUsd}
                    entryPrice={entryPrice}
                    referencePrice={exitPrice}
                    referencePriceLabel={t(($) => $.exitPrice)}
                    marginModeType={marginModeType}
                    isoLeverage={isoLeverage}
                  />
                )}
                <MobileDataTabCardDateTime
                  timestampMillis={order.lastFillTimeMillis}
                />
              </div>
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
                      label={t(($) => $.status)}
                      valueContent={order.statusText}
                    />
                    <ValueWithLabel.Vertical
                      sizeVariant="xs"
                      label={t(($) => $.fees)}
                      valueContent={formatNumber(order.tradeFeeQuote, {
                        formatSpecifier:
                          PresetNumberFormatSpecifier.CURRENCY_UPTO_3DP,
                      })}
                    />
                    <ValueWithLabel.Vertical
                      sizeVariant="xs"
                      label={t(($) => $.orderIdAbbrev)}
                      valueContent={
                        <OrderIdCopyButton orderId={order.digest} />
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
                      orderSide={order.orderSide}
                      priceTriggerCriteria={undefined}
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
