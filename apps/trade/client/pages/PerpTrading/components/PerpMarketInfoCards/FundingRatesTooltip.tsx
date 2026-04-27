import {
  formatNumber,
  FundingRates,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { BaseDefinitionTooltip } from '@nadohq/web-ui';
import { FundingRatePeriod } from 'client/modules/localstorage/userState/types/userFundingRatePeriodTypes';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { isEmpty } from 'lodash';
import { useTranslation } from 'react-i18next';

/**
 * Info icon with tooltip displaying funding rates by time period.
 * @param fundingRates - Funding rates for different time periods
 */
export function FundingRatesTooltip({
  fundingRates,
}: {
  fundingRates?: FundingRates;
}) {
  const { t } = useTranslation();
  if (isEmpty(fundingRates)) {
    return null;
  }

  return (
    <BaseDefinitionTooltip
      title=""
      tooltipOptions={{ placement: 'bottom' }}
      decoration={{ icon: { size: 12, className: 'text-text-secondary' } }}
      content={
        <div className="flex flex-col gap-y-1">
          {Object.entries(fundingRates).map(([period, rate]) => {
            const periodLabelKey = getFundingRatePeriodLabel(
              period as FundingRatePeriod,
            );
            return (
              <div key={period} className="flex justify-between gap-x-20">
                <span className="uppercase">
                  {t(($) => $.durations[periodLabelKey])}
                </span>
                <div className={getSignDependentColorClassName(rate)}>
                  {formatNumber(rate, {
                    formatSpecifier:
                      PresetNumberFormatSpecifier.SIGNED_PERCENTAGE_4DP,
                  })}
                </div>
              </div>
            );
          })}
        </div>
      }
    />
  );
}

function getFundingRatePeriodLabel(
  period: FundingRatePeriod,
): `label${FundingRatePeriod}` {
  return `label${period}`;
}
