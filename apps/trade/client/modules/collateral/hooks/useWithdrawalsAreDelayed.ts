import { useQueryLatestEventSubmissionIndex } from 'client/hooks/query/useQueryLatestEventSubmissionIndex';
import { useQueryNSubmissions } from 'client/hooks/query/useQueryNSubmissions';
import { useMemo } from 'react';

export function useWithdrawalsAreDelayed() {
  const { data: latestEventSubmissionIndexData } =
    useQueryLatestEventSubmissionIndex();
  const { data: nSubmissionsData } = useQueryNSubmissions();

  return useMemo(() => {
    if (!latestEventSubmissionIndexData || !nSubmissionsData) {
      return false;
    }

    // There's a backlog of events if latestEventSubmissionIndex is much larger than nSubmissions
    return latestEventSubmissionIndexData.minus(nSubmissionsData).gt(1000);
  }, [latestEventSubmissionIndexData, nSubmissionsData]);
}
