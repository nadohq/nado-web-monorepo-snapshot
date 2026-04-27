import { BaseTestProps, joinClassNames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { ProductLabelLink } from 'client/components/ProductLabelLink';
import { useTranslation } from 'react-i18next';

export interface SpotLiquidationLabelProps extends BaseTestProps {
  /** The unique identifier for the product */
  productId: number;
  /** The display name of the product */
  productName: string;
  /** The amount that was liquidated, used to determine if it was a deposit (positive) or borrow (negative) */
  amountLiquidated: BigNumber;
}

/**
 * A label for spot balance liquidations showing product name and deposit/borrow sub-type.
 *
 * Apply `product-label-border-container` class on a parent container to get colored
 * border effect.
 */
export function SpotLiquidationLabel({
  productId,
  productName,
  amountLiquidated,
  dataTestId,
}: SpotLiquidationLabelProps) {
  const { t } = useTranslation();

  const isDeposit = amountLiquidated.isPositive();
  const subType = isDeposit ? t(($) => $.deposit) : t(($) => $.borrow);

  const borderHighlightColor = isDeposit
    ? 'product-label-border-positive'
    : 'product-label-border-negative';

  return (
    <ProductLabelLink productId={productId} dataTestId={dataTestId}>
      <div
        className={joinClassNames(
          'flex flex-col gap-y-1.5',
          borderHighlightColor,
        )}
      >
        <div className="text-text-primary text-xs font-medium">
          {productName}
        </div>
        <div className="text-text-tertiary text-xs">{subType}</div>
      </div>
    </ProductLabelLink>
  );
}
