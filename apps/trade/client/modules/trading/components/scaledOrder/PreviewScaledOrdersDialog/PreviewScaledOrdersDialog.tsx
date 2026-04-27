import { sumBigNumberBy } from '@nadohq/client';
import {
  formatNumber,
  getMarketPriceFormatSpecifier,
  getMarketSizeFormatSpecifier,
  PresetNumberFormatSpecifier,
  safeDiv,
} from '@nadohq/react-client';
import { Divider } from '@nadohq/web-ui';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { PreviewScaledOrdersTable } from 'client/modules/trading/components/scaledOrder/PreviewScaledOrdersDialog/components/PreviewScaledOrdersTable';
import { BuildScaledOrdersResultItem } from 'client/modules/trading/utils/scaledOrderUtils';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';
import { first, last } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface PreviewScaledOrdersDialogParams {
  productId: number;
  previewScaledOrders: BuildScaledOrdersResultItem[];
}

export function PreviewScaledOrdersDialog({
  productId,
  previewScaledOrders,
}: PreviewScaledOrdersDialogParams) {
  const { t } = useTranslation();
  const { hide } = useDialog();

  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const marketData =
    productId != null ? allMarketsStaticData?.allMarkets[productId] : undefined;
  const sharedProductMetadata = marketData
    ? getSharedProductMetadata(marketData.metadata)
    : undefined;

  const { startPrice, endPrice, totalSize, avgFillPrice, numberOfOrders } =
    useMemo(() => {
      // Orders are ordered from start to end price
      const startPrice = first(previewScaledOrders)?.price;
      const endPrice = last(previewScaledOrders)?.price;

      const totalSize = sumBigNumberBy(
        previewScaledOrders,
        ({ amount }) => amount,
      ).abs();

      // Volume-weighted average price (VWAP)
      const totalNotional = sumBigNumberBy(
        previewScaledOrders,
        ({ price, amount }) => price.times(amount.abs()),
      );

      const avgFillPrice = safeDiv(totalNotional, totalSize);

      return {
        startPrice,
        endPrice,
        totalSize,
        avgFillPrice,
        numberOfOrders: previewScaledOrders.length,
      };
    }, [previewScaledOrders]);

  const previewScaledOrdersTableData = useMemo(
    () =>
      previewScaledOrders.map(({ amount, price }, index) => {
        const size = amount.abs();

        return {
          rowId: String(index),
          price,
          size,
          ratioFrac: safeDiv(size, totalSize),
        };
      }),
    [previewScaledOrders, totalSize],
  );

  const priceFormatSpecifier = getMarketPriceFormatSpecifier(
    marketData?.priceIncrement,
  );

  const sizeFormatSpecifier = getMarketSizeFormatSpecifier({
    sizeIncrement: marketData?.sizeIncrement,
  });

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.previewOrders)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body>
        {/* Summary Section */}
        <div className="grid grid-cols-2 gap-4">
          <ValueWithLabel.Vertical
            dataTestId="preview-scaled-orders-dialog-order-quantity"
            sizeVariant="xs"
            label={t(($) => $.orderQuantity)}
            value={numberOfOrders}
            numberFormatSpecifier={PresetNumberFormatSpecifier.NUMBER_INT}
          />
          <ValueWithLabel.Vertical
            dataTestId="preview-scaled-orders-dialog-total-size"
            sizeVariant="xs"
            label={t(($) => $.totalSize)}
            value={totalSize}
            numberFormatSpecifier={sizeFormatSpecifier}
            valueEndElement={sharedProductMetadata?.symbol}
          />
          <ValueWithLabel.Vertical
            dataTestId="preview-scaled-orders-dialog-price-range"
            sizeVariant="xs"
            label={t(($) => $.priceRange)}
            valueContent={
              <>
                {formatNumber(startPrice, {
                  formatSpecifier: priceFormatSpecifier,
                })}
                -
                {formatNumber(endPrice, {
                  formatSpecifier: priceFormatSpecifier,
                })}
              </>
            }
          />
          <ValueWithLabel.Vertical
            dataTestId="preview-scaled-orders-dialog-avg-entry-price"
            sizeVariant="xs"
            label={t(($) => $.avgEntryPrice)}
            value={avgFillPrice}
            numberFormatSpecifier={priceFormatSpecifier}
          />
        </div>
        <Divider />
        {/* Orders Table */}
        <PreviewScaledOrdersTable
          orders={previewScaledOrdersTableData}
          priceFormatSpecifier={priceFormatSpecifier}
          sizeFormatSpecifier={sizeFormatSpecifier}
        />
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
