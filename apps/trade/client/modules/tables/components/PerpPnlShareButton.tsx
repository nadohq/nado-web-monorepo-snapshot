import { BaseTestProps } from '@nadohq/web-common';
import { Icons, TextButton } from '@nadohq/web-ui';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { PerpPnlSocialSharingDialogParams } from 'client/modules/trading/perpPnlSocialSharing/PerpPnlSocialSharingDialog';
import { SetOptional } from 'type-fest';

interface Props
  extends
    SetOptional<
      PerpPnlSocialSharingDialogParams,
      'pnlFrac' | 'pnlUsd' | 'entryPrice' | 'positionAmount'
    >,
    BaseTestProps {}

export function PerpPnlShareButton({
  pnlFrac,
  pnlUsd,
  entryPrice,
  productId,
  positionAmount,
  referencePrice,
  referencePriceLabel,
  marginModeType,
  isoLeverage,
  dataTestId,
}: Props) {
  const { show } = useDialog();

  // Only show button if all required props are defined
  if (!pnlFrac || !pnlUsd || !entryPrice || !positionAmount) {
    return null;
  }

  return (
    <TextButton
      startIcon={<Icons.ShareFatFill />}
      className="p-2 text-xs"
      colorVariant="secondary"
      dataTestId={dataTestId}
      onClick={() => {
        show({
          type: 'perp_pnl_social_sharing',
          params: {
            productId,
            positionAmount,
            pnlFrac,
            pnlUsd,
            entryPrice,
            referencePrice,
            referencePriceLabel,
            marginModeType,
            isoLeverage,
          },
        });
      }}
    />
  );
}
