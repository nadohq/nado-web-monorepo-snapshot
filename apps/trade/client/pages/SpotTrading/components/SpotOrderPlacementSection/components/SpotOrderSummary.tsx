import { getMarketSizeFormatSpecifier } from '@nadohq/react-client';
import { ValueWithLabelProps } from 'client/components/ValueWithLabel/types';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { OrderSlippageMetricValue } from 'client/modules/trading/components/OrderSlippageMetricValue';
import { useTwapOrderSummaryMetrics } from 'client/modules/trading/components/twap/hooks/useTwapOrderSummaryMetrics';
import { useSpotLeverageEnabled } from 'client/modules/trading/hooks/useSpotLeverageEnabled';
import { useSpotOrderFormContext } from 'client/pages/SpotTrading/context/SpotOrderFormContext';
import { SpotTradingFormTradingAccountMetrics } from 'client/pages/SpotTrading/hooks/useSpotTradingFormAccountMetrics';
import { useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface Props {
  derivedMetrics: SpotTradingFormTradingAccountMetrics['derivedMetrics'];
}

export function SpotOrderSummary({ derivedMetrics }: Props) {
  const { t } = useTranslation();
  const {
    form,
    maxSlippageFraction,
    currentMarket,
    validAssetAmount,
    roundAssetAmount,
    estimatedTradeEntry,
  } = useSpotOrderFormContext();

  const orderType = useWatch({
    control: form.control,
    name: 'orderType',
  });

  const twapMetrics = useTwapOrderSummaryMetrics({
    form,
    validAssetAmount,
    roundAssetAmount,
    baseSymbol: currentMarket?.metadata.token.symbol,
    sizeIncrement: currentMarket?.sizeIncrement,
  });

  const { spotLeverageEnabled } = useSpotLeverageEnabled();

  const showSlippageMetric =
    orderType === 'market' || orderType === 'stop_market';

  const showTwapMetrics = orderType === 'twap';
  const showScaledOrderMetrics = orderType === 'multi_limit';

  const showAmountToBorrowMetric = spotLeverageEnabled;

  const slippageToleranceMetric: ValueWithLabelProps = {
    label: t(($) => $.slippage),
    valueContent: (
      <OrderSlippageMetricValue
        estimatedSlippageFraction={
          estimatedTradeEntry?.estimatedSlippageFraction
        }
        maxSlippageFraction={maxSlippageFraction}
      />
    ),
  };

  const amountToBorrowMetric = {
    label: t(($) => $.amountToBorrow),
    valueEndElement: derivedMetrics.borrowAssetSymbol,
    numberFormatSpecifier: getMarketSizeFormatSpecifier({
      sizeIncrement: currentMarket?.sizeIncrement,
    }),
    value: derivedMetrics.amountToBorrow,
  };

  const orderMetricItems = (() => {
    if (showTwapMetrics) {
      return twapMetrics;
    }

    if (showScaledOrderMetrics) {
      return [];
    }

    return [
      ...(showAmountToBorrowMetric ? [amountToBorrowMetric] : []),
      ...(showSlippageMetric ? [slippageToleranceMetric] : []),
    ];
  })();

  return (
    <div className="flex flex-col gap-y-3">
      {orderMetricItems.map((itemProps, index) => (
        <ValueWithLabel.Horizontal
          sizeVariant="xs"
          key={index}
          {...itemProps}
        />
      ))}
    </div>
  );
}
