import { ProductEngineType } from '@nadohq/client';
import { useRequiredContext } from '@nadohq/react-client';
import { safeParseForData, WithChildren } from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { useExecutePlaceOrder } from 'client/hooks/execute/placeOrder/useExecutePlaceOrder';
import { useLatestMarketPrice } from 'client/hooks/markets/useLatestMarketPrice';
import {
  SpotStaticMarketData,
  StaticMarketQuoteData,
} from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import {
  SpotBalanceItem,
  useSpotBalances,
} from 'client/hooks/subaccount/useSpotBalances';
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
import { useSavedUserState } from 'client/modules/localstorage/userState/useSavedUserState';
import { TWAP_FREQUENCY_PRESETS } from 'client/modules/trading/components/twap/consts';
import { useOrderFormConversionPrices } from 'client/modules/trading/hooks/orderFormContext/useOrderFormConversionPrices';
import { useOrderFormEnableMaxSizeLogic } from 'client/modules/trading/hooks/orderFormContext/useOrderFormEnableMaxSizeLogic';
import { useOrderFormError } from 'client/modules/trading/hooks/orderFormContext/useOrderFormError';
import { useOrderFormMarketSelection } from 'client/modules/trading/hooks/orderFormContext/useOrderFormMarketSelection';
import {
  OrderFormMaxOrderSizes,
  useOrderFormMaxOrderSizes,
} from 'client/modules/trading/hooks/orderFormContext/useOrderFormMaxOrderSizes';
import { useOrderFormOnChangeSideEffects } from 'client/modules/trading/hooks/orderFormContext/useOrderFormOnChangeSideEffects';
import { useOrderFormProductData } from 'client/modules/trading/hooks/orderFormContext/useOrderFormProductData';
import { useOrderFormSubmitHandler } from 'client/modules/trading/hooks/orderFormContext/useOrderFormSubmitHandler';
import { useOrderFormValidators } from 'client/modules/trading/hooks/orderFormContext/useOrderFormValidators';
import {
  TradeEntryEstimate,
  useEstimateTradeEntry,
} from 'client/modules/trading/hooks/useEstimateTradeEntry';
import { useSpotLeverageEnabled } from 'client/modules/trading/hooks/useSpotLeverageEnabled';
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
import { useSpotOrderFormOnChangeSideEffects } from 'client/pages/SpotTrading/context/hooks/useSpotOrderFormOnChangeSideEffects';
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

export interface SpotOrderFormContextData {
  /**
   * Form instance for the spot order form
   */
  form: UseFormReturn<OrderFormValues>;
  /**
   * Currently selected market
   */
  currentMarket: SpotStaticMarketData | undefined;
  /**
   * Currently balance
   */
  currentBalance: SpotBalanceItem | undefined;
  /**
   * Validators for the form
   */
  validators: OrderFormValidators;
  /**
   * Errors associated with the current state of the user
   */
  userStateError: UserStateError | undefined;
  /**
   * Errors associated with the form
   */
  formError: OrderFormError | undefined;
  /**
   * State of the submit button
   */
  buttonState: BaseActionButtonState;
  /**
   * Metadata for the quote of the currently selected market
   */
  quoteMetadata: StaticMarketQuoteData | undefined;
  /**
   * Query result for max order sizes
   */
  maxOrderSizes: OrderFormMaxOrderSizes | undefined;
  /**
   * Minimum order size, in terms of the asset, for the currently selected market
   */
  minAssetOrderSize: BigNumber | undefined;
  /**
   * Conversion price from base -> quote with slippage included
   */
  executionConversionPrice: BigNumber | undefined;
  /**
   * Configured max slippage for the current order type
   */
  maxSlippageFraction: number;
  /**
   * A validated order size input, in terms of the current size denom (asset or quote)
   */
  validatedSizeInput: BigNumber | undefined;
  /**
   * Conversion price from base -> quote without slippage, this is used to convert between asset and quote amounts
   */
  inputConversionPrice: BigNumber | undefined;
  /**
   * The price increment for the current market
   */
  priceIncrement: BigNumber | undefined;
  /**
   * The size increment for the current market
   */
  decimalAdjustedSizeIncrement: BigNumber | undefined;
  /**
   * Maximum order size, in terms of the asset, for the currently selected market
   */
  maxAssetOrderSize: BigNumber | undefined;
  /**
   Whether to enable max size logic
   */
  enableMaxSizeLogic: boolean;
  /**
   * Form submit handler
   */
  onSubmit: () => void;
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
   * The estimated trade entry given the current form values
   */
  estimatedTradeEntry: TradeEntryEstimate | undefined;
  /**
   * Sets which price input field receives the next chart/orderbook price click.
   */
  setActiveField: SetActiveFieldFn;
}

const SpotOrderFormContext = createContext<SpotOrderFormContextData | null>(
  null,
);

// Hook to consume context
export const useSpotOrderFormContext = () =>
  useRequiredContext(SpotOrderFormContext);

export function SpotOrderFormContextProvider({ children }: WithChildren) {
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
    ProductEngineType.SPOT,
  );
  const { data: latestMarketPrices } = useLatestMarketPrice({
    productId: currentMarket?.productId,
  });
  const { spotLeverageEnabled } = useSpotLeverageEnabled();

  const productId = currentMarket?.productId;

  const useSpotForm = useForm<OrderFormValues>({
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

  const executePlaceOrder = useExecutePlaceOrder();

  useRunWithDelayOnCondition({
    condition: executePlaceOrder.isSuccess,
    fn: executePlaceOrder.reset,
    delay: RUN_WITH_DELAY_DURATIONS.SHORT,
  });

  const { setActiveField, handleValueClick } = useClickToFill({
    form: useSpotForm,
    defaultField: 'limitPrice',
  });

  // Watched fields
  const [
    sizeDenom,
    limitPriceInput,
    triggerPriceInput,
    sizeInput,
    orderType,
    orderSide,
    reduceOnly,
  ] = useWatch({
    control: useSpotForm.control,
    name: [
      'sizeDenom',
      'limitPrice',
      'triggerPrice',
      'size',
      'orderType',
      'side',
      'orderSettings.reduceOnly',
    ],
  });

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
   * Derive current balance data
   */
  const { balances } = useSpotBalances();
  const currentBalance = useMemo(
    () => balances?.find((balance) => balance.productId === productId),
    [balances, productId],
  );

  /**
   * Scaled order inputs
   */
  const [
    scaledOrderStartPriceInput,
    scaledOrderEndPriceInput,
    scaledOrderNumberOfOrdersInput,
  ] = useWatch({
    control: useSpotForm.control,
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
    control: useSpotForm.control,
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
    roundPrice,
    roundAssetAmount,
    minAssetOrderSize,
  } = useOrderFormProductData({
    form: useSpotForm,
    latestMarketPrices,
    currentMarket,
    validatedLimitPriceInput,
    validatedScaledOrderStartPriceInput,
    validatedScaledOrderEndPriceInput,
  });

  /**
   * Derive conversion prices
   */
  const {
    inputConversionPriceRef,
    inputConversionPrice,
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

  /**
   * Max order size query
   */
  const maxOrderSizes = useOrderFormMaxOrderSizes({
    spotLeverageEnabled: spotLeverageEnabled,
    inputConversionPrice,
    executionConversionPrice,
    orderSide,
    productId,
    roundAssetAmount,
    reduceOnly,
  });

  // Max order size changes frequently, so use a ref for certain dependency arrays
  const maxAssetOrderSize = maxOrderSizes?.asset;
  const maxAssetOrderSizeRef = useSyncedRef(maxAssetOrderSize);
  const enableMaxSizeLogic = useOrderFormEnableMaxSizeLogic({
    orderType,
    reduceOnly,
  });

  const validAssetAmount = useMemo(
    () =>
      convertOrderSizeToAssetAmount({
        size: validatedSizeInput,
        sizeDenom,
        conversionPrice: inputConversionPrice,
        roundAssetAmount,
      }),
    [inputConversionPrice, roundAssetAmount, sizeDenom, validatedSizeInput],
  );

  /**
   * Get estimated trade entry for slippage calculation
   */
  const estimatedTradeEntry = useEstimateTradeEntry({
    validAssetAmount,
    executionLimitPrice: executionConversionPrice,
    productId,
    orderSide,
  });

  /**
   * Input validation
   */
  const inputValidators = useOrderFormValidators({
    form: useSpotForm,
    inputConversionPriceRef,
    maxAssetOrderSizeRef,
    priceIncrement,
    decimalAdjustedSizeIncrement,
    minAssetOrderSize,
    enableMaxSizeLogic,
    sizeDenom,
    roundAssetAmount,
  });

  /**
   * Onchange side effects
   */
  useOrderFormOnChangeSideEffects({
    form: useSpotForm,
    productId,
    priceInputAtom,
    maxAssetOrderSize,
    inputConversionPrice,
    roundPrice,
    roundAssetAmount,
    handleValueClick,
  });
  useSpotOrderFormOnChangeSideEffects({
    form: useSpotForm,
    spotLeverageEnabled,
  });

  /**
   * Form error states
   */
  const userStateError = useUserStateError();

  const formError = useOrderFormError({
    form: useSpotForm,
    userStateError,
  });

  /**
   * On submit handler
   */
  const submitHandler = useOrderFormSubmitHandler({
    executionConversionPriceRef,
    inputConversionPriceRef,
    currentMarket,
    mutateAsync: executePlaceOrder.mutateAsync,
    spotLeverageEnabled,
    quoteProductId: quoteMetadata?.productId,
    roundPrice,
    roundAssetAmount,
  });

  /**
   * Submit button state
   */
  const buttonState = useMemo((): BaseActionButtonState => {
    if (executePlaceOrder.isSuccess) {
      return 'success';
    } else if (executePlaceOrder.isPending) {
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

    if (!hasRequiredInputs || userStateError || formError) {
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
    userStateError,
    formError,
  ]);

  const value = useMemo((): SpotOrderFormContextData => {
    return {
      form: useSpotForm,
      currentMarket,
      currentBalance,
      priceIncrement,
      decimalAdjustedSizeIncrement,
      maxOrderSizes,
      enableMaxSizeLogic,
      minAssetOrderSize,
      maxAssetOrderSize,
      onSubmit: useSpotForm.handleSubmit(submitHandler),
      validators: inputValidators,
      formError,
      userStateError,
      buttonState,
      executionConversionPrice,
      maxSlippageFraction,
      validatedSizeInput,
      inputConversionPrice,
      quoteMetadata,
      validAssetAmount,
      roundAssetAmount,
      roundPrice,
      estimatedTradeEntry,
      setActiveField,
    };
  }, [
    useSpotForm,
    currentMarket,
    priceIncrement,
    decimalAdjustedSizeIncrement,
    maxOrderSizes,
    enableMaxSizeLogic,
    minAssetOrderSize,
    maxAssetOrderSize,
    submitHandler,
    inputValidators,
    formError,
    userStateError,
    buttonState,
    executionConversionPrice,
    maxSlippageFraction,
    validatedSizeInput,
    inputConversionPrice,
    quoteMetadata,
    validAssetAmount,
    roundAssetAmount,
    roundPrice,
    estimatedTradeEntry,
    currentBalance,
    setActiveField,
  ]);

  return (
    <SpotOrderFormContext value={value}>
      <FormProvider {...useSpotForm}>{children}</FormProvider>
    </SpotOrderFormContext>
  );
}
