import { formatNumber } from '@nadohq/react-client';
import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { useTranslation } from 'react-i18next';

interface Props extends WithClassnames {
  tpTriggerPrice: BigNumber | undefined;
  slTriggerPrice: BigNumber | undefined;
  priceFormatSpecifier: string;
  hasMultipleTpOrSlOrders: boolean;
  numTpSlOrders: number;
}

/**
 * Renders the TP/SL prices (or "{num} Details" if multiple orders)
 * Used in the perp positions table and mobile cards
 */
export function PerpTpSlPrices({
  hasMultipleTpOrSlOrders,
  numTpSlOrders,
  priceFormatSpecifier,
  tpTriggerPrice,
  slTriggerPrice,
  className,
}: Props) {
  const { t } = useTranslation();

  return (
    <div
      className={joinClassNames('flex flex-col gap-y-1.5', className)}
      data-testid="perp-positions-table-tp-sl-prices"
    >
      {hasMultipleTpOrSlOrders ? (
        t(($) => $.countDetails, { count: numTpSlOrders })
      ) : (
        <>
          <span className="text-positive">
            {formatNumber(tpTriggerPrice, {
              formatSpecifier: priceFormatSpecifier,
            })}
          </span>
          <span className="text-negative">
            {formatNumber(slTriggerPrice, {
              formatSpecifier: priceFormatSpecifier,
            })}
          </span>
        </>
      )}
    </div>
  );
}
