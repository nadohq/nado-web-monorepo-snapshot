import { WithClassnames, joinClassNames } from '@nadohq/web-common';
import { SecondaryButton } from '@nadohq/web-ui';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useSelectedPerpMarginMode } from 'client/pages/PerpTrading/hooks/useSelectedPerpMarginMode';

interface Props extends WithClassnames {
  productId: number | undefined;
}

export function PerpMarginSection({ className, productId }: Props) {
  const { show } = useDialog();
  const { selectedMarginMode } = useSelectedPerpMarginMode(productId);

  const buttonClassNames = 'capitalize font-medium';

  return (
    <div className={joinClassNames('grid grid-cols-2 gap-x-2', className)}>
      <SecondaryButton
        dataTestId="perp-order-placement-section-margin-mode-button"
        size="sm"
        className={buttonClassNames}
        onClick={() => {
          if (!productId) {
            return;
          }

          show({
            type: 'perp_margin_mode',
            params: { productId },
          });
        }}
      >
        {selectedMarginMode.mode}
      </SecondaryButton>
      <SecondaryButton
        dataTestId="perp-order-placement-section-leverage-button"
        size="sm"
        className={buttonClassNames}
        onClick={() => {
          if (!productId) {
            return;
          }

          show({
            type: 'perp_leverage',
            params: { productId },
          });
        }}
      >
        {selectedMarginMode.leverage}x
      </SecondaryButton>
    </div>
  );
}
