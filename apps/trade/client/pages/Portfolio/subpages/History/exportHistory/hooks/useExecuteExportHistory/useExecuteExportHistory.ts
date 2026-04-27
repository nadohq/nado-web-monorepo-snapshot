import { toPrintableObject } from '@nadohq/client';
import { AppSubaccount, useSubaccountContext } from '@nadohq/react-client';
import { CsvDataItem, CsvFileName, downloadCsv } from '@nadohq/web-common';
import { useMutation } from '@tanstack/react-query';
import { logExecuteError } from 'client/hooks/execute/util/logExecuteError';
import {
  useExecuteInValidContext,
  ValidExecuteContext,
} from 'client/hooks/execute/util/useExecuteInValidContext';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { getExportHistoryDepositsData } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/getExportHistoryDepositsData';
import { getExportHistoryEngineOrdersData } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/getExportHistoryEngineOrdersData';
import { getExportHistoryFundingData } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/getExportHistoryFundingData';
import { getExportHistoryInterestData } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/getExportHistoryInterestData';
import { getExportHistoryLiquidationsData } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/getExportHistoryLiquidationsData';
import { getExportHistoryNlpData } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/getExportHistoryNlpData';
import { getExportHistoryPriceTriggerOrdersData } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/getExportHistoryPriceTriggerOrdersData';
import { getExportHistorySettlementsData } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/getExportHistorySettlementsData';
import { getExportHistoryTimeTriggerOrdersData } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/getExportHistoryTimeTriggerOrdersData';
import { getExportHistoryTradesData } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/getExportHistoryTradesData';
import { getExportHistoryTransfersData } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/getExportHistoryTransfersData';
import { getExportHistoryWithdrawalsData } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/getExportHistoryWithdrawalsData';
import { GetExportHistoryDataContext } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/types';
import { getExportHistoryHeadingsByType } from 'client/pages/Portfolio/subpages/History/exportHistory/hooks/useExecuteExportHistory/utils';
import { GetExportHistoryDataParams } from 'client/pages/Portfolio/subpages/History/exportHistory/types';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Hook to retrieve historical data and download it as a CSV
 */
export function useExecuteExportHistory(
  setProgressFrac: (frac: number) => void,
) {
  const { t } = useTranslation();

  const { getSubaccountProfile } = useSubaccountContext();
  const { data: allMarketsStaticData } = useAllMarketsStaticData();

  const mutationFn = useExecuteInValidContext(
    useCallback(
      async (
        params: GetExportHistoryDataParams,
        context: ValidExecuteContext,
      ) => {
        if (!allMarketsStaticData) {
          throw new Error('[useExecuteExportHistory] No market data available');
        }

        console.log('Exporting history', toPrintableObject(params));

        setProgressFrac(0);

        const getDataContext: GetExportHistoryDataContext = {
          allMarketsStaticData,
          nadoClient: context.nadoClient,
          subaccount: context.subaccount,
          getSubaccountProfile,
          setProgressFrac,
          t,
        };

        const data: CsvDataItem[] = await (() => {
          switch (params.type) {
            case 'deposits':
              return getExportHistoryDepositsData(params, getDataContext);
            case 'withdrawals':
              return getExportHistoryWithdrawalsData(params, getDataContext);
            case 'transfers':
              return getExportHistoryTransfersData(params, getDataContext);
            case 'trades':
              return getExportHistoryTradesData(params, getDataContext);
            case 'nlp':
              return getExportHistoryNlpData(params, getDataContext);
            case 'settlements':
              return getExportHistorySettlementsData(params, getDataContext);
            case 'liquidations':
              return getExportHistoryLiquidationsData(params, getDataContext);
            case 'funding_payments':
              return getExportHistoryFundingData(params, getDataContext);
            case 'interest_payments':
              return getExportHistoryInterestData(params, getDataContext);
            case 'historical_engine_orders':
              return getExportHistoryEngineOrdersData(params, getDataContext);
            case 'historical_stop_orders':
              return getExportHistoryPriceTriggerOrdersData(
                params,
                getDataContext,
                { reduceOnly: false },
              );
            case 'historical_tp_sl':
              return getExportHistoryPriceTriggerOrdersData(
                params,
                getDataContext,
                { reduceOnly: true },
              );
            case 'historical_twap':
              return getExportHistoryTimeTriggerOrdersData(
                params,
                getDataContext,
              );
          }
        })();

        setProgressFrac(1);

        downloadCsv(
          data,
          getExportHistoryCsvFileName({
            ...params,
            subaccount: context.subaccount,
          }),
          getExportHistoryHeadingsByType(t)[params.type],
        );

        return data;
      },
      [allMarketsStaticData, getSubaccountProfile, setProgressFrac, t],
    ),
  );

  return useMutation({
    mutationFn,
    onError(error, variables) {
      logExecuteError('ExportHistory', error, variables);
    },
  });
}

interface GetExportHistoryCsvFileNameParams extends GetExportHistoryDataParams {
  subaccount: AppSubaccount;
}

function getExportHistoryCsvFileName({
  subaccount: { name, address, chainEnv },
  type,
  startTimeMillis,
  endTimeMillis,
}: GetExportHistoryCsvFileNameParams): CsvFileName {
  // Last 4 chars of the address
  const addressIdentifier = address?.slice(-6);

  return `${addressIdentifier}_${name}_${chainEnv}_${type}_${startTimeMillis}_${endTimeMillis}.csv`;
}
