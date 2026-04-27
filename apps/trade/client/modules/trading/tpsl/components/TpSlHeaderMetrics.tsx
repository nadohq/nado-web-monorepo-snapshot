import { ProductEngineType } from '@nadohq/client';
import {
  getMarketPriceFormatSpecifier,
  signDependentValue,
} from '@nadohq/react-client';
import { Pill, PillProps } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { StaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { TpSlPositionData } from 'client/modules/trading/tpsl/hooks/useTpSlPositionData';
import { getOrderSideLabel } from 'client/modules/trading/utils/getOrderSideLabel';
import { useTranslation } from 'react-i18next';

interface Props {
  positionData: TpSlPositionData | undefined;
  lastPrice: BigNumber | undefined;
  staticMarketData: StaticMarketData | undefined;
  onPriceClick: (price: BigNumber) => void;
}

export function TpSlHeaderMetrics({
  positionData,
  lastPrice,
  staticMarketData,
  onPriceClick,
}: Props) {
  const { t } = useTranslation();

  const priceFormatSpecifier = getMarketPriceFormatSpecifier(
    staticMarketData?.priceIncrement,
  );

  if (!positionData || !staticMarketData) {
    return null;
  }

  const pillColor = signDependentValue<PillProps['colorVariant']>(
    positionData.amount,
    {
      positive: 'positive',
      negative: 'negative',
      zero: 'primary',
    },
  );

  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-3">
      <ValueWithLabel.Vertical
        sizeVariant="xs"
        label={t(($) => $.market)}
        valueContent={staticMarketData.metadata.marketName}
        dataTestId="tpsl-header-metrics-market"
        valueEndElement={
          <Pill colorVariant={pillColor} sizeVariant="2xs">
            {getOrderSideLabel({
              t,
              isPerp: staticMarketData.type === ProductEngineType.PERP,
              alwaysShowOrderDirection: false,
              amountForSide: positionData.amount,
            })}
          </Pill>
        }
      />
      <ValueWithLabel.Vertical
        sizeVariant="xs"
        label={t(($) => $.lastPrice)}
        value={lastPrice}
        numberFormatSpecifier={priceFormatSpecifier}
        onValueClick={() => {
          if (lastPrice != null) {
            onPriceClick(lastPrice);
          }
        }}
        dataTestId="tpsl-header-metrics-last-price"
      />
      <ValueWithLabel.Vertical
        sizeVariant="xs"
        label={t(($) => $.entryPrice)}
        value={positionData.averageEntryPrice}
        numberFormatSpecifier={priceFormatSpecifier}
        onValueClick={() => {
          if (positionData.averageEntryPrice != null) {
            onPriceClick(positionData.averageEntryPrice);
          }
        }}
        dataTestId="tpsl-header-metrics-entry-price"
      />
      <ValueWithLabel.Vertical
        sizeVariant="xs"
        tooltip={{
          id: 'perpPositionsEstimatedLiqPrice',
        }}
        label={t(($) => $.estimatedAbbrevLiqPrice)}
        value={positionData.estimatedLiquidationPrice}
        numberFormatSpecifier={priceFormatSpecifier}
        onValueClick={() => {
          if (positionData.estimatedLiquidationPrice != null) {
            onPriceClick(positionData.estimatedLiquidationPrice);
          }
        }}
        dataTestId="tpsl-header-metrics-estimated-liquidation-price"
      />
    </div>
  );
}
