import { BalanceSide, ProductEngineType } from '@nadohq/client';
import { calcIsoOrderRequiredMargin } from '@nadohq/react-client';
import { BigNumber } from 'bignumber.js';
import { StaticMarketData } from 'client/hooks/query/markets/allMarketsStaticDataByChainEnv/types';
import { useQueryLatestOraclePrices } from 'client/hooks/query/markets/useQueryLatestOraclePrices';
import { MarginMode } from 'client/modules/localstorage/userState/types/tradingSettings';
import { useIsSingleSignatureSession } from 'client/modules/singleSignatureSessions/hooks/useIsSingleSignatureSession';
import { TradeEntryEstimate } from 'client/modules/trading/hooks/useEstimateTradeEntry';
import { UseTpSlOrderForm } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { useTpSlOrderForm } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/useTpSlOrderForm';
import { OrderFormValues } from 'client/modules/trading/types/orderFormTypes';
import { PlaceOrderType } from 'client/modules/trading/types/placeOrderTypes';
import { useCallback, useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';

interface UseTradingPageTpSlOrderForm {
  /**
   * Form for the TP/SL orders
   */
  tpSlOrderForm: UseTpSlOrderForm;
  /**
   * Whether the TPSL checkbox is checked by the user
   */
  isTpSlCheckboxChecked: boolean;
  /**
   * Setter for the TPSL checkbox checked state
   */
  setIsTpSlCheckboxChecked: (isChecked: boolean) => void;
  /**
   * Whether the TPSL checkbox should be disabled (user cannot interact)
   */
  isTpSlCheckboxDisabled: boolean;
  /**
   * Whether the TPSL checkbox should be shown
   */
  showTpSlCheckbox: boolean;
}

interface Params {
  form: UseFormReturn<OrderFormValues>;
  currentMarket: StaticMarketData | undefined;
  estimatedTradeEntry: TradeEntryEstimate | undefined;
  validAssetAmount: BigNumber | undefined;
  orderSide: BalanceSide;
  orderType: PlaceOrderType;
  validatedLimitPriceInput: BigNumber | undefined;
  inputConversionPrice: BigNumber | undefined;
  marginMode: MarginMode;
  isReducingIsoPosition: boolean;
}

export function useTradingPageTpSlOrderForm({
  form,
  currentMarket,
  estimatedTradeEntry,
  validAssetAmount,
  orderSide,
  orderType,
  validatedLimitPriceInput,
  inputConversionPrice,
  marginMode,
  isReducingIsoPosition,
}: Params): UseTradingPageTpSlOrderForm {
  const isIso = marginMode.mode === 'isolated';
  const leverage = marginMode.leverage;

  const { data: latestOraclePrices } = useQueryLatestOraclePrices();

  const isTpSlCheckboxChecked = useWatch({
    control: form.control,
    name: 'orderSettings.isTpSlEnabled',
  });

  const setIsTpSlCheckboxChecked = useCallback(
    (isChecked: boolean) => {
      form.setValue('orderSettings.isTpSlEnabled', !!isChecked);
    },
    [form],
  );

  const isSingleSignatureSession = useIsSingleSignatureSession({
    requireActive: true,
  });

  const showTpSlCheckbox = orderType === 'market' || orderType === 'limit';

  /**
   * Cannot create a TP/SL when:
   * - does not have 1CT enabled
   * - order type is not market or limit
   */
  const isTpSlCheckboxDisabled = !isSingleSignatureSession || !showTpSlCheckbox;

  // Entry & amount inputs are always absolute, so we need to adjust for shorts
  const positionNetEntry = useMemo(() => {
    return estimatedTradeEntry?.estimatedTotal?.multipliedBy(
      orderSide === 'long' ? 1 : -1,
    );
  }, [estimatedTradeEntry?.estimatedTotal, orderSide]);

  const positionAmount = useMemo(
    () => validAssetAmount?.multipliedBy(orderSide === 'long' ? 1 : -1),
    [validAssetAmount, orderSide],
  );

  // Calculate the margin transfer for isolated positions
  const isoMarginTransfer = useMemo(() => {
    if (
      !isIso ||
      !validAssetAmount ||
      !inputConversionPrice ||
      !currentMarket?.productId ||
      currentMarket.type !== ProductEngineType.PERP
    ) {
      return undefined;
    }

    const assetAmountWithSign = validAssetAmount.multipliedBy(
      orderSide === 'long' ? 1 : -1,
    );

    return calcIsoOrderRequiredMargin({
      isMarketOrder: orderType === 'market',
      leverage,
      marketMaxLeverage: currentMarket.maxLeverage,
      assetAmountWithSign,
      orderPrice: inputConversionPrice,
      oraclePrice: latestOraclePrices?.[currentMarket.productId]?.oraclePrice,
      isReducingIsoPosition,
    });
  }, [
    isIso,
    validAssetAmount,
    inputConversionPrice,
    currentMarket,
    orderType,
    latestOraclePrices,
    leverage,
    orderSide,
    isReducingIsoPosition,
  ]);

  const tpSlOrderForm = useTpSlOrderForm({
    isIso,
    marketData: currentMarket,
    positionAmount,
    positionNetEntry,
    isoNetMarginTransferred: isoMarginTransfer,
    // Note that we need the `orderType` check because the limit price can be defined
    // when on other price type tabs
    referencePriceOverride:
      orderType === 'limit' ? validatedLimitPriceInput : undefined,
  });

  return {
    isTpSlCheckboxChecked,
    setIsTpSlCheckboxChecked,
    isTpSlCheckboxDisabled,
    tpSlOrderForm,
    showTpSlCheckbox,
  };
}
