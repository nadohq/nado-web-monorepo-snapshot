import { ProductEngineType } from '@nadohq/client';
import {
  PresetNumberFormatSpecifier,
  TokenIconMetadata,
} from '@nadohq/react-client';
import {
  GradientPill,
  GradientPillColorVariant,
  Icons,
  LabelTooltip,
  Pill,
} from '@nadohq/web-ui';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { NewIcon } from 'client/components/Icons/NewIcon';
import { MarketPointsBoost } from 'client/hooks/markets/useAllMarketsPointsBoosts';
import { ProductTypePill } from 'client/modules/trading/components/ProductTypePill';
import { ZeroFeesPromoPill } from 'client/modules/trading/components/ZeroFeesPromoPill';
import { formatLeverage } from 'client/utils/formatLeverage';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';

interface Props {
  marketName: string;
  productType: ProductEngineType;
  symbol: string;
  icon: TokenIconMetadata;
  isNew: boolean;
  isXStock: boolean;
  isZeroFees: boolean;
  pointsBoost: MarketPointsBoost | undefined;
  maxLeverage: number | undefined;
  isMobile: boolean;
}

export function TradingMarketSwitcherProductInfoCell({
  marketName,
  productType,
  symbol,
  icon,
  isNew,
  isXStock,
  isZeroFees,
  maxLeverage,
  pointsBoost,
  isMobile,
}: Props) {
  const { t } = useTranslation();
  const pointsBoostTooltipLabel = (() => {
    if (!pointsBoost) return;

    const { takerBoost, makerBoost } = pointsBoost;

    if (takerBoost && makerBoost) {
      return t(($) => $.pointsBoostTooltip.both, {
        makerBoost: pointsBoost.makerBoost,
        takerBoost: pointsBoost.takerBoost,
      });
    } else if (takerBoost) {
      return t(($) => $.pointsBoostTooltip.taker, {
        takerBoost: pointsBoost.takerBoost,
      });
    } else if (makerBoost) {
      return t(($) => $.pointsBoostTooltip.maker, {
        makerBoost: pointsBoost.makerBoost,
      });
    }
  })();

  const pillColorVariant: GradientPillColorVariant = (() => {
    switch (pointsBoost?.boostType) {
      case 'high':
        return 'accent-info';
      case 'medium':
        return 'positive';
      case 'low':
        return 'warning';
      default:
        return 'warning';
    }
  })();

  return (
    <TableCell className="flex items-center gap-x-1.5">
      <Image src={icon.asset} className="h-auto w-5" alt={symbol} />
      <div className="flex flex-col items-start gap-x-1 gap-y-2 lg:flex-row lg:items-center">
        {/* Market title + product info, always rendered before any conditional pills */}
        <div className="flex items-center gap-x-1">
          <span
            className="text-text-primary text-xs font-medium"
            data-testid={`trading-market-switcher-market-name-cell-${marketName}`}
          >
            {marketName}
          </span>
          {maxLeverage != null && (
            <Pill
              colorVariant="secondary"
              sizeVariant="2xs"
              dataTestId="trading-market-switcher-market-leverage-cell"
            >
              {formatLeverage(
                maxLeverage,
                PresetNumberFormatSpecifier.NUMBER_INT,
              )}
            </Pill>
          )}
          <ProductTypePill
            productType={productType}
            colorVariant="secondary"
            dataTestId="trading-market-switcher-product-type-pill"
          />
        </div>
        <div className="flex items-center gap-x-1 empty:hidden">
          {pointsBoost && (
            <LabelTooltip label={pointsBoostTooltipLabel}>
              <GradientPill
                colorVariant={pillColorVariant}
                icon={isMobile ? undefined : Icons.FireFill}
              >
                {t(($) => $.boost)}
              </GradientPill>
            </LabelTooltip>
          )}
          {isXStock && (
            <GradientPill
              colorVariant="accent-info"
              icon={isMobile ? undefined : Icons.StarFill}
            >
              {t(($) => $.xPoints)}
            </GradientPill>
          )}
          {isZeroFees && <ZeroFeesPromoPill />}
          {isNew && <NewIcon />}
        </div>
      </div>
    </TableCell>
  );
}
