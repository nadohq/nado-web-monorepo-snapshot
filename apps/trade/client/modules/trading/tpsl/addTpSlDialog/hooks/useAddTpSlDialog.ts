import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useLatestOrderFill } from 'client/hooks/markets/useLatestOrderFill';
import {
  RUN_WITH_DELAY_DURATIONS,
  useRunWithDelayOnCondition,
} from 'client/hooks/util/useRunWithDelayOnCondition';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useTpSlOrderForm } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/useTpSlOrderForm';
import { useTpSlPositionData } from 'client/modules/trading/tpsl/hooks/useTpSlPositionData';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';

interface Params {
  productId: number;
  isIso: boolean;
}

export function useAddTpSlDialog({ productId, isIso }: Params) {
  const { data: allMarketsStaticData } = useAllMarketsStaticData();
  const { data: latestOrderFillPrice } = useLatestOrderFill({ productId });
  const { hide } = useDialog();

  const positionData = useTpSlPositionData({ productId, isIso });
  const staticMarketData = allMarketsStaticData?.allMarkets[productId];

  const tpSlForm = useTpSlOrderForm({
    isIso,
    positionAmount: positionData?.amount,
    positionNetEntry: positionData?.netEntryCost,
    isoNetMarginTransferred: positionData?.isoNetMarginTransferred,
    marketData: staticMarketData,
  });

  const buttonState = ((): BaseActionButtonState => {
    if (tpSlForm.isSubmitting) {
      return 'loading';
    }
    if (tpSlForm.isSuccess) {
      return 'success';
    }

    // For form to be valid, it must have a valid price for either TP or SL, and no form errors
    const hasFormError =
      !!tpSlForm.tpState.formError ||
      !!tpSlForm.slState.formError ||
      !!tpSlForm.amountState.amountFormError;
    const hasRequiredPriceValues =
      tpSlForm.slState.hasRequiredValues || tpSlForm.tpState.hasRequiredValues;

    if (
      !hasFormError &&
      hasRequiredPriceValues &&
      tpSlForm.amountState.hasRequiredValues
    ) {
      return 'idle';
    }

    return 'disabled';
  })();

  useRunWithDelayOnCondition({
    condition: tpSlForm.isSuccess,
    fn: hide,
    delay: RUN_WITH_DELAY_DURATIONS.SHORT,
  });

  return {
    ...tpSlForm,
    lastPrice: latestOrderFillPrice?.price,
    positionData,
    staticMarketData,
    buttonState,
  };
}
