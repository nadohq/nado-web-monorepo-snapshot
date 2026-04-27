import { BalanceSide } from '@nadohq/client';
import { joinClassNames } from '@nadohq/web-common';
import { ProductLabelLink } from 'client/components/ProductLabelLink';
import { useTranslation } from 'react-i18next';

export interface OrderMarketLabelProps {
  productId: number;
  marketName: string | undefined;
  orderSide: BalanceSide;
  isIso: boolean;
}

/**
 * A label for an order showing market name, side, and whether it's isolated/cross.
 *
 * Apply `product-label-border-container` class on a parent container to get colored
 * border effect matching the position side (long/short).
 */
export function OrderMarketLabel({
  productId,
  marketName,
  orderSide,
  isIso,
}: OrderMarketLabelProps) {
  const { t } = useTranslation();

  const borderHighlightColor =
    orderSide === 'long'
      ? 'product-label-border-positive'
      : 'product-label-border-negative';
  const sideTextColor =
    orderSide === 'long' ? 'text-positive' : 'text-negative';

  return (
    <ProductLabelLink productId={productId}>
      <div
        className={joinClassNames(
          `flex flex-col gap-x-2 gap-y-1.5`,
          borderHighlightColor,
        )}
      >
        <div
          className="text-text-primary text-xs font-medium"
          data-testid="orders-table-order-market-label-market-name"
        >
          {marketName}
        </div>
        <div
          className={joinClassNames('text-xs capitalize', sideTextColor)}
          data-testid="orders-table-order-market-label-margin-mode"
        >
          {isIso ? t(($) => $.isolated) : t(($) => $.cross)}
        </div>
      </div>
    </ProductLabelLink>
  );
}
