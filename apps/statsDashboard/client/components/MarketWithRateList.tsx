import {
  formatNumber,
  NumberFormatSpecifier,
  NumberFormatValue,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { Label, Value } from '@nadohq/web-ui';
import {
  StatsDataCard,
  StatsDataCardProps,
} from 'client/components/StatsDataCard';
import { ReactNode } from 'react';

interface MarketWithRateListItemData {
  asset: string;
  rate: NumberFormatValue;
}

interface MarketWithRateListCardProps extends StatsDataCardProps<MarketWithRateListItemData> {
  renderListItem: (data: MarketWithRateListItemData) => ReactNode;
}

function MarketWithRateListCard({
  title,
  description,
  headerSelectComponent,
  data,
  renderListItem,
  isLoading,
}: MarketWithRateListCardProps) {
  return (
    <StatsDataCard
      title={title}
      description={description}
      headerSelectComponent={headerSelectComponent}
      data={data}
      isLoading={isLoading}
      contentClassName="grid flex-initial justify-stretch gap-x-12 lg:grid-flow-col lg:grid-rows-8"
    >
      {data?.map(renderListItem)}
    </StatsDataCard>
  );
}

interface MarketWithRateListItemProps {
  asset: string;
  rate: NumberFormatValue;
  formatSpecifier?: NumberFormatSpecifier;
  rateClassName?: string;
}

function MarketWithRateListItem({
  asset,
  rate,
  formatSpecifier = PresetNumberFormatSpecifier.PERCENTAGE_UPTO_4DP,
  rateClassName,
}: MarketWithRateListItemProps) {
  return (
    <div className="border-overlay-divider flex items-center justify-between border-b py-1">
      <Label sizeVariant="sm" className="text-text-primary font-medium">
        {asset}
      </Label>
      <Value
        sizeVariant="xs"
        className={joinClassNames('font-medium', rateClassName)}
      >
        {formatNumber(rate, {
          formatSpecifier,
        })}
      </Value>
    </div>
  );
}

export const MarketWithRateList = {
  Card: MarketWithRateListCard,
  Item: MarketWithRateListItem,
};
