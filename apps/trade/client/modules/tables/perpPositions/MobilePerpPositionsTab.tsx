import { SecondaryButton } from '@nadohq/web-ui';
import {
  CloseAllPositionsFilter,
  useExecuteCloseAllPositions,
} from 'client/hooks/execute/placeOrder/useExecuteCloseAllPositions';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { DialogParams } from 'client/modules/app/dialogs/types';
import { useIsSingleSignatureSession } from 'client/modules/singleSignatureSessions/hooks/useIsSingleSignatureSession';
import { MobilePerpPositionsCard } from 'client/modules/tables/perpPositions/MobilePerpPositionsCard';
import { usePerpPositionsTable } from 'client/modules/tables/perpPositions/usePerpPositionsTable';
import { MobileDataTabCards } from 'client/modules/tables/tabs/mobile/components/MobileDataTabCards';
import { useCallback } from 'react';
import { Trans, useTranslation } from 'react-i18next';

interface Props {
  productIds?: number[];
}

export function MobilePerpPositionsTab({ productIds }: Props) {
  const { positions, isLoading } = usePerpPositionsTable({ productIds });
  const { show } = useDialog();
  const isSingleSignatureSession = useIsSingleSignatureSession({
    requireActive: true,
  });

  return (
    <MobileDataTabCards
      emptyTablePlaceholderType="perp_positions"
      isLoading={isLoading}
      hasData={!!positions?.length}
    >
      <ClosePositionsButtons productIds={productIds} showDialog={show} />
      {positions?.map((position, key) => {
        return (
          <MobilePerpPositionsCard
            key={key}
            position={position}
            isSingleSignatureSession={isSingleSignatureSession}
            showDialog={show}
          />
        );
      })}
    </MobileDataTabCards>
  );
}

interface ClosePositionsButtons {
  productIds: number[] | undefined;
  showDialog: (dialog: DialogParams) => void;
}

function ClosePositionsButtons({
  productIds,
  showDialog,
}: ClosePositionsButtons) {
  const { t } = useTranslation();

  const { numLongPositions, numShortPositions, numPositions, canClose } =
    useExecuteCloseAllPositions({ productIds });

  const onShowDialog = useCallback(
    (params: CloseAllPositionsFilter) => {
      showDialog({
        type: 'close_all_positions',
        params,
      });
    },
    [showDialog],
  );

  if (!canClose) {
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-x-2">
      <SecondaryButton
        size="xs"
        disabled={!numPositions}
        onClick={() => {
          onShowDialog({ productIds });
        }}
      >
        {t(($) => $.buttons.closeAll)}
      </SecondaryButton>
      <SecondaryButton
        size="xs"
        className="gap-x-1"
        disabled={!numLongPositions}
        onClick={() => {
          onShowDialog({
            productIds,
            onlySide: 'long',
          });
        }}
      >
        <Trans
          i18nKey={($) => $.buttons.closeSide}
          values={{
            side: t(($) => $.long),
          }}
          components={{
            sidecolor: (
              <span
                className={numLongPositions ? 'text-positive' : undefined}
              />
            ),
          }}
        />
      </SecondaryButton>
      <SecondaryButton
        size="xs"
        className="gap-x-1"
        disabled={!numShortPositions}
        onClick={() => {
          onShowDialog({
            productIds,
            onlySide: 'short',
          });
        }}
      >
        <Trans
          i18nKey={($) => $.buttons.closeSide}
          values={{
            side: t(($) => $.short),
          }}
          components={{
            sidecolor: (
              <span
                className={numShortPositions ? 'text-negative' : undefined}
              />
            ),
          }}
        />
      </SecondaryButton>
    </div>
  );
}
