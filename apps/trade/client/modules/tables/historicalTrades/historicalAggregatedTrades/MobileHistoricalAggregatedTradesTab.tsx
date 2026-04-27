import { PnlValueWithPercentage } from 'client/components/PnlValueWithPercentage';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { OrderDirectionLabel } from 'client/modules/tables/components/OrderDirectionLabel';
import { OrderMarketLabel } from 'client/modules/tables/components/OrderMarketLabel';
import { PerpPnlShareButton } from 'client/modules/tables/components/PerpPnlShareButton';
import { QuoteAmount } from 'client/modules/tables/components/QuoteAmount';
import { useHistoricalAggregatedTradesTable } from 'client/modules/tables/historicalTrades/historicalAggregatedTrades/useHistoricalAggregatedTradesTable';
import { MobileDataTabCard } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCard';
import { MobileDataTabCardDateTime } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCardDateTime';
import { MobileDataTabCards } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCards';
import { isReversalFillEvent } from 'client/utils/isReversalFillEvent';
import { useTranslation } from 'react-i18next';

interface Props {
  pageSize: number;
  productIds?: number[];
}

export function MobileHistoricalAggregatedTradesTab({
  pageSize,
  productIds,
}: Props) {
  const { t } = useTranslation();

  const { mappedData: data, isLoading } = useHistoricalAggregatedTradesTable({
    pageSize,
    productIds,
  });

  return (
    <MobileDataTabCards
      emptyTablePlaceholderType="history_trades"
      isLoading={isLoading}
      hasData={!!data?.length}
    >
      {data?.map((item, index) => {
        const {
          productId,
          isPerp,
          filledAvgPrice: exitPrice,
          marginModeType,
          isoLeverage,
          realizedPnl,
          preClosePositionAmount,
          entryPrice,
        } = item;
        const isPerpWithRealizedPnl = isPerp && realizedPnl;

        return (
          <MobileDataTabCard.Container key={index}>
            <MobileDataTabCard.Header className="product-label-border-container">
              <OrderMarketLabel
                productId={item.productId}
                marketName={item.productName}
                orderSide={item.orderSide}
                isIso={item.isIsolated}
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
                  timestampMillis={item.lastFillTimeMillis}
                />
              </div>
            </MobileDataTabCard.Header>

            <MobileDataTabCard.Body>
              <div>
                <MobileDataTabCard.Cols2
                  collapsibleContent={
                    <>
                      <ValueWithLabel.Vertical
                        sizeVariant="xs"
                        label={t(($) => $.tradeValue)}
                        valueContent={
                          <QuoteAmount
                            quoteAmount={item.filledQuoteSize}
                            isPrimaryQuote={item.isPrimaryQuote}
                            quoteSymbol={item.quoteSymbol}
                          />
                        }
                      />

                      <ValueWithLabel.Vertical
                        sizeVariant="xs"
                        label={t(($) => $.fee)}
                        valueContent={
                          <QuoteAmount
                            quoteAmount={item.tradeFeeQuote}
                            isPrimaryQuote={item.isPrimaryQuote}
                            quoteSymbol={item.quoteSymbol}
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
                        productType={item.productType}
                        orderSide={item.orderSide}
                        isReduceOnly={item.isReduceOnly}
                        isReversal={isReversalFillEvent(
                          item.closedBaseSize,
                          item.filledBaseSize,
                        )}
                      />
                    }
                  />
                  <ValueWithLabel.Vertical
                    sizeVariant="xs"
                    label={t(($) => $.realizedPnl)}
                    tooltip={{ id: 'realizedPnl' }}
                    valueContent={
                      <PnlValueWithPercentage
                        className="flex flex-col gap-y-1.5"
                        pnlUsd={realizedPnl?.pnlUsd}
                        pnlFrac={realizedPnl?.pnlFrac}
                      />
                    }
                  />
                  <ValueWithLabel.Vertical
                    sizeVariant="xs"
                    label={t(($) => $.size)}
                    value={item.filledBaseSize}
                    valueEndElement={item.baseSymbol}
                    numberFormatSpecifier={item.formatSpecifier.size}
                  />
                  <ValueWithLabel.Vertical
                    sizeVariant="xs"
                    label={t(($) => $.price)}
                    value={item.filledAvgPrice}
                    numberFormatSpecifier={item.formatSpecifier.price}
                  />
                </MobileDataTabCard.Cols2>
              </div>
            </MobileDataTabCard.Body>
          </MobileDataTabCard.Container>
        );
      })}
    </MobileDataTabCards>
  );
}
