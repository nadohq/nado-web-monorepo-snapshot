import { CollateralSpotProductSelectValue } from 'client/modules/collateral/types';
import { bigNumberComparator } from 'client/utils/comparators';

export function sortByDisplayedAssetValue(
  a: CollateralSpotProductSelectValue,
  b: CollateralSpotProductSelectValue,
) {
  return bigNumberComparator(
    b.displayedAssetValueUsd,
    a.displayedAssetValueUsd,
  );
}
