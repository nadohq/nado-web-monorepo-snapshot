import { ProductEngineType, SubaccountSummaryState } from '@nadohq/client';
import {
  AnnotatedBalanceWithProduct,
  PerpProductMetadata,
  SpotProductMetadata,
} from '@nadohq/react-client';
import { sortBy } from 'lodash';

/**
 * Annotated balances that include metadata
 */
export type AnnotatedSubaccountSummary = Omit<
  SubaccountSummaryState,
  'balances'
> & {
  balances: AnnotatedBalanceWithProduct[];
};

interface Params {
  summary: SubaccountSummaryState;
  getSpotMetadata: (productId: number) => SpotProductMetadata | undefined;
  getPerpMetadata: (productId: number) => PerpProductMetadata | undefined;
}

export function annotateSubaccountSummary({
  summary,
  getSpotMetadata,
  getPerpMetadata,
}: Params): AnnotatedSubaccountSummary {
  // Map the data to annotated balances
  const balances: AnnotatedBalanceWithProduct[] = [];
  // Sort by ascending product ID
  sortBy(summary.balances, 'productId').forEach((balance) => {
    if (balance.type === ProductEngineType.SPOT) {
      const metadata = getSpotMetadata(balance.productId);
      if (!metadata) {
        return;
      }

      balances.push({
        ...balance,
        metadata,
      });
    } else if (balance.type === ProductEngineType.PERP) {
      const metadata = getPerpMetadata(balance.productId);
      if (!metadata) {
        return;
      }

      balances.push({
        ...balance,
        metadata,
      });
    }
  });

  return {
    health: summary.health,
    balances,
  };
}
