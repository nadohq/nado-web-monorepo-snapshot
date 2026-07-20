import { removeDecimals, TimeInSeconds, toBigNumber } from '@nadohq/client';
import { BigNumber } from 'bignumber.js';
import { useQueryAddressPoints } from 'client/modules/points/hooks/useQueryAddressPoints';
import { PointsTier } from 'client/modules/points/types';
import { use7dAvgDailyVolumeUsd } from 'client/pages/Points/hooks/use7dAvgDailyVolumeUsd';
import { useMemo, useState } from 'react';

function calcWeeklyPointsPool(avgDailyVolumeUsd: BigNumber): number {
  const totalPoints = toBigNumber(300_000).plus(
    toBigNumber(650_000).multipliedBy(
      // BigNumber does not support non-integer powers
      avgDailyVolumeUsd.dividedBy(2e9).toNumber() ** 1.5,
    ),
  );

  return BigNumber.min(totalPoints, 950_000).toNumber();
}

export function usePointsPageData() {
  const { data } = useQueryAddressPoints();
  const { data: avgDailyVolumeUsd } = use7dAvgDailyVolumeUsd();
  const [timeOfMountMillis] = useState(() => Date.now());

  const mappedData = useMemo(() => {
    if (!data) {
      return undefined;
    }

    const { pointsPerEpoch, allTimePoints } = data;

    // Epochs are in ascending order, so reverse to find last completed week easily
    // The first item is the current week that has NOT ended yet
    // The first "regular epoch" (start date != end date) is the last ended week
    const [currentEpoch, ...prevEpochs] = pointsPerEpoch.toReversed();
    const lastCompletedEpoch = prevEpochs.find(
      (epoch) => !epoch.startTime.eq(epoch.endTime),
    );

    // Calculate next epoch cutoff time
    const nextEpochCutoffTimeMillis = (() => {
      if (!currentEpoch) {
        return undefined;
      }

      const currentEpochEndTimeMillis = currentEpoch.endTime.toNumber() * 1000;

      // If current time > end time of current week, add another week, this is because backend does not distribute / update points right away
      if (timeOfMountMillis > currentEpochEndTimeMillis) {
        return currentEpochEndTimeMillis + TimeInSeconds.DAY * 7 * 1000;
      }

      return currentEpochEndTimeMillis;
    })();

    // Last week's data for the tier card
    const lastWeekPoints = removeDecimals(lastCompletedEpoch?.points);
    const lastWeekRank = lastCompletedEpoch?.rank;
    const lastWeekTier = lastCompletedEpoch?.tier as PointsTier | undefined;

    const decimalAdjustedAvgDailyVol = removeDecimals(avgDailyVolumeUsd);
    const weeklyPointsPool = decimalAdjustedAvgDailyVol
      ? calcWeeklyPointsPool(decimalAdjustedAvgDailyVol)
      : undefined;

    return {
      nextEpochCutoffTimeMillis,
      lastWeekPoints,
      lastWeekRank,
      lastWeekTier,
      allTimePoints: removeDecimals(allTimePoints.points),
      allTimeRank: allTimePoints.rank,
      avgDailyVolumeUsd: decimalAdjustedAvgDailyVol,
      weeklyPointsPool,
    };
  }, [data, timeOfMountMillis, avgDailyVolumeUsd]);

  return {
    data: mappedData,
  };
}
