import { removeDecimals } from '@nadohq/client';
import { formatTimestamp, TimeFormatSpecifier } from '@nadohq/web-ui';
import { BigNumber } from 'bignumber.js';
import { WithDataTableRowId } from 'client/components/DataTable/types';
import { useQueryAddressPoints } from 'client/modules/points/hooks/useQueryAddressPoints';
import { TIER_INFO_BY_POINTS_TIER } from 'client/modules/points/tierInfoByPointsTier';
import { PointsTier } from 'client/modules/points/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface PointsTableItem extends WithDataTableRowId {
  epochDate: string;
  epochName: string;
  points: BigNumber;
  rank: number | undefined;
  tierName: string | undefined;
}

export function usePointsTable() {
  const { t } = useTranslation();
  const { data, isLoading } = useQueryAddressPoints();

  const tableData = useMemo(() => {
    if (!data) {
      return undefined;
    }

    // Data is in ascending order, with the latest epoch being a "placeholder" that we need to exclude
    return data.pointsPerEpoch
      .slice(0, -1)
      .toReversed()
      .map((epochData): PointsTableItem => {
        // 1-time airdrops have end time > start time
        const isRegularEpoch = epochData.endTime.gt(epochData.startTime);

        const epochDate = (() => {
          const startDate = formatTimestamp(
            epochData.startTime.toNumber() * 1000,
            {
              formatSpecifier: TimeFormatSpecifier.MONTH_D_YYYY,
            },
          );
          const endDate = formatTimestamp(epochData.endTime.toNumber() * 1000, {
            formatSpecifier: TimeFormatSpecifier.MONTH_D_YYYY,
          });

          if (isRegularEpoch) {
            return t(($) => $.dateRangeStartDateEndDate, {
              startDate,
              endDate,
            });
          }

          return startDate;
        })();

        const tierInfo = TIER_INFO_BY_POINTS_TIER[epochData.tier as PointsTier];

        return {
          rowId: epochData.epoch.toString(),
          epochDate,
          epochName: epochData.description,
          points: removeDecimals(epochData.points),
          rank: isRegularEpoch ? epochData.rank : undefined,
          tierName:
            isRegularEpoch && tierInfo
              ? t(($) => $.tierNames[tierInfo.tierId])
              : undefined,
        };
      });
  }, [data, t]);

  return {
    data: tableData,
    isLoading,
  };
}
