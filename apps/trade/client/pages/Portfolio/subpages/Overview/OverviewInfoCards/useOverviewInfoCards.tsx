import { TimeInSeconds } from '@nadohq/client';
import { KNOWN_PRODUCT_IDS, useNlpState } from '@nadohq/react-client';
import { useQuerySubaccountFeeRates } from 'client/hooks/query/subaccount/useQuerySubaccountFeeRates';
import { useSubaccountOverview } from 'client/hooks/subaccount/useSubaccountOverview/useSubaccountOverview';
import { useSubaccountTimespanMetrics } from 'client/hooks/subaccount/useSubaccountTimespanMetrics';
import { getTimespanMetadata } from 'client/modules/charts/utils/timespan';
import { useAddressNlpState } from 'client/modules/nlp/hooks/useAddressNlpState';
import { portfolioTimespanAtom } from 'client/store/portfolioStore';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';

const THIRTY_DAYS_IN_SECONDS = 30 * TimeInSeconds.DAY;

export function useOverviewInfoCards() {
  const { t } = useTranslation();
  const { data: subaccountOverview } = useSubaccountOverview();
  const { data: subaccountFeeRates } = useQuerySubaccountFeeRates();
  const addressNlpState = useAddressNlpState();
  const nlpState = useNlpState();

  // Selected timespan metrics
  const timespanInSeconds = useAtomValue(portfolioTimespanAtom);
  const timespanMetadata = getTimespanMetadata(t, timespanInSeconds);
  const { data: selectedTimespanMetrics } = useSubaccountTimespanMetrics(
    timespanMetadata.timespanInSeconds,
  );

  // 30 days timespan metrics
  const { data: timespan30dMetrics } = useSubaccountTimespanMetrics(
    THIRTY_DAYS_IN_SECONDS,
  );

  return {
    totalEquityUsd: subaccountOverview?.portfolioValueUsd,
    selectedTimespanAccountPnlUsd:
      selectedTimespanMetrics?.deltas.cumulativeAccountPnlUsd,
    timespanMetadata,
    volume30DUsd: timespan30dMetrics?.deltas.cumulativeTotalVolumeUsd,
    feeTierFractions: subaccountFeeRates?.orders?.[KNOWN_PRODUCT_IDS.btcPerp],
    nlpBalanceUsd: addressNlpState?.balanceValueUsd,
    nlpAprFraction: nlpState?.apr,
  };
}
