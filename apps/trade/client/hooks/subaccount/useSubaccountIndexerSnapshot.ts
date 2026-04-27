import { IndexerSubaccountSnapshot } from '@nadohq/client';
import { useQuerySubaccountIndexerSnapshots } from 'client/hooks/query/subaccount/useQuerySubaccountIndexerSnapshots';
import { first } from 'lodash';
import { useMemo } from 'react';

function select(
  data: IndexerSubaccountSnapshot[],
): IndexerSubaccountSnapshot | undefined {
  return first(data);
}

/**
 * useQuerySubaccountIndexerSnapshots but for a single snapshot timestamp
 * @param secondsBeforeNow The number of seconds before now to query for, defaults to 0
 * @returns The indexer snapshot
 */
export function useSubaccountIndexerSnapshot(secondsBeforeNow: number = 0) {
  const multiSecondsBeforeNow = useMemo(
    () => [secondsBeforeNow],
    [secondsBeforeNow],
  );

  return useQuerySubaccountIndexerSnapshots({
    secondsBeforeNow: multiSecondsBeforeNow,
    select,
  });
}
