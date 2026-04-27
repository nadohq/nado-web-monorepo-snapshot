import { TimeInSeconds } from '@nadohq/client';
import { useMemo } from 'react';
import { useQueryNlpSnapshots } from '../query/nlp/useQueryNlpSnapshots';

// This hook fetches the last two 30 day period snapshots.
// This is to avoid multiple queries for the same data.
export function useNlp30dSnapshots() {
  const { data: nlpSnapshots } = useQueryNlpSnapshots({
    granularity: 30 * TimeInSeconds.DAY,
    limit: 2,
  });

  return useMemo(() => {
    if (!nlpSnapshots) {
      return {};
    }

    const [latestSnapshot, earliestSnapshot] = nlpSnapshots.snapshots;

    return {
      earliestSnapshot,
      latestSnapshot,
    };
  }, [nlpSnapshots]);
}
