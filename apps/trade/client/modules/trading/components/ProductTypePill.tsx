import { ProductEngineType } from '@nadohq/client';
import { BaseTestProps, WithClassnames } from '@nadohq/web-common';
import { Pill, PillColorVariant, PillSizeVariant } from '@nadohq/web-ui';
import { useTranslation } from 'react-i18next';

interface ProductTypePillProps extends BaseTestProps, WithClassnames {
  productType: ProductEngineType;
  colorVariant?: PillColorVariant;
  sizeVariant?: PillSizeVariant;
}

/**
 * Displays a pill component showing the product type as either "Spot" or "Perp"
 * @param productType - The product engine type to display
 * @param colorVariant - The color variant for the pill (defaults to 'primary')
 * @param sizeVariant - The size variant for the pill (defaults to '2xs')
 * @param className - Optional className to override pill styles
 * @returns A Pill component with the appropriate product type label
 */
export function ProductTypePill({
  productType,
  colorVariant = 'primary',
  sizeVariant = '2xs',
  className,
  dataTestId,
}: ProductTypePillProps) {
  const { t } = useTranslation();

  return (
    <Pill
      colorVariant={colorVariant}
      sizeVariant={sizeVariant}
      className={className}
      dataTestId={dataTestId}
    >
      {productType === ProductEngineType.SPOT
        ? t(($) => $.spot)
        : t(($) => $.perp)}
    </Pill>
  );
}
