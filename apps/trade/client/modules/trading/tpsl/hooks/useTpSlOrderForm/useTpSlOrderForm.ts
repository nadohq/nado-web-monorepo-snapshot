import { asyncResult, BalanceSide, ProductEngineType } from '@nadohq/client';
import { calcPerpEntryCostBeforeLeverage } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { useExecutePlaceOrder } from 'client/hooks/execute/placeOrder/useExecutePlaceOrder';
import { useLatestMarketPrice } from 'client/hooks/markets/useLatestMarketPrice';
import { useLatestOrderFill } from 'client/hooks/markets/useLatestOrderFill';
import { StaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { useQueryLatestOraclePrices } from 'client/hooks/query/markets/useQueryLatestOraclePrices';
import { useClickToFill } from 'client/hooks/ui/form/useClickToFill';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import {
  TpSlOrderFormInitialValues,
  TpSlOrderFormPriceValues,
  TpSlOrderFormValues,
  TpSlSubmitHandlerValues,
  UseTpSlOrderForm,
} from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { useTpSlOrderFormAmountState } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/useTpSlOrderFormAmountState';
import { useTpSlOrderFormPriceState } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/useTpSlOrderFormPriceState';
import { useTpSlSingleOrderSubmitHandler } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/useTpSlSingleOrderSubmitHandler';
import { roundToIncrement } from 'client/utils/rounding';
import merge from 'lodash/merge';
import { useCallback, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';

const DEFAULT_TP_PRICE_VALUES: TpSlOrderFormPriceValues = {
  triggerPrice: '',
  triggerReferencePriceType: 'last_price',
  gainOrLossValue: '',
  triggerPriceSource: 'price',
  gainOrLossInputType: 'percentage',
  isLimitOrder: false,
  limitPrice: '',
};

const DEFAULT_SL_PRICE_VALUES: TpSlOrderFormPriceValues = {
  triggerPrice: '',
  triggerReferencePriceType: 'oracle_price',
  gainOrLossValue: '',
  triggerPriceSource: 'price',
  gainOrLossInputType: 'percentage',
  isLimitOrder: false,
  limitPrice: '',
};

const DEFAULT_FORM_VALUES: TpSlOrderFormValues = {
  tp: DEFAULT_TP_PRICE_VALUES,
  sl: DEFAULT_SL_PRICE_VALUES,
  amount: '',
  amountFraction: 0,
  amountSource: 'absolute',
  isPartialOrder: false,
};

interface Params {
  isIso: boolean;
  /**
   * The MAXIMUM amount of the position to close
   * ex: if you have a -2 BTC short but are only closing 1 BTC, this is still -2 BTC. The form will
   * accommodate partial value inputs
   */
  positionAmount: BigNumber | undefined;
  /**
   * The entry cost of the position being closed
   * Used for calculating PnL (for all position types)
   * ex: if you used 20,000 USDT to open a -1 BTC short, this is -20000 USDT.
   * ex: if you used 20,000 USDT to open a 1 BTC long, this is +20000 USDT.
   */
  positionNetEntry: BigNumber | undefined;
  /**
   * The net margin transferred for isolated positions (deposited margin w/o unsettled pnl)
   * Used internally for calculating partial position amounts for isolated positions
   */
  isoNetMarginTransferred: BigNumber | undefined;
  marketData: StaticMarketData | undefined;
  /**
   * Used by the orderform to override the reference price used for trigger price validation
   * In the order form, this would be the limit price
   */
  referencePriceOverride?: BigNumber;
  /**
   * Optional initial values for pre-populating the form.
   * Used when editing an existing order.
   */
  initialValues?: TpSlOrderFormInitialValues;
}

/**
 * Hook for managing the combined form state / submission of a  take profit AND
 * stop loss order form. This is used by both the trading page and dialog flows.
 */
export function useTpSlOrderForm({
  isIso,
  positionAmount,
  positionNetEntry,
  isoNetMarginTransferred,
  marketData,
  referencePriceOverride,
  initialValues,
}: Params): UseTpSlOrderForm {
  const {
    longWeightInitial,
    priceIncrement,
    sizeIncrement,
    minSize,
    type: marketType,
    productId,
  } = marketData ?? {};

  const isPerp = marketType === ProductEngineType.PERP;

  const { savedUserState } = useSavedUserState();

  const savedTpTriggerPriceType =
    savedUserState.trading.tpSlTriggerPriceType.takeProfit;
  const savedSlTriggerPriceType =
    savedUserState.trading.tpSlTriggerPriceType.stopLoss;

  const savedTriggerPriceTypeDefaults: TpSlOrderFormInitialValues = {
    tp: { triggerReferencePriceType: savedTpTriggerPriceType },
    sl: { triggerReferencePriceType: savedSlTriggerPriceType },
  };

  const form = useForm<TpSlOrderFormValues>({
    defaultValues: merge(
      {},
      DEFAULT_FORM_VALUES,
      savedTriggerPriceTypeDefaults,
      initialValues,
    ),
    mode: 'onTouched',
  });

  const [tpIsLimitOrder, slIsLimitOrder] = useWatch({
    control: form.control,
    name: ['tp.isLimitOrder', 'sl.isLimitOrder'],
  });

  const hasLimitOrder = tpIsLimitOrder || slIsLimitOrder;

  const { setActiveField, handleValueClick } = useClickToFill({
    form,
  });

  const handlePriceClick = useCallback(
    (price: BigNumber) => {
      const rounded = roundToIncrement(price, priceIncrement);
      handleValueClick(rounded.toString());
    },
    [handleValueClick, priceIncrement],
  );

  // Reference prices
  const { data: oraclePrices } = useQueryLatestOraclePrices();
  const { data: marketPrice } = useLatestMarketPrice({
    productId,
  });
  const { data: latestOrderFill } = useLatestOrderFill({
    productId,
  });
  const prices = (() => {
    if (!productId) {
      return {
        last: undefined,
        oracle: undefined,
        mid: undefined,
      };
    }

    return {
      last: latestOrderFill?.price,
      oracle: oraclePrices?.[productId]?.oraclePrice,
      mid: marketPrice?.safeMidPrice,
    };
  })();

  const amountState = useTpSlOrderFormAmountState({
    form,
    positionAmount,
    sizeIncrementWithDecimals: sizeIncrement,
    minSizeWithDecimals: minSize,
    oraclePrice: prices.oracle,
    hasLimitOrder,
  });

  // Amount of position actually being closed
  const positionCloseAmount = useMemo(() => {
    if (amountState.isPartialOrder) {
      if (!positionAmount || !amountState.validAmountFraction) {
        return;
      }
      // Multiply by % to retain the sign of the position amount
      return positionAmount.multipliedBy(amountState.validAmountFraction);
    }
    return positionAmount;
  }, [
    amountState.isPartialOrder,
    amountState.validAmountFraction,
    positionAmount,
  ]);

  // Net entry of the portion being closed
  const positionCloseAmountNetEntry = useMemo(() => {
    if (amountState.isPartialOrder) {
      if (!amountState.validAmountFraction || !positionNetEntry) {
        return;
      }
      // Multiply by % to retain the sign of the position amount
      return positionNetEntry.multipliedBy(amountState.validAmountFraction);
    }
    return positionNetEntry;
  }, [
    amountState.isPartialOrder,
    amountState.validAmountFraction,
    positionNetEntry,
  ]);

  const netCostForPnl = useMemo(() => {
    // Spot positions
    if (!isPerp) {
      return positionNetEntry;
    }
    // Isolated perp positions
    if (isIso) {
      return isoNetMarginTransferred;
    }
    // Cross perp positions
    if (positionNetEntry && longWeightInitial) {
      return calcPerpEntryCostBeforeLeverage(
        longWeightInitial,
        positionNetEntry,
      );
    }
    return undefined;
  }, [
    isPerp,
    isIso,
    isoNetMarginTransferred,
    longWeightInitial,
    positionNetEntry,
  ]);

  const positionCloseAmountNetCostForPnl = useMemo(() => {
    if (amountState.isPartialOrder) {
      if (!amountState.validAmountFraction || !netCostForPnl) {
        return;
      }
      return netCostForPnl.multipliedBy(amountState.validAmountFraction);
    }
    return netCostForPnl;
  }, [
    amountState.isPartialOrder,
    amountState.validAmountFraction,
    netCostForPnl,
  ]);

  const tpState = useTpSlOrderFormPriceState({
    form,
    isTakeProfit: true,
    positionCloseAmount,
    positionCloseAmountNetEntry,
    positionCloseAmountNetCostForPnl,
    priceIncrement,
    prices,
    referencePriceOverride,
  });
  const slState = useTpSlOrderFormPriceState({
    form,
    isTakeProfit: false,
    positionCloseAmount,
    positionCloseAmountNetEntry,
    positionCloseAmountNetCostForPnl,
    priceIncrement,
    prices,
    referencePriceOverride,
  });

  const executePlaceTp = useExecutePlaceOrder();
  const executePlaceSl = useExecutePlaceOrder();

  const positionSide: BalanceSide = positionCloseAmount?.gt(0)
    ? 'long'
    : 'short';
  const tpSubmitHandler = useTpSlSingleOrderSubmitHandler({
    productId,
    isIso,
    positionSide,
    mutateAsync: executePlaceTp.mutateAsync,
    isTakeProfit: true,
    isTriggerPriceAbove: tpState.isTriggerPriceAbove,
  });
  const slSubmitHandler = useTpSlSingleOrderSubmitHandler({
    productId,
    isIso,
    positionSide,
    mutateAsync: executePlaceSl.mutateAsync,
    isTakeProfit: false,
    isTriggerPriceAbove: slState.isTriggerPriceAbove,
  });

  const { reset: resetForm } = form;
  const submitHandler = useCallback(
    async (values: TpSlSubmitHandlerValues) => {
      await asyncResult(
        Promise.all([tpSubmitHandler(values), slSubmitHandler(values)]),
      );
      resetForm();
    },
    [resetForm, slSubmitHandler, tpSubmitHandler],
  );

  const onFractionChange = useCallback(
    (fraction: number) => {
      form.setValue('amountFraction', fraction);
      form.setValue('amountSource', 'fraction');
    },
    [form],
  );

  const isSubmitting = executePlaceTp.isPending || executePlaceSl.isPending;
  const isSuccess =
    !isSubmitting && (executePlaceTp.isSuccess || executePlaceSl.isSuccess);

  return {
    form,
    tpState,
    slState,
    amountState,
    submitHandler,
    onFractionChange,
    onFormSubmit: form.handleSubmit(submitHandler),
    isSubmitting,
    isSuccess,
    setActiveField,
    handlePriceClick,
  };
}
