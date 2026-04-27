import {
  useQueryListSubaccounts,
  useSubaccountContext,
} from '@nadohq/react-client';
import { useMemo } from 'react';

/**
 * Returns the creation time (in UNIX seconds) for the subaccount, Data is null if the subaccount does not exist.
 */
export function useSubaccountCreationTime(): number | null | undefined {
  const { currentSubaccount } = useSubaccountContext();
  const { data: allSubaccounts } = useQueryListSubaccounts();

  return useMemo(() => {
    // No connected wallet - consider this to not exist
    if (!currentSubaccount.address) {
      return null;
    }
    // Still loading data
    if (!allSubaccounts) {
      return undefined;
    }

    return (
      allSubaccounts.find(
        (subaccount) => subaccount.subaccountName === currentSubaccount.name,
      )?.createdAt ?? null
    );
  }, [allSubaccounts, currentSubaccount.address, currentSubaccount.name]);
}
