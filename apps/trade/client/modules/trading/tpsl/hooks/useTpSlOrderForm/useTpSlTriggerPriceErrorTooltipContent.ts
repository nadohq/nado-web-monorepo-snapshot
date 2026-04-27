import { formatNumber } from '@nadohq/react-client';
import { TpSlOrderFormPriceState } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { getTriggerReferencePriceTypeLabel } from 'client/modules/trading/utils/trigger/getTriggerReferencePriceTypeLabel';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface Params {
  state: TpSlOrderFormPriceState;
  isTakeProfit: boolean;
  priceFormatSpecifier: string;
}

export function useTpSlTriggerPriceErrorTooltipContent({
  state,
  isTakeProfit,
  priceFormatSpecifier,
}: Params) {
  const { t } = useTranslation();
  const { referencePrice, triggerPriceError, triggerReferencePriceType } =
    state;

  return useMemo(() => {
    const orderTypeLabel = isTakeProfit
      ? t(($) => $.orderTypes.takeProfit)
      : t(($) => $.orderTypes.stopLoss);

    const priceTypeLabel = getTriggerReferencePriceTypeLabel(
      t,
      triggerReferencePriceType,
    );

    const formattedReferencePrice = formatNumber(referencePrice, {
      formatSpecifier: priceFormatSpecifier,
    });

    switch (triggerPriceError) {
      case 'trigger_price_must_be_above_price':
        return t(($) => $.errors.triggerPriceAbove, {
          orderTypeLabel,
          priceTypeLabel,
          formattedReferencePrice,
        });
      case 'trigger_price_must_be_below_price':
        return t(($) => $.errors.triggerPriceBelow, {
          orderTypeLabel,
          priceTypeLabel,
          formattedReferencePrice,
        });
      case 'invalid_trigger_price_input':
        return t(($) => $.errors.invalidTriggerPriceInput, {
          orderTypeLabel,
        });
      case undefined:
        return null;
    }
  }, [
    isTakeProfit,
    priceFormatSpecifier,
    referencePrice,
    triggerReferencePriceType,
    triggerPriceError,
    t,
  ]);
}
