import {
  formatNumber,
  PresetNumberFormatSpecifier,
  signDependentValue,
} from '@nadohq/react-client';
import { Icons } from '@nadohq/web-ui';

interface Props {
  value: number;
  fractionalValue?: number;
}

export function SignedCurrencyChangeMetric({ value, fractionalValue }: Props) {
  return (
    <div className="flex items-center gap-x-0.5 leading-3">
      {signDependentValue(value, {
        negative: <Icons.ArrowDown className="text-negative shrink-0" />,
        positive: <Icons.ArrowUp className="text-positive shrink-0" />,
        zero: null,
      })}
      <div className="flex items-baseline gap-x-1.5">
        {formatNumber(Math.abs(value), {
          formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
        })}
        <span className="text-text-tertiary text-xs">
          {fractionalValue != null &&
            formatNumber(Math.abs(fractionalValue), {
              formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
            })}
        </span>
      </div>
    </div>
  );
}
