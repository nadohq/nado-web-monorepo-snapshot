import { Checkbox } from '@nadohq/web-ui';
import { Form } from 'client/components/Form';
import { NumberInputWithLabel } from 'client/components/NumberInputWithLabel';
import { PercentageRangeSlider } from 'client/components/RangeSlider/PercentageRangeSlider';
import { ClosePositionParams } from 'client/hooks/execute/placeOrder/useExecuteClosePosition';
import { useNumericInputPlaceholder } from 'client/hooks/ui/useNumericInputPlaceholder';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { ClosePositionButton } from 'client/modules/trading/closePosition/components/ClosePositionButton';
import { ClosePositionMetrics } from 'client/modules/trading/closePosition/components/ClosePositionMetrics';
import { ClosePositionSummary } from 'client/modules/trading/closePosition/components/ClosePositionSummary';
import { useClosePositionAmountErrorTooltipContent } from 'client/modules/trading/closePosition/hooks/useClosePositionAmountErrorTooltipContent';
import { useClosePositionForm } from 'client/modules/trading/closePosition/hooks/useClosePositionForm';
import { useClosePositionPriceErrorTooltipContent } from 'client/modules/trading/closePosition/hooks/useClosePositionPriceErrorTooltipContent';
import { MidPriceButton } from 'client/modules/trading/components/MidPriceButton';
import { useEnableQuickMarketClose } from 'client/modules/trading/hooks/useEnableQuickMarketClose';
import { useTranslation } from 'react-i18next';

export interface ClosePositionDialogParams extends Pick<
  ClosePositionParams,
  'productId' | 'isoSubaccountName'
> {
  isLimitOrder: boolean;
}

export function ClosePositionDialog({
  productId,
  isoSubaccountName,
  isLimitOrder,
}: ClosePositionDialogParams) {
  const { t } = useTranslation();
  const { hide } = useDialog();
  const { enableQuickMarketClose, setEnableQuickMarketClose } =
    useEnableQuickMarketClose();

  const {
    validAmount,
    amountInputError,
    limitPriceInputError,
    amountInputRegister,
    limitPriceInputRegister,
    amountFractionInput,
    priceIncrement,
    minAssetOrderSize,
    buttonState,
    perpPositionItem,
    decimalAdjustedSizeIncrement,
    amountRealizedPnl,
    isClosingFullPosition,
    setValue,
    onFractionChange,
    onSubmit,
  } = useClosePositionForm({
    isLimitOrder,
    productId,
    isoSubaccountName,
  });

  const amountErrorTooltipContent = useClosePositionAmountErrorTooltipContent({
    amountInputError,
    minAssetOrderSize,
    decimalAdjustedSizeIncrement,
  });

  const limitPriceErrorTooltipContent =
    useClosePositionPriceErrorTooltipContent({
      limitPriceInputError,
      priceIncrement,
    });

  const pricePlaceholder = useNumericInputPlaceholder({
    increment: priceIncrement,
  });
  const sizePlaceholder = useNumericInputPlaceholder({
    increment: decimalAdjustedSizeIncrement,
  });

  const priceType = isLimitOrder
    ? t(($) => $.orderTypes.limit)
    : t(($) => $.orderTypes.market);

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.closePriceType, { priceType })}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body asChild>
        <Form onSubmit={onSubmit}>
          <ClosePositionMetrics
            perpPositionItem={perpPositionItem}
            priceIncrement={priceIncrement}
          />
          {isLimitOrder && (
            <NumberInputWithLabel
              {...limitPriceInputRegister}
              id={limitPriceInputRegister.name}
              label={t(($) => $.price)}
              placeholder={pricePlaceholder}
              step={priceIncrement?.toString()}
              endElement={
                <MidPriceButton
                  productId={productId}
                  priceIncrement={priceIncrement}
                  setPriceInput={(price) => setValue('limitPrice', price)}
                />
              }
              errorTooltipContent={limitPriceErrorTooltipContent}
            />
          )}
          <NumberInputWithLabel
            {...amountInputRegister}
            id={amountInputRegister.name}
            label={t(($) => $.size)}
            placeholder={sizePlaceholder}
            max={perpPositionItem?.amount.abs().toString()}
            step={decimalAdjustedSizeIncrement?.toString()}
            endElement={perpPositionItem?.metadata.symbol}
            onFocus={() => {
              setValue('amountSource', 'absolute');
            }}
            errorTooltipContent={amountErrorTooltipContent}
          />
          <PercentageRangeSlider
            value={amountFractionInput}
            onValueChange={onFractionChange}
          />

          <ClosePositionSummary
            sizeToClose={validAmount}
            amountRealizedPnL={amountRealizedPnl}
            productName={perpPositionItem?.metadata.marketName}
          />

          <ClosePositionButton
            state={buttonState}
            isLimitOrder={isLimitOrder}
            isClosingFullPosition={isClosingFullPosition}
          />

          {!isLimitOrder && (
            <Checkbox.Row>
              <Checkbox.Check
                id="enable-quick-market-close"
                checked={enableQuickMarketClose}
                onCheckedChange={setEnableQuickMarketClose}
                sizeVariant="xs"
              />
              <Checkbox.Label
                id="enable-quick-market-close"
                sizeVariant="xs"
                className="text-text-secondary"
              >
                {t(($) => $.buttons.dontShowAgain)}
              </Checkbox.Label>
            </Checkbox.Row>
          )}
        </Form>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
