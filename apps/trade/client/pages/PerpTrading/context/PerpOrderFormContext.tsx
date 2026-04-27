import { ProductEngineType, QUOTE_PRODUCT_ID } from '@nadohq/client';
import { useRequiredContext } from '@nadohq/react-client';
import { safeParseForData, WithChildren } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { useExecutePlaceOrder } from 'client/hooks/execute/placeOrder/useExecutePlaceOrder';
import { useLatestMarketPrice } from 'client/hooks/markets/useLatestMarketPrice';
import {
  PerpStaticMarketData,
  StaticMarketQuoteData,
} from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import {
  PerpPositionItem,
  usePerpPositions,
} from 'client/hooks/subaccount/usePerpPositions';
import {
  UserStateError,
  useUserStateError,
} from 'client/hooks/subaccount/useUserStateError';
import { useClickToFill } from 'client/hooks/ui/form/useClickToFill';
import {
  RUN_WITH_DELAY_DURATIONS,
  useRunWithDelayOnCondition,
} from 'client/hooks/util/useRunWithDelayOnCondition';
import { useSyncedRef } from 'client/hooks/util/useSyncedRef';
import { MarginMode } from 'client/modules/localstorage/userState/types/tradingSettings';
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { TWAP_FREQUENCY_PRESETS } from 'client/modules/trading/components/twap/consts';
import { useOrderFormConversionPrices } from 'client/modules/trading/hooks/orderFormContext/useOrderFormConversionPrices';
import { useOrderFormEnableMaxSizeLogic } from 'client/modules/trading/hooks/orderFormContext/useOrderFormEnableMaxSizeLogic';
import { useOrderFormError } from 'client/modules/trading/hooks/orderFormContext/useOrderFormError';
import { useOrderFormMarketSelection } from 'client/modules/trading/hooks/orderFormContext/useOrderFormMarketSelection';
import { useOrderFormOnChangeSideEffects } from 'client/modules/trading/hooks/orderFormContext/useOrderFormOnChangeSideEffects';
import { useOrderFormProductData } from 'client/modules/trading/hooks/orderFormContext/useOrderFormProductData';
import {
  OrderFormSubmitHandlerIsoParams,
  OrderFromSubmitHandlerTpSlParams,
  useOrderFormSubmitHandler,
} from 'client/modules/trading/hooks/orderFormContext/useOrderFormSubmitHandler';
import { useOrderFormValidators } from 'client/modules/trading/hooks/orderFormContext/useOrderFormValidators';
import {
  TradeEntryEstimate,
  useEstimateTradeEntry,
} from 'client/modules/trading/hooks/useEstimateTradeEntry';
import { UseTpSlOrderForm } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { useTradingPageTpSlOrderForm } from 'client/modules/trading/tpsl/hooks/useTradingPageTpSlOrderForm';
import {
  OrderFormError,
  OrderFormValidators,
  OrderFormValues,
  RoundAmountFn,
  RoundPriceFn,
  SetActiveFieldFn,
} from 'client/modules/trading/types/orderFormTypes';
import { hasRequiredOrderFormInputs } from 'client/modules/trading/utils/hasRequiredOrderFormInputs';
import { convertOrderSizeToAssetAmount } from 'client/modules/trading/utils/orderSizeConversions';
import { usePerpOrderFormMaxOrderSizes } from 'client/pages/PerpTrading/context/hooks/usePerpOrderFormMaxOrderSizes';
import { usePerpOrderFormOnChangeSideEffects } from 'client/pages/PerpTrading/context/hooks/usePerpOrderFormOnChangeSideEffects';
import { useSelectedPerpMarginMode } from 'client/pages/PerpTrading/hooks/useSelectedPerpMarginMode';
import { priceInputAtom } from 'client/store/trading/commonTradingStore';
import { BaseActionButtonState } from 'client/types/BaseActionButtonState';
import { positiveBigNumberValidator } from 'client/utils/inputValidators';
import { createContext, useMemo } from 'react';
import {
  FormProvider,
  useForm,
  UseFormReturn,
  useWatch,
} from 'react-hook-form';

export interface PerpOrderFormContextData {
  /**
   * Form instance for the perp order form
   */
  form: UseFormReturn<OrderFormValues>;
  /**
   * Currently selected market
   */
  currentMarket: PerpStaticMarketData | undefined;
  /**
   * Currently position
   */
  currentPosition: PerpPositionItem | undefined;
  /**
   * Quote metadata for the current market
   */
  quoteMetadata: StaticMarketQuoteData | undefined;
  /**
   * Validators for the form
   */
  validators: OrderFormValidators;
  /**
   * Errors associated with the current state of the user
   */
  userStateError: UserStateError | undefined;
  /**
   * Errors associated with the form fields
   */
  formError: OrderFormError | undefined;
  /**
   * State of the submit button
   */
  buttonState: BaseActionButtonState;
  /**
   * Conversion price from base to quote without slippage, used to convert between asset and quote amounts
   */
  inputConversionPrice: BigNumber | undefined;
  /**
   * Minimum order size, in terms of the asset, for the currently selected market
   */
  minAssetOrderSize: BigNumber | undefined;
  /**
   * A validated order amount input, in terms of the current size denom (asset or quote)
   */
  validatedSizeInput: BigNumber | undefined;
  /**
   * Conversion price from base to quote with slippage included
   */
  executionConversionPrice: BigNumber | undefined;
  /**
   * The estimated entry given the current form values. Note this excludes any existing position's net entry.
   */
  estimatedTradeEntry: TradeEntryEstimate | undefined;
  /**
   * Configured max slippage for the current order type
   */
  maxSlippageFraction: number;
  /**
   * The price increment for the current market
   */
  priceIncrement: BigNumber | undefined;
  /**
   * The size increment for the current market
   */
  decimalAdjustedSizeIncrement: BigNumber | undefined;
  /**
   * The current margin mode.
   */
  marginMode: MarginMode;
  /**
   * Maximum order size, in terms of the asset, for the currently selected market
   */
  maxAssetOrderSize: BigNumber | undefined;
  /**
   * Whether to enable max size logic
   */
  enableMaxSizeLogic: boolean;
  /**
   * Form submit handler
   */
  onSubmit: () => void;
  /**
   * Whether the TPSL checkbox should be shown
   */
  showTpSlCheckbox: boolean;
  /**
   * Whether the TP/SL checkbox is checked.
   */
  isTpSlCheckboxChecked: boolean;
  /**
   * Setter for `isTpSlCheckboxChecked`.
   */
  setIsTpSlCheckboxChecked: (isChecked: boolean) => void;
  /**
   * Whether the TP/Sl checkbox is disabled, e.g. when 1CT is not configured.
   */
  isTpSlCheckboxDisabled: boolean;
  /**
   * Separate form for TP/SL orders
   */
  tpSlOrderForm: UseTpSlOrderForm;
  /**
   * Whether the user is reducing an isolated position.
   */
  isReducingIsoPosition: boolean;
  /**
   * Validated asset amount, in terms of the asset of the market.
   */
  validAssetAmount: BigNumber | undefined;
  /**
   * The function to round the asset amount
   */
  roundAssetAmount: RoundAmountFn;
  /**
   * The function to round the price
   */
  roundPrice: RoundPriceFn;
  /**
   * Sets which price input field receives the next chart/orderbook price click.
   */
  setActiveField: SetActiveFieldFn;
}

const PerpOrderFormContext = createContext<PerpOrderFormContextData | null>(
  null,
);

// Hook to consume context
export const usePerpOrderFormContext = () =>
  useRequiredContext(PerpOrderFormContext);

export function PerpOrderFormContextProvider({ children }: WithChildren) {
  const {
    savedUserState: {
      trading: {
        lastSelectedEngineOrderType,
        lastSelectedSizeDenom,
        lastSelectedSide,
      },
    },
  } = useSavedUserState();
  const { currentMarket, quoteMetadata } = useOrderFormMarketSelection(
    ProductEngineType.PERP,
  );
  const { data: latestMarketPrices } = useLatestMarketPrice({
    productId: currentMarket?.productId,
  });
  const userStateError = useUserStateError();

  const usePerpForm = useForm<OrderFormValues>({
    mode: 'onTouched',
    defaultValues: {
      side: lastSelectedSide,
      orderType: lastSelectedEngineOrderType,
      sizeSource: 'size',
      size: '',
      sizeDenom: lastSelectedSizeDenom,
      limitPrice: '',
      triggerPrice: '',
      amountFraction: 0,
      twapOrder: {
        durationHours: '',
        durationMinutes: '',
        frequencyInSeconds: TWAP_FREQUENCY_PRESETS['30s'],
        isRandomOrder: false,
      },
      scaledOrder: {
        numberOfOrders: '',
        priceDistributionType: 'flat',
        sizeDistributionType: 'evenly_split',
        startPrice: '',
        endPrice: '',
      },
      orderSettings: {
        timeInForceType: 'gtc',
        timeInForceInDays: '',
        postOnly: false,
        reduceOnly: false,
        isTpSlEnabled: false,
      },
    },
  });
  const productId = currentMarket?.productId;

  const { setActiveField, handleValueClick } = useClickToFill({
    form: usePerpForm,
    defaultField: 'limitPrice',
  });

  const { selectedMarginMode: marginMode } =
    useSelectedPerpMarginMode(productId);

  const executePlaceOrder = useExecutePlaceOrder();

  useRunWithDelayOnCondition({
    condition: executePlaceOrder.isSuccess,
    fn: executePlaceOrder.reset,
    delay: RUN_WITH_DELAY_DURATIONS.SHORT,
  });

  // Watched fields
  const [
    limitPriceInput,
    triggerPriceInput,
    sizeInput,
    sizeDenom,
    orderType,
    orderSide,
    reduceOnly,
  ] = useWatch({
    control: usePerpForm.control,
    name: [
      'limitPrice',
      'triggerPrice',
      'size',
      'sizeDenom',
      'orderType',
      'side',
      'orderSettings.reduceOnly',
    ],
  });

  /**
   * Derive current position data
   */
  const { data: perpPositions } = usePerpPositions();
  const currentPosition = useMemo(() => {
    return perpPositions?.find((pos) => {
      const matchesProductId = pos.productId === productId;
      const matchesMarginMode = !!pos.iso === (marginMode.mode === 'isolated');

      return matchesMarginMode && matchesProductId;
    });
  }, [marginMode.mode, perpPositions, productId]);

  const isReducingPosition = (() => {
    if (!currentPosition || currentPosition.amount.isZero()) {
      return false;
    }

    const isReducingLong =
      currentPosition.amount.isPositive() && orderSide === 'short';
    const isReducingShort =
      currentPosition.amount.isNegative() && orderSide === 'long';
    return isReducingLong || isReducingShort;
  })();
  const isReducingIsoPosition =
    marginMode.mode === 'isolated' && isReducingPosition;

  /**
   * Validate fields
   */
  const validatedLimitPriceInput = useMemo(() => {
    return safeParseForData(positiveBigNumberValidator, limitPriceInput);
  }, [limitPriceInput]);
  const validatedTriggerPriceInput = useMemo(() => {
    return safeParseForData(positiveBigNumberValidator, triggerPriceInput);
  }, [triggerPriceInput]);
  const validatedSizeInput = useMemo(() => {
    return safeParseForData(positiveBigNumberValidator, sizeInput);
  }, [sizeInput]);

  /**
   * Scaled order inputs
   */
  const [
    scaledOrderStartPriceInput,
    scaledOrderEndPriceInput,
    scaledOrderNumberOfOrdersInput,
  ] = useWatch({
    control: usePerpForm.control,
    name: [
      'scaledOrder.startPrice',
      'scaledOrder.endPrice',
      'scaledOrder.numberOfOrders',
    ],
  });

  const validatedScaledOrderStartPriceInput = useMemo(() => {
    return safeParseForData(
      positiveBigNumberValidator,
      scaledOrderStartPriceInput,
    );
  }, [scaledOrderStartPriceInput]);

  const validatedScaledOrderEndPriceInput = useMemo(() => {
    return safeParseForData(
      positiveBigNumberValidator,
      scaledOrderEndPriceInput,
    );
  }, [scaledOrderEndPriceInput]);

  const validatedScaledOrderNumberOfOrdersInput = useMemo(() => {
    return safeParseForData(
      positiveBigNumberValidator,
      scaledOrderNumberOfOrdersInput,
    );
  }, [scaledOrderNumberOfOrdersInput]);

  /**
   * TWAP order inputs
   */
  const [twapDurationHoursInput, twapDurationMinutesInput] = useWatch({
    control: usePerpForm.control,
    name: ['twapOrder.durationHours', 'twapOrder.durationMinutes'],
  });

  const validatedTwapDurationHoursInput = useMemo(() => {
    return safeParseForData(positiveBigNumberValidator, twapDurationHoursInput);
  }, [twapDurationHoursInput]);

  const validatedTwapDurationMinutesInput = useMemo(() => {
    return safeParseForData(
      positiveBigNumberValidator,
      twapDurationMinutesInput,
    );
  }, [twapDurationMinutesInput]);

  const {
    firstExecutionPrice,
    topOfBookPrice,
    priceIncrement,
    decimalAdjustedSizeIncrement,
    minAssetOrderSize,
    roundPrice,
    roundAssetAmount,
  } = useOrderFormProductData({
    form: usePerpForm,
    currentMarket,
    latestMarketPrices,
    validatedLimitPriceInput,
    validatedScaledOrderStartPriceInput,
    validatedScaledOrderEndPriceInput,
  });

  /**
   * Derive conversion prices
   */
  const {
    inputConversionPrice,
    inputConversionPriceRef,
    executionConversionPrice,
    executionConversionPriceRef,
    maxSlippageFraction,
  } = useOrderFormConversionPrices({
    orderType,
    topOfBookPrice,
    firstExecutionPrice,
    roundPrice,
    orderSide,
    validatedLimitPriceInput,
    validatedTriggerPriceInput,
    validatedScaledOrderStartPriceInput,
    validatedScaledOrderEndPriceInput,
  });

  const validAssetAmount = useMemo(
    () =>
      convertOrderSizeToAssetAmount({
        size: validatedSizeInput,
        sizeDenom,
        conversionPrice: inputConversionPrice,
        roundAssetAmount,
      }),
    [validatedSizeInput, sizeDenom, inputConversionPrice, roundAssetAmount],
  );

  /**
   * Max order sizes
   */
  const maxOrderSizes = usePerpOrderFormMaxOrderSizes({
    inputConversionPrice,
    executionConversionPrice,
    orderSide,
    productId,
    roundAssetAmount,
    marginMode,
    currentMarket,
    isReducingIsoPosition,
    currentPosition,
    reduceOnly,
  });
  // Max order size changes frequently, so use a ref for certain dependency arrays
  const maxAssetOrderSize = maxOrderSizes?.asset;
  const maxAssetOrderSizeRef = useSyncedRef(maxAssetOrderSize);
  const enableMaxSizeLogic = useOrderFormEnableMaxSizeLogic({
    orderType,
    reduceOnly,
  });

  /**
   * Get estimated trade entry.
   */
  const estimatedTradeEntry = useEstimateTradeEntry({
    validAssetAmount,
    executionLimitPrice: executionConversionPrice,
    productId,
    orderSide,
  });
  /**
   * TP/SL
   */
  const {
    showTpSlCheckbox,
    setIsTpSlCheckboxChecked,
    isTpSlCheckboxChecked,
    isTpSlCheckboxDisabled,
    tpSlOrderForm,
  } = useTradingPageTpSlOrderForm({
    currentMarket,
    form: usePerpForm,
    estimatedTradeEntry,
    validAssetAmount,
    orderSide,
    orderType,
    validatedLimitPriceInput,
    inputConversionPrice,
    marginMode,
    isReducingIsoPosition,
  });
  // Only price can be input on the perp trading page, so we only watch price input errors
  const tpSlOrderFormError = (() => {
    const { tpState, slState } = tpSlOrderForm;
    if (tpState.formError) {
      return tpState.formError;
    }
    if (slState.formError) {
      return slState.formError;
    }
  })();
  const hasTpSlOrderFormError = !!tpSlOrderFormError;

  /**
   * Input validation
   */
  const inputValidators = useOrderFormValidators({
    form: usePerpForm,
    inputConversionPriceRef,
    maxAssetOrderSizeRef,
    priceIncrement,
    decimalAdjustedSizeIncrement,
    roundAssetAmount,
    minAssetOrderSize,
    enableMaxSizeLogic,
    sizeDenom,
  });

  /**
   * Onchange side effects
   */
  useOrderFormOnChangeSideEffects({
    form: usePerpForm,
    productId,
    priceInputAtom,
    maxAssetOrderSize,
    inputConversionPrice,
    roundPrice,
    roundAssetAmount,
    handleValueClick,
  });
  usePerpOrderFormOnChangeSideEffects({
    form: usePerpForm,
    marginMode,
    isTpSlCheckboxDisabled,
    setIsTpSlCheckboxChecked,
    orderSide,
    resetTpSlForm: tpSlOrderForm.form.reset,
  });

  /**
   * Form error states
   */

  const formError = useOrderFormError({
    form: usePerpForm,
    userStateError,
  });

  /**
   * On submit handler
   */
  const submitHandlerTpSlParam: OrderFromSubmitHandlerTpSlParams | undefined =
    useMemo(() => {
      if (!isTpSlCheckboxChecked) {
        return;
      }

      return {
        submitHandler: tpSlOrderForm.submitHandler,
        formValues: tpSlOrderForm.form.getValues(),
      };
    }, [
      isTpSlCheckboxChecked,
      tpSlOrderForm.submitHandler,
      tpSlOrderForm.form,
    ]);

  const submitHandlerIsoParam = useMemo(():
    | OrderFormSubmitHandlerIsoParams
    | undefined => {
    return marginMode.mode === 'isolated'
      ? {
          subaccountName: currentPosition?.iso?.subaccountName,
          isReducingIsoPosition,
        }
      : undefined;
  }, [
    currentPosition?.iso?.subaccountName,
    isReducingIsoPosition,
    marginMode.mode,
  ]);
  const submitHandler = useOrderFormSubmitHandler({
    executionConversionPriceRef,
    inputConversionPriceRef,
    currentMarket,
    mutateAsync: executePlaceOrder.mutateAsync,
    quoteProductId: QUOTE_PRODUCT_ID,
    tpsl: submitHandlerTpSlParam,
    iso: submitHandlerIsoParam,
    marginMode,
    roundPrice,
    roundAssetAmount,
  });

  /**
   * Submit button state
   */
  const buttonState = useMemo((): BaseActionButtonState => {
    if (executePlaceOrder.isSuccess) {
      return 'success';
    }
    if (executePlaceOrder.isPending) {
      return 'loading';
    }

    const hasRequiredInputs = hasRequiredOrderFormInputs({
      validatedSizeInput,
      executionConversionPrice,
      orderType,
      validatedTriggerPriceInput,
      validatedScaledOrderStartPriceInput,
      validatedScaledOrderEndPriceInput,
      validatedScaledOrderNumberOfOrdersInput,
      validatedTwapDurationHoursInput,
      validatedTwapDurationMinutesInput,
    });

    // Check if there is an error in the TP/SL order form.
    const hasTpSlError = isTpSlCheckboxChecked && hasTpSlOrderFormError;

    if (!hasRequiredInputs || userStateError || formError || hasTpSlError) {
      return 'disabled';
    }

    return 'idle';
  }, [
    executePlaceOrder.isSuccess,
    executePlaceOrder.isPending,
    validatedSizeInput,
    executionConversionPrice,
    orderType,
    validatedTriggerPriceInput,
    validatedScaledOrderStartPriceInput,
    validatedScaledOrderEndPriceInput,
    validatedScaledOrderNumberOfOrdersInput,
    validatedTwapDurationHoursInput,
    validatedTwapDurationMinutesInput,
    isTpSlCheckboxChecked,
    hasTpSlOrderFormError,
    userStateError,
    formError,
  ]);

  const value = useMemo((): PerpOrderFormContextData => {
    return {
      form: usePerpForm,
      currentMarket,
      currentPosition,
      quoteMetadata,
      priceIncrement,
      decimalAdjustedSizeIncrement,
      enableMaxSizeLogic,
      minAssetOrderSize,
      maxAssetOrderSize,
      inputConversionPrice,
      executionConversionPrice,
      estimatedTradeEntry,
      maxSlippageFraction,
      validatedSizeInput,
      onSubmit: usePerpForm.handleSubmit(submitHandler),
      validators: inputValidators,
      formError,
      userStateError,
      buttonState,
      isTpSlCheckboxChecked,
      showTpSlCheckbox,
      setIsTpSlCheckboxChecked,
      isTpSlCheckboxDisabled,
      tpSlOrderForm,
      isReducingIsoPosition,
      marginMode,
      validAssetAmount,
      roundAssetAmount,
      roundPrice,
      setActiveField,
    };
  }, [
    usePerpForm,
    currentMarket,
    currentPosition,
    quoteMetadata,
    priceIncrement,
    decimalAdjustedSizeIncrement,
    enableMaxSizeLogic,
    minAssetOrderSize,
    maxAssetOrderSize,
    inputConversionPrice,
    executionConversionPrice,
    estimatedTradeEntry,
    maxSlippageFraction,
    validatedSizeInput,
    submitHandler,
    inputValidators,
    formError,
    userStateError,
    buttonState,
    isTpSlCheckboxChecked,
    showTpSlCheckbox,
    setIsTpSlCheckboxChecked,
    isTpSlCheckboxDisabled,
    tpSlOrderForm,
    isReducingIsoPosition,
    marginMode,
    validAssetAmount,
    roundAssetAmount,
    roundPrice,
    setActiveField,
  ]);

  return (
    <PerpOrderFormContext value={value}>
      <FormProvider {...usePerpForm}>{children}</FormProvider>
    </PerpOrderFormContext>
  );
}
