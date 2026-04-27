import { BigNumber } from 'bignumber.js';

export interface SubaccountOverview {
  /** Includes both cross & isolated */
  portfolioValueUsd: BigNumber;
  accountLeverage: BigNumber;
  /** Max of 1 */
  marginUsageFractionBounded: BigNumber;
  /** Max of 1 */
  maintMarginUsageFractionBounded: BigNumber;
  /** Min of 0, Maint health */
  maintMarginBoundedUsd: BigNumber;
  /** Min of 0, Initial health */
  initialMarginBoundedUsd: BigNumber;
  /** Calculated with "fast" oracle prices */
  totalUnrealizedPnlUsd: BigNumber;
  totalCumulativeVolumeUsd: BigNumber | undefined;
  spot: {
    /** Includes both cross & isolated total net margin */
    netTotalBalanceUsd: BigNumber;
    netCrossBalanceUsd: BigNumber;
    totalBorrowsValueUsd: BigNumber;
    totalDepositsValueUsd: BigNumber;
    averageBorrowAPYFraction: BigNumber;
    averageDepositAPYFraction: BigNumber;
    averageAPYFraction: BigNumber;
    totalNetInterestCumulativeUsd: BigNumber;
    /** Calculated with "fast" oracle prices */
    totalUnrealizedPnlUsd: BigNumber;
  };
  perp: {
    totalNotionalValueUsd: BigNumber;
    /** Calculated with "fast" oracle prices */
    totalUnrealizedPnlUsd: BigNumber;
    totalUnrealizedPnlFrac: BigNumber;
    cross: {
      totalNotionalValueUsd: BigNumber;
      totalUnsettledQuote: BigNumber;
      /** Calculated with "fast" oracle prices */
      totalUnrealizedPnlUsd: BigNumber;
      totalUnrealizedPnlFrac: BigNumber;
      totalMarginUsedUsd: BigNumber;
    };
    iso: {
      totalNotionalValueUsd: BigNumber;
      totalNetMarginUsd: BigNumber;
      /** Calculated with "fast" oracle prices */
      totalUnrealizedPnlUsd: BigNumber;
      totalUnrealizedPnlFrac: BigNumber;
    };
  };
}
