import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { ChartTooltip } from 'client/components/ChartTooltip';
import { DepthChartItem } from 'client/modules/trading/chart/depth/useDepthChart';
import { useTranslation } from 'react-i18next';
import { useActiveTooltipDataPoints } from 'recharts';

interface Props {
  priceFormatSpecifier: string;
  sizeFormatSpecifier: string;
  symbol: string;
  quoteSymbol: string;
}

export function DepthChartTooltip({
  sizeFormatSpecifier,
  priceFormatSpecifier,
  symbol,
  quoteSymbol,
}: Props) {
  const { t } = useTranslation();

  const data = useActiveTooltipDataPoints<DepthChartItem>();
  const item = data?.[0];
  if (!item) {
    return null;
  }

  const cumulativeBaseSize =
    item.cumulativeAskBaseSize ?? item.cumulativeBidBaseSize;

  return (
    <ChartTooltip.Container>
      <ChartTooltip.Items>
        <ChartTooltip.Item
          title={t(($) => $.price)}
          content={formatNumber(item.price, {
            formatSpecifier: priceFormatSpecifier,
          })}
        />
        <ChartTooltip.Item
          title={t(($) => $.totalSymbol, { symbol })}
          content={formatNumber(cumulativeBaseSize, {
            formatSpecifier: sizeFormatSpecifier,
          })}
        />
        <ChartTooltip.Item
          title={t(($) => $.totalSymbol, { symbol: quoteSymbol })}
          content={formatNumber(item.cumulativeQuoteSize, {
            formatSpecifier: priceFormatSpecifier,
          })}
        />
        <ChartTooltip.Item
          title={t(($) => $.priceChange)}
          content={formatNumber(item.changeFraction, {
            formatSpecifier: PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_2DP,
          })}
        />
      </ChartTooltip.Items>
    </ChartTooltip.Container>
  );
}
