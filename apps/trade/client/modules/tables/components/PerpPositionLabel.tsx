import { signDependentValue } from '@nadohq/react-client';
import { BaseTestProps, joinClassNames } from '@nadohq/web-common';
import { Pill, PillProps } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { ProductLabelLink } from 'client/components/ProductLabelLink';
import { MarginModeType } from 'client/modules/localstorage/userState/types/tradingSettings';
import { getOrderSideLabel } from 'client/modules/trading/utils/getOrderSideLabel';
import { formatLeverage } from 'client/utils/formatLeverage';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useTranslation } from 'react-i18next';

export interface PerpPositionLabelProps extends BaseTestProps {
  productId: number;
  marketName: string | undefined;
  amountForSide: BigNumber;
  marginModeType: MarginModeType | undefined;
  isoLeverage?: number | null;
}

/**
 * A label for perp positions showing market name, side, and isolated/cross leverage info.
 *
 * Apply `product-label-border-container` class on a parent container to get colored
 * border effect matching the position side (long/short).
 */
export function PerpPositionLabel({
  productId,
  marketName,
  amountForSide,
  marginModeType,
  isoLeverage,
  dataTestId,
}: PerpPositionLabelProps) {
  const { t } = useTranslation();

  const borderHighlightColor = signDependentValue(amountForSide, {
    positive: 'product-label-border-positive',
    negative: 'product-label-border-negative',
    zero: undefined,
  });
  const pillColor = signDependentValue<PillProps['colorVariant']>(
    amountForSide,
    {
      positive: 'positive',
      negative: 'negative',
      zero: 'primary',
    },
  );
  const sideTextColor = getSignDependentColorClassName(amountForSide);

  const marginDetails = (() => {
    switch (marginModeType) {
      case 'cross': {
        return t(($) => $.cross);
      }
      case 'isolated': {
        return (
          <>
            {t(($) => $.isolated)}
            {isoLeverage && ` ${formatLeverage(isoLeverage)}`}
          </>
        );
      }
      default:
        return null;
    }
  })();

  return (
    <ProductLabelLink productId={productId} dataTestId={dataTestId}>
      <div
        className={joinClassNames(
          `flex flex-col gap-x-2 gap-y-1.5`,
          borderHighlightColor,
        )}
      >
        <div className="flex items-center gap-x-1">
          <div
            className="text-text-primary text-xs font-medium"
            data-testid="perp-positions-table-market-name"
          >
            {marketName}
          </div>
          <Pill
            colorVariant={pillColor}
            sizeVariant="2xs"
            dataTestId="perp-positions-table-direction-label"
          >
            {getOrderSideLabel({
              t,
              isPerp: true,
              alwaysShowOrderDirection: false,
              amountForSide,
            })}
          </Pill>
        </div>
        {marginDetails && (
          <div
            className={joinClassNames('text-xs capitalize', sideTextColor)}
            data-testid="perp-positions-table-margin-mode"
          >
            {marginDetails}
          </div>
        )}
      </div>
    </ProductLabelLink>
  );
}
