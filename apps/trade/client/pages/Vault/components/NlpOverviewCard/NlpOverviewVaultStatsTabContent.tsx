import {
  CustomNumberFormatSpecifier,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { PnlValueWithPercentage } from 'client/components/PnlValueWithPercentage';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { ChartTimespan } from 'client/modules/charts/types';
import { getTimespanMetadata } from 'client/modules/charts/utils/timespan';
import { NlpOverviewCardTabContent } from 'client/pages/Vault/components/NlpOverviewCard/components/NlpOverviewCardTabContent';
import { useNlpOverviewCard } from 'client/pages/Vault/components/NlpOverviewCard/useNlpOverviewCard';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useTranslation } from 'react-i18next';

interface Props {
  selectedTimespan: ChartTimespan;
}

export function NlpOverviewVaultStatsTabContent({ selectedTimespan }: Props) {
  const { t } = useTranslation();
  const selectedTimespanMetadata = getTimespanMetadata(t, selectedTimespan);
  const { data } = useNlpOverviewCard({ timespan: selectedTimespan });

  return (
    <NlpOverviewCardTabContent>
      <ValueWithLabel.Horizontal
        sizeVariant="xs"
        label={t(($) => $.totalPnl)}
        value={data?.totalPnlUsd}
        numberFormatSpecifier={PresetNumberFormatSpecifier.SIGNED_CURRENCY_2DP}
        valueClassName={getSignDependentColorClassName(data?.totalPnlUsd)}
      />
      <ValueWithLabel.Horizontal
        sizeVariant="xs"
        label={t(($) => $.timespanReturn, {
          timespan: selectedTimespanMetadata.label,
        })}
        valueContent={
          <PnlValueWithPercentage
            pnlUsd={data?.pnlUsd}
            pnlFrac={data?.pnlFrac}
          />
        }
      />
      <ValueWithLabel.Horizontal
        sizeVariant="xs"
        label={t(($) => $.volume)}
        value={data?.volumeUsd}
        numberFormatSpecifier={
          CustomNumberFormatSpecifier.CURRENCY_LARGE_ABBREVIATED
        }
      />
      <ValueWithLabel.Horizontal
        sizeVariant="xs"
        label={t(($) => $.maxDrawdown)}
        value={data?.maxDrawdownFrac}
        numberFormatSpecifier={PresetNumberFormatSpecifier.PERCENTAGE_2DP}
        tooltip={{ id: 'nlpMaxDrawdown' }}
      />
    </NlpOverviewCardTabContent>
  );
}
