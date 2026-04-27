import { removeDecimals } from '@nadohq/client';
import { Form } from 'client/components/Form';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { TpSlAmountSection } from 'client/modules/trading/tpsl/components/TpSlAmountSection';
import { TpSlDialogEstimatedPnl } from 'client/modules/trading/tpsl/components/TpSlDialogEstimatedPnl';
import { TpSlHeaderMetrics } from 'client/modules/trading/tpsl/components/TpSlHeaderMetrics';
import { TpSlPriceInputs } from 'client/modules/trading/tpsl/components/TpSlPriceInputs';
import { ModifyTpSlDialogSubmitButton } from 'client/modules/trading/tpsl/modifyTpSlDialog/ModifyTpSlDialogSubmitButton';
import { useModifyTpSlDialog } from 'client/modules/trading/tpsl/modifyTpSlDialog/hooks/useModifyTpSlDialog';
import { ModifyTpSlDialogParams } from 'client/modules/trading/tpsl/modifyTpSlDialog/types';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';

export function ModifyTpSlDialog({
  productId,
  order,
  isIso,
}: ModifyTpSlDialogParams) {
  const { hide } = useDialog();

  const {
    form,
    priceState,
    amountState,
    isTakeProfit,
    staticMarketData,
    positionData,
    lastPrice,
    buttonState,
    dialogTitle,
    onFractionChange,
    onFormSubmit,
    setActiveField,
    handlePriceClick,
  } = useModifyTpSlDialog({ productId, order, isIso });

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>{dialogTitle}</BaseAppDialog.Title>
      <BaseAppDialog.Body asChild>
        <Form onSubmit={onFormSubmit} className="gap-y-5">
          <TpSlHeaderMetrics
            positionData={positionData}
            lastPrice={lastPrice}
            staticMarketData={staticMarketData}
            onPriceClick={handlePriceClick}
          />
          <TpSlPriceInputs
            form={form}
            priceState={priceState}
            isTakeProfit={isTakeProfit}
            priceIncrement={staticMarketData?.priceIncrement}
            setActiveField={setActiveField}
          />
          <TpSlAmountSection
            form={form}
            amountState={amountState}
            onFractionChange={onFractionChange}
            decimalAdjustedSizeIncrement={removeDecimals(
              staticMarketData?.sizeIncrement,
            )}
            marketSymbol={
              staticMarketData
                ? getSharedProductMetadata(staticMarketData.metadata).symbol
                : undefined
            }
          />
          <TpSlDialogEstimatedPnl
            tpState={isTakeProfit ? priceState : undefined}
            slState={!isTakeProfit ? priceState : undefined}
          />
          <ModifyTpSlDialogSubmitButton state={buttonState} />
        </Form>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
