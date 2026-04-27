import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { CollateralDialogType } from 'client/modules/app/dialogs/types';
import { useCallback } from 'react';

interface Params {
  dialogType: CollateralDialogType;
  productId: number;
  navBehavior?: 'show' | 'push';
}

export function useShowDialogForProduct() {
  const { show, push } = useDialog();

  return useCallback(
    ({ dialogType, productId, navBehavior = 'show' }: Params) => {
      const navFn = navBehavior === 'push' ? push : show;

      switch (dialogType) {
        case 'borrow':
        case 'repay':
        case 'withdraw':
        case 'deposit_options':
          navFn({
            type: dialogType,
            params: {
              initialProductId: productId,
            },
          });
          break;
      }
    },
    [push, show],
  );
}
