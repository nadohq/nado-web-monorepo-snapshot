import { removeDecimals } from '@nadohq/client';
import { useExecuteClosePositionWithNotification } from 'client/hooks/execute/placeOrder/useExecuteClosePositionWithNotification';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { usePerpPositions } from 'client/hooks/subaccount/usePerpPositions';
import { useUserStateError } from 'client/hooks/subaccount/useUserStateError';
import { useSyncedRef } from 'client/hooks/util/useSyncedRef';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useEnableQuickMarketClose } from 'client/modules/trading/hooks/useEnableQuickMarketClose';
import { useCallback } from 'react';

interface HandleMarketClosePositionParams {
  productId: number;
  isoSubaccountName: string | undefined;
}

/**
 * Either shows the ClosePositionDialog or immediately executes a market close,
 * depending on user settings and data availability.
 */
export function useHandleMarketClosePosition() {
  const { show } = useDialog();
  const { enableQuickMarketClose } = useEnableQuickMarketClose();
  const { closePositionWithNotification } =
    useExecuteClosePositionWithNotification();
  const { data: positionsData } = usePerpPositions();
  const { data: staticMarketsData } = useAllMarketsStaticData();

  const userStateError = useUserStateError();

  const positionsDataRef = useSyncedRef(positionsData);
  const staticMarketsDataRef = useSyncedRef(staticMarketsData);

  return useCallback(
    (params: HandleMarketClosePositionParams) => {
      const { productId, isoSubaccountName } = params;

      const shouldShowDialog =
        userStateError !== undefined || !enableQuickMarketClose;

      if (shouldShowDialog) {
        show({
          type: 'close_position',
          params: {
            ...params,
            isLimitOrder: false,
          },
        });
        return;
      }

      const perpPositionItem = positionsDataRef.current?.find((position) => {
        const matchesProductId = position.productId === productId;
        const matchesMarginMode =
          position.iso?.subaccountName === isoSubaccountName;

        return matchesProductId && matchesMarginMode;
      });

      const marketData = staticMarketsDataRef.current?.perpMarkets[productId];

      if (!perpPositionItem || !marketData) {
        return;
      }

      const size = perpPositionItem.amount.abs();

      closePositionWithNotification({
        productId,
        limitPrice: undefined,
        size,
        isoSubaccountName: perpPositionItem.iso?.subaccountName,
        fraction: 1,
        positionAmount: perpPositionItem.amount,
        metadata: {
          ...perpPositionItem.metadata,
          priceIncrement: marketData?.priceIncrement,
          sizeIncrement: removeDecimals(marketData?.sizeIncrement),
        },
      });
    },
    [
      enableQuickMarketClose,
      show,
      userStateError,
      positionsDataRef,
      staticMarketsDataRef,
      closePositionWithNotification,
    ],
  );
}
