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
import { PerpMarginSection } from 'client/pages/PerpTrading/components/PerpOrderPlacementSection/components/PerpMarginSection';
import { PerpOrderSummary } from 'client/pages/PerpTrading/components/PerpOrderPlacementSection/components/PerpOrderSummary';
import { ProductPendingDelistInfoPanel } from 'client/pages/PerpTrading/components/PerpOrderPlacementSection/components/ProductPendingDelistInfoPanel';
import { usePerpOrderFormContext } from 'client/pages/PerpTrading/context/PerpOrderFormContext';
import { usePerpTradingFormTradingAccountMetrics } from 'client/pages/PerpTrading/hooks/usePerpTradingFormTradingAccountMetrics';
import { useWatch } from 'react-hook-form';

export function PerpOrderPlacementSection({ className }: WithClassnames) {
  const {
    form,
    onSubmit,
    validators,
    formError,
    currentMarket,
    currentPosition,
    quoteMetadata,
    decimalAdjustedSizeIncrement,
    priceIncrement,
    buttonState,
    validAssetAmount,
    executionConversionPrice,
    maxAssetOrderSize,
    enableMaxSizeLogic,
    marginMode,
    isReducingIsoPosition,
    minAssetOrderSize,
    inputConversionPrice,
    roundAssetAmount,
    roundPrice,
    validatedSizeInput,
    showTpSlCheckbox,
    isTpSlCheckboxChecked,
    setIsTpSlCheckboxChecked,
    isTpSlCheckboxDisabled,
    tpSlOrderForm,
    setActiveField,
  } = usePerpOrderFormContext();

  const isHighSpread = useIsHighSpread(currentMarket?.productId);

  const [orderSide, orderType] = useWatch({
    control: form.control,
    name: ['side', 'orderType'],
  });

  const tradingAccountMetrics = usePerpTradingFormTradingAccountMetrics({
    currentMarket,
    marginMode,
    isReducingIsoPosition,
    orderSide,
    orderType,
    validAssetAmount,
    executionConversionPrice,
    maxAssetOrderSize,
    enableMaxSizeLogic,
  });

  // Display "Available Margin" from currentSubaccountOverview (not tradingAccountMetrics)
  // to ensure it matches the value shown in AccountInfoCard and avoid confusing users with
  // slight discrepancies caused by separate query timing.
  const { data: currentSubaccountOverview } = useSubaccountOverview();

  const marketSymbol = currentMarket?.metadata.symbol;

  return (
    <Form
      onSubmit={onSubmit}
      className={joinClassNames('flex flex-col gap-y-5 p-3', className)}
    >
      <div className="flex flex-col gap-y-2">
        <PerpMarginSection productId={currentMarket?.productId} />
        <OrderSideTabs isPerp />
      </div>
      <OrderTypeTabs isIso={marginMode.mode === 'isolated'} />
      <OrderPlacementAccountInfoDisplay
        form={form}
        currentMarket={currentMarket}
        amount={currentPosition?.amount}
        inputConversionPrice={inputConversionPrice}
        initialMarginBoundedUsd={
          currentSubaccountOverview?.initialMarginBoundedUsd
        }
        roundAssetAmount={roundAssetAmount}
      />
      <div className="flex flex-1 flex-col gap-y-5">
        <OrderFormInputs
          productId={currentMarket?.productId}
          formError={formError}
          validators={validators}
          baseSymbol={marketSymbol}
          quoteMetadata={quoteMetadata}
          priceIncrement={priceIncrement}
          decimalAdjustedSizeIncrement={decimalAdjustedSizeIncrement}
          minAssetOrderSize={minAssetOrderSize}
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
          showTpSlCheckbox={showTpSlCheckbox}
          isTpSlCheckboxChecked={isTpSlCheckboxChecked}
          setIsTpSlCheckboxChecked={setIsTpSlCheckboxChecked}
          isTpSlCheckboxDisabled={isTpSlCheckboxDisabled}
          currentMarket={currentMarket}
          tpSlOrderForm={tpSlOrderForm}
        />
        <div className="flex flex-col gap-y-2.5 empty:hidden">
          <TradingErrorPanel formError={formError} />
          {isHighSpread && <OrderFormSpreadWarningPanel />}
        </div>
        <div className="mt-auto flex flex-col gap-y-5">
          <OrderSubmitButton
            isPerp
            marketSymbol={marketSymbol}
            state={buttonState}
            side={orderSide}
          />
          <ProductPendingDelistInfoPanel currentMarket={currentMarket} />
          <PerpOrderSummary
            estimatedState={tradingAccountMetrics.estimatedState}
            derivedMetrics={tradingAccountMetrics.derivedMetrics}
          />
        </div>
      </div>
    </Form>
  );
}
