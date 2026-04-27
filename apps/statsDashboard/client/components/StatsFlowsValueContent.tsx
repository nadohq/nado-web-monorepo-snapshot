import { formatNumber, NumberFormatValue } from '@nadohq/react-client';
import { Pill } from '@nadohq/web-ui';

interface Props {
  inflows: NumberFormatValue | undefined;
  inflowsLabel: string;
  outflows: NumberFormatValue | undefined;
  outflowsLabel: string;
  symbol?: string;
  formatSpecifier: string;
}

export function StatsFlowsValueContent({
  inflows,
  inflowsLabel,
  symbol,
  outflows,
  outflowsLabel,
  formatSpecifier,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-x-1">
        {formatNumber(inflows, {
          formatSpecifier,
        })}
        <span>{symbol}</span>
        <Pill className="font-normal" colorVariant="positive" sizeVariant="xs">
          {inflowsLabel}
        </Pill>
      </div>
      <span className="text-stroke">/</span>
      <div className="flex items-center gap-x-1">
        {formatNumber(outflows, {
          formatSpecifier,
        })}
        <span>{symbol}</span>
        <Pill className="font-normal" colorVariant="negative" sizeVariant="xs">
          {outflowsLabel}
        </Pill>
      </div>
    </div>
  );
}
