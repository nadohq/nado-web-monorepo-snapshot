import {
  getMarketPriceFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { ValueWithLabelProps } from 'client/components/ValueWithLabel/types';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { OrderSlippageMetricValue } from 'client/modules/trading/components/OrderSlippageMetricValue';
import { useTwapOrderSummaryMetrics } from 'client/modules/trading/components/twap/hooks/useTwapOrderSummaryMetrics';
import { usePerpOrderFormContext } from 'client/pages/PerpTrading/context/PerpOrderFormContext';
import { TradingFormPerpAccountMetrics } from 'client/pages/PerpTrading/hooks/usePerpTradingFormTradingAccountMetrics';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Props {
  derivedMetrics: TradingFormPerpAccountMetrics['derivedMetrics'];
  estimatedState: TradingFormPerpAccountMetrics['estimatedState'];
}

export function PerpOrderSummary({ derivedMetrics, estimatedState }: Props) {
  const { t } = useTranslation();

  const {
    form,
    maxSlippageFraction,
    currentMarket,
    validAssetAmount,
    roundAssetAmount,
    estimatedTradeEntry,
  } = usePerpOrderFormContext();

  const orderType = useWatch({
    control: form.control,
    name: 'orderType',
  });

  const twapMetrics = useTwapOrderSummaryMetrics({
    form,
    validAssetAmount,
    roundAssetAmount,
    sizeIncrement: currentMarket?.sizeIncrement,
    baseSymbol: currentMarket?.metadata.symbol,
  });

  const showSlippageMetric =
    orderType === 'market' || orderType === 'stop_market';

  const showTwapMetrics = orderType === 'twap';

  const showScaledOrderMetrics = orderType === 'multi_limit';

  const marginRequiredMetric = {
    label: t(($) => $.marginRequired),
    value: derivedMetrics?.costUsd,
    numberFormatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
  };

  const orderMetricItems: ValueWithLabelProps[] = (() => {
    if (showScaledOrderMetrics) {
      return [marginRequiredMetric];
    }

    if (showTwapMetrics) {
      return twapMetrics;
    }

    return [
      {
        label: t(($) => $.estimatedAbbrevLiquidationPrice),
        value: estimatedState?.estimatedLiquidationPrice,
        numberFormatSpecifier: getMarketPriceFormatSpecifier(
          currentMarket?.priceIncrement,
        ),
      },
      marginRequiredMetric,
      ...(showSlippageMetric
        ? [
            {
              label: t(($) => $.slippage),
              valueContent: (
                <OrderSlippageMetricValue
                  estimatedSlippageFraction={
                    estimatedTradeEntry?.estimatedSlippageFraction
                  }
                  maxSlippageFraction={maxSlippageFraction}
                />
              ),
            },
          ]
        : []),
    ];
  })();

  return (
    <div className="flex flex-col gap-y-3">
      {orderMetricItems.map((itemProps) => (
        <ValueWithLabel.Horizontal
          sizeVariant="xs"
          key={itemProps.label?.toString()}
          {...itemProps}
        />
      ))}
    </div>
  );
}
