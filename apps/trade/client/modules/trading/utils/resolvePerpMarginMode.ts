import {
  MarginMode,
  MarginModeType,
} from 'client/modules/localstorage/userState/types/tradingSettings';

interface ResolvePerpMarginModeParams {
  /** Whether the market is iso-only (RWAs etc.) and cross is not allowed. */
  isIsolatedOnly: boolean;
  /** Max leverage for the market; defaults to 1 when undefined. */
  marketMaxLeverage: number | undefined;
  /** Per-product user selection from saved settings, undefined if never set. */
  savedMarginModeForProduct: MarginMode | undefined;
  /** Global default margin mode type from saved settings. */
  defaultMarginModeType: MarginModeType;
}

/**
 * Pure resolver shared by `useSelectedPerpMarginMode` and the chart broker.
 * Applies max-leverage clamping and iso-only / default fallbacks so the same
 * persisted user state produces the same MarginMode regardless of caller.
 */
export function resolvePerpMarginMode({
  isIsolatedOnly,
  marketMaxLeverage,
  savedMarginModeForProduct,
  defaultMarginModeType,
}: ResolvePerpMarginModeParams): MarginMode {
  const maxLeverage = marketMaxLeverage ?? 1;
  const selectedLeverage = Math.min(
    savedMarginModeForProduct?.leverage ?? maxLeverage,
    maxLeverage,
  );
  const selectedIsoEnableBorrows =
    savedMarginModeForProduct?.enableBorrows ?? true;

  if (isIsolatedOnly) {
    return {
      mode: 'isolated',
      leverage: selectedLeverage,
      enableBorrows: selectedIsoEnableBorrows,
    };
  }

  if (!savedMarginModeForProduct) {
    switch (defaultMarginModeType) {
      case 'isolated':
        return {
          mode: 'isolated',
          // Without a saved setting, these will just be computed as defaults
          leverage: selectedLeverage,
          enableBorrows: selectedIsoEnableBorrows,
        };
      case 'cross':
        return {
          mode: 'cross',
          leverage: selectedLeverage,
        };
    }
  }

  // Perform a sanity check on the saved leverage selection
  return {
    ...savedMarginModeForProduct,
    leverage: selectedLeverage,
  };
}
