import { useSubaccountCreationTime } from 'client/hooks/subaccount/useSubaccountCreationTime';
import { useSubaccountOverview } from 'client/hooks/subaccount/useSubaccountOverview/useSubaccountOverview';

/**
 * A subaccount is created on deposit
 */
export function useRequiresInitialDeposit() {
  const { data: subaccountOverview } = useSubaccountOverview();
  const subaccountCreationTime = useSubaccountCreationTime();

  // useSubaccountCreationTime returns null if the subaccount does not exist, and undefined when data has not yet loaded
  // However, subaccountCreationTime can sometimes be inaccurate right after an initial deposit, so double check with the
  // total portfolio value
  return Boolean(
    subaccountCreationTime === null &&
    subaccountOverview?.portfolioValueUsd.isZero(),
  );
}
