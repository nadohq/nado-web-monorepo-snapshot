import { removeDecimals } from '@nadohq/client';
import { Form } from 'client/components/Form';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { AddTpSlDialogSubmitButton } from 'client/modules/trading/tpsl/addTpSlDialog/components/AddTpSlDialogSubmitButton';
import { useAddTpSlDialog } from 'client/modules/trading/tpsl/addTpSlDialog/hooks/useAddTpSlDialog';
import { TpSlAmountSection } from 'client/modules/trading/tpsl/components/TpSlAmountSection';
import { TpSlDialogEstimatedPnl } from 'client/modules/trading/tpsl/components/TpSlDialogEstimatedPnl';
import { TpSlHeaderMetrics } from 'client/modules/trading/tpsl/components/TpSlHeaderMetrics';
import { TpSlPriceInputs } from 'client/modules/trading/tpsl/components/TpSlPriceInputs';
import { getSharedProductMetadata } from 'client/utils/getSharedProductMetadata';
import { useTranslation } from 'react-i18next';

export interface AddTpSlDialogParams {
  isIso: boolean;
  productId: number;
}

export function AddTpSlDialog({ productId, isIso }: AddTpSlDialogParams) {
  const { t } = useTranslation();

  const { hide } = useDialog();

  const {
    form,
    tpState,
    slState,
    amountState,
    onFractionChange,
    onFormSubmit,
    buttonState,
    positionData,
    staticMarketData,
    lastPrice,
    setActiveField,
    handlePriceClick,
  } = useAddTpSlDialog({
    productId,
    isIso,
  });

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.dialogTitles.addTpSl)}
      </BaseAppDialog.Title>
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
            priceState={tpState}
            isTakeProfit
            priceIncrement={staticMarketData?.priceIncrement}
            setActiveField={setActiveField}
          />
          <TpSlPriceInputs
            form={form}
            priceState={slState}
            isTakeProfit={false}
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
          <TpSlDialogEstimatedPnl tpState={tpState} slState={slState} />
          <AddTpSlDialogSubmitButton state={buttonState} />
        </Form>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
