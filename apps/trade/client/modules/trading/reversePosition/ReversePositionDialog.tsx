import { SecondaryButton } from '@nadohq/web-ui';
import { Form } from 'client/components/Form';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { OrderSubmitButton } from 'client/modules/trading/components/OrderSubmitButton';
import { ReversePositionDialogHeader } from 'client/modules/trading/reversePosition/components/ReversePositionDialogHeader';
import { ReversePositionSummary } from 'client/modules/trading/reversePosition/components/ReversePositionSummary';
import { useReversePositionDialog } from 'client/modules/trading/reversePosition/hooks/useReversePositionDialog';
import { useTranslation } from 'react-i18next';

export interface ReversePositionDialogParams {
  productId: number;
  isIso: boolean;
}

export function ReversePositionDialog({
  productId,
  isIso,
}: ReversePositionDialogParams) {
  const { t } = useTranslation();

  const {
    position,
    isCurrentlyLong,
    orderAmount,
    midPrice,
    maxSlippageFraction,
    priceIncrement,
    sizeIncrement,
    buttonState,
    isPending,
    handleSubmit,
    hide,
  } = useReversePositionDialog({ productId, isIso });

  return (
    <BaseAppDialog.Container onClose={hide}>
      <BaseAppDialog.Title onClose={hide}>
        {t(($) => $.reversePerpPosition)}
      </BaseAppDialog.Title>
      <BaseAppDialog.Body asChild>
        <Form onSubmit={handleSubmit}>
          <ReversePositionDialogHeader
            position={position}
            isCurrentlyLong={isCurrentlyLong}
          />
          <ReversePositionSummary
            orderAmount={orderAmount}
            midPrice={midPrice}
            maxSlippageFraction={maxSlippageFraction}
            priceIncrement={priceIncrement}
            sizeIncrement={sizeIncrement}
          />
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-x-3">
            <SecondaryButton onClick={hide} disabled={isPending}>
              {t(($) => $.buttons.cancel)}
            </SecondaryButton>
            <OrderSubmitButton
              state={buttonState}
              side={isCurrentlyLong ? 'short' : 'long'}
              isPerp
              marketSymbol={position?.metadata.symbol}
            />
          </div>
        </Form>
      </BaseAppDialog.Body>
    </BaseAppDialog.Container>
  );
}
