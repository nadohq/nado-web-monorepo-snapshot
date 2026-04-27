import { useProductIdLinks } from 'client/hooks/ui/navigation/useProductIdLinks';
import { ROUTES } from 'client/modules/app/consts/routes';
import { get, startsWith } from 'lodash';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface Params {
  productId: number;
}

export function usePushTradePage() {
  const { push, replace } = useRouter();
  const pathname = usePathname();
  const productIdLinks = useProductIdLinks();

  const isOnSpot = startsWith(pathname, ROUTES.spotTrading);
  const isOnPerp = startsWith(pathname, ROUTES.perpTrading);

  return useCallback(
    async ({ productId }: Params) => {
      const productIdLink = get(productIdLinks, productId, undefined);

      if (!productIdLink) {
        return;
      }

      // If already on the correct page, do a replace instead of a push
      const useReplace =
        (isOnSpot && startsWith(productIdLink, ROUTES.spotTrading)) ||
        (isOnPerp && startsWith(productIdLink, ROUTES.perpTrading));
      const routerUpdateFn = useReplace ? replace : push;

      routerUpdateFn(productIdLink);
    },
    [productIdLinks, isOnSpot, isOnPerp, replace, push],
  );
}
