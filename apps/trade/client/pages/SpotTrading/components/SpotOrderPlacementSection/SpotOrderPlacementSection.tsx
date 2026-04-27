import { joinClassNames, WithClassnames } from '@nadohq/web-common';
import { Form } from 'client/components/Form';
import { useSubaccountOverview } from 'client/hooks/subaccount/useSubaccountOverview/useSubaccountOverview';
import { OrderFormInputs } from 'client/modules/trading/components/OrderFormInputs/OrderFormInputs';
import { OrderFormSpreadWarningPanel } from 'client/modules/trading/components/OrderFormSpreadWarningPanel';
import { OrderPlacementAccountInfoDisplay } from 'client/modules/trading/components/OrderPlacementAccountInfoDisplay';
import { OrderSettings } from 'client/modules/trading/components/OrderSettings/OrderSettings';
import { OrderSideTabs } from 'client/modules/trading/components/OrderSideTabs';
import { OrderSubmitButton } from 'client/modules/trading/components/OrderSubmitButton';
import { OrderTypeTabs } from 'client/modules/trading/components/OrderTypeTabs/OrderTypeTabs';
import { TradingErrorPanel } from 'client/modules/trading/components/TradingErrorPanel';
import { useIsHighSpread } from 'client/modules/trading/hooks/useIsHighSpread';
import { useSpotLeverageEnabled } from 'client/modules/trading/hooks/useSpotLeverageEnabled';
import { SpotMarginSwitch } from 'client/pages/SpotTrading/components/SpotOrderPlacementSection/components/SpotMarginSwitch';
import { SpotOrderSummary } from 'client/pages/SpotTrading/components/SpotOrderPlacementSection/components/SpotOrderSummary';
import { useSpotOrderFormContext } from 'client/pages/SpotTrading/context/SpotOrderFormContext';
import { useSpotTradingFormAccountMetrics } from 'client/pages/SpotTrading/hooks/useSpotTradingFormAccountMetrics';
import { noop } from 'lodash';
import { useWatch } from 'react-hook-form';

export function SpotOrderPlacementSection({ className }: WithClassnames) {
  const {
    form,
    onSubmit,
    currentMarket,
    quoteMetadata,
    validators,
    priceIncrement,
    decimalAdjustedSizeIncrement,
    executionConversionPrice,
    enableMaxSizeLogic,
    maxAssetOrderSize,
    formError,
    buttonState,
    validAssetAmount,
    minAssetOrderSize,
    roundAssetAmount,
    roundPrice,
    inputConversionPrice,
    validatedSizeInput,
    currentBalance,
    setActiveField,
  } = useSpotOrderFormContext();

  const isHighSpread = useIsHighSpread(currentMarket?.productId);
  const { spotLeverageEnabled } = useSpotLeverageEnabled();

  const [orderSide, orderType] = useWatch({
    control: form.control,
    name: ['side', 'orderType'],
  });

  const tradingAccountMetrics = useSpotTradingFormAccountMetrics({
    currentMarket,
    quoteMetadata,
    orderSide,
    validAssetAmount,
    executionConversionPrice,
    enableMaxSizeLogic,
    maxAssetOrderSize,
  });

  // Display "Available Margin" from currentSubaccountOverview (not tradingAccountMetrics)
  // to ensure it matches the value shown in AccountInfoCard and avoid confusing users with
  // slight discrepancies caused by separate query timing.
  const { data: currentSubaccountOverview } = useSubaccountOverview();

  const marketSymbol = currentMarket?.metadata.token.symbol;

  return (
    <Form
      className={joinClassNames('flex flex-col gap-y-4 p-3', className)}
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-y-2">
        <SpotMarginSwitch />
        <OrderSideTabs isPerp={false} />
      </div>
      <OrderTypeTabs spotLeverageEnabled={spotLeverageEnabled} />
      <OrderPlacementAccountInfoDisplay
        form={form}
        currentMarket={currentMarket}
        amount={currentBalance?.amount}
        initialMarginBoundedUsd={
          currentSubaccountOverview?.initialMarginBoundedUsd
        }
        inputConversionPrice={inputConversionPrice}
        roundAssetAmount={roundAssetAmount}
      />
      <div className="flex flex-1 flex-col gap-y-5">
        <OrderFormInputs
          productId={currentMarket?.productId}
          validators={validators}
          quoteMetadata={quoteMetadata}
          baseSymbol={marketSymbol}
          minAssetOrderSize={minAssetOrderSize}
          formError={formError}
          priceIncrement={priceIncrement}
          decimalAdjustedSizeIncrement={decimalAdjustedSizeIncrement}
          inputConversionPrice={inputConversionPrice}
          maxAssetOrderSize={maxAssetOrderSize}
          roundAssetAmount={roundAssetAmount}
          roundPrice={roundPrice}
          validatedSizeInput={validatedSizeInput}
          validAssetAmount={validAssetAmount}
          setActiveField={setActiveField}
        />
        <OrderSettings
          orderType={orderType}
          formError={formError}
          validators={validators}
          showTpSlCheckbox={false}
          isTpSlCheckboxChecked={false}
          setIsTpSlCheckboxChecked={noop}
          isTpSlCheckboxDisabled={false}
          currentMarket={currentMarket}
          tpSlOrderForm={undefined}
        />
        <div className="flex flex-col gap-y-2.5 empty:hidden">
          <TradingErrorPanel formError={formError} />
          {isHighSpread && <OrderFormSpreadWarningPanel />}
        </div>
        <div className="mt-auto flex flex-col gap-y-5">
          <OrderSubmitButton
            isPerp={false}
            marketSymbol={marketSymbol}
            state={buttonState}
            side={orderSide}
          />
          <SpotOrderSummary
            derivedMetrics={tradingAccountMetrics.derivedMetrics}
          />
        </div>
      </div>
    </Form>
  );
}
