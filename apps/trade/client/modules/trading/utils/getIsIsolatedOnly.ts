interface GetIsIsolatedOnlyParams {
  productId: number | undefined;
  marketRestrictions: Record<number, { isolatedOnly: boolean }> | undefined;
  /** Admin-tools toggle that lets cross be selected on iso-only markets. */
  enableCrossMarginForIsoOnlyMarkets: boolean;
}

/**
 * Pure helper for callers that already have `marketRestrictions` and the
 * admin-tools override in hand (e.g. inside callbacks over many product IDs).
 */
export function getIsIsolatedOnly({
  productId,
  marketRestrictions,
  enableCrossMarginForIsoOnlyMarkets,
}: GetIsIsolatedOnlyParams): boolean {
  if (productId === undefined) {
    return false;
  }

  return (
    Boolean(marketRestrictions?.[productId]?.isolatedOnly) &&
    !enableCrossMarginForIsoOnlyMarkets
  );
}
