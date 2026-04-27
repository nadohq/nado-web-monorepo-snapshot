import {
  LatestOrderFill,
  LatestOrderFillsForProductParams,
  useQueryLatestOrderFillsForProduct,
} from 'client/hooks/query/markets/useQueryLatestOrderFillsForProduct';
import { first } from 'lodash';

interface Params {
  productId: number | undefined;
}

const select: LatestOrderFillsForProductParams<
  LatestOrderFill | undefined
>['select'] = (data) => first(data);

export function useLatestOrderFill({ productId }: Params) {
  return useQueryLatestOrderFillsForProduct({
    productId,
    select,
  });
}
