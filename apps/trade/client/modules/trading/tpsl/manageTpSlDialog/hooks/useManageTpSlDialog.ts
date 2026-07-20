import { useExecuteCancelAllOrders } from 'client/hooks/execute/cancelOrder/useExecuteCancelAllOrders';
import { useTpSlOrders } from 'client/hooks/subaccount/useTpSlOrders';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { ORDER_DISPLAY_TYPES_BY_CATEGORY } from 'client/modules/trading/consts/orderDisplayTypesByCategory';
import { useTpSlPositionData } from 'client/modules/trading/tpsl/hooks/useTpSlPositionData';
import { useMemo } from 'react';

interface Params {
  productId: number;
  isIso: boolean;
}

export function useManageTpSlDialog({ productId, isIso }: Params) {
  const { push } = useDialog();
  const { data: tpSlOrdersData } = useTpSlOrders();
  const positionData = useTpSlPositionData({ productId, isIso });

  const orders = useMemo(() => {
    if (!tpSlOrdersData?.[productId]) {
      return [];
    }

    const orderGroup = isIso
      ? tpSlOrdersData[productId].iso
      : tpSlOrdersData[productId].cross;

    return orderGroup?.all;
  }, [tpSlOrdersData, productId, isIso]);

  const {
    cancelAllOrders,
    status: cancelAllStatus,
    canCancelAll: canCancelAllOrders,
  } = useExecuteCancelAllOrders({
    productIds: [productId],
    orderDisplayTypes: ORDER_DISPLAY_TYPES_BY_CATEGORY.tpSl,
    iso: isIso,
  });

  const handleCancelAll = () => {
    cancelAllOrders();
  };

  const handleAddTpSl = () => {
    push({
      type: 'add_tp_sl',
      params: {
        productId,
        isIso,
      },
    });
  };

  return {
    orders,
    cancelAllStatus,
    canCancelAllOrders,
    handleCancelAll,
    handleAddTpSl,
    averageEntryPrice: positionData?.averageEntryPrice,
    positionAmount: positionData?.amount,
  };
}
