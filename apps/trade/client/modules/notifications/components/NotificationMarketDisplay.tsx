import { ProductEngineType } from '@nadohq/client';
import { NextImageSrc } from '@nadohq/web-common';
import { TOAST_MARKET_ICON_CLASSNAME } from 'client/modules/notifications/components/consts';
import { ProductTypePill } from 'client/modules/trading/components/ProductTypePill';
import Image from 'next/image';

interface NotificationMarketDisplayProps {
  marketIcon: NextImageSrc;
  marketName: string;
  productType: ProductEngineType | null;
}

/**
 * Displays market information in notifications
 * @param marketIcon - The market icon image source
 * @param marketName - The display name of the market
 * @param productType - The product engine type (SPOT or PERP), or null to hide the pill
 * @returns A formatted market display component for notifications
 */
export function NotificationMarketDisplay({
  marketIcon,
  marketName,
  productType,
}: NotificationMarketDisplayProps) {
  return (
    <div className="flex items-center gap-x-1.5">
      <Image
        className={TOAST_MARKET_ICON_CLASSNAME}
        src={marketIcon}
        alt={marketName}
      />
      <div className="flex items-center gap-x-1">
        <span>{marketName}</span>
        {productType != null && (
          <ProductTypePill
            productType={productType}
            colorVariant="secondary"
            className="h-4.5 py-0"
          />
        )}
      </div>
    </div>
  );
}
