import {
  PresetNumberFormatSpecifier,
  formatNumber,
} from '@nadohq/react-client';
import {
  WithClassnames,
  joinClassNames,
  mergeClassNames,
} from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { getRiskClassNames } from 'client/utils/getRiskClassNames';
import { useMemo } from 'react';

interface Props extends WithClassnames {
  maintMarginUsageFraction?: BigNumber;
}

export function MaintMarginUsageBar({
  className,
  maintMarginUsageFraction,
}: Props) {
  const hasShadow = !maintMarginUsageFraction?.isZero();

  const colorClassNames = getRiskClassNames(maintMarginUsageFraction);

  const maintMarginUsageBarWidth = useMemo(() => {
    return formatNumber(maintMarginUsageFraction, {
      formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_INT,
      defaultValue: 0,
    });
  }, [maintMarginUsageFraction]);

  return (
    <div
      className={mergeClassNames(
        'relative isolate rounded-xs',
        'h-1.5 w-16',
        className,
      )}
    >
      <div
        className={joinClassNames(
          'absolute inset-0 -z-10 rounded-xs',
          'from-risk-low via-risk-medium to-risk-extreme bg-linear-to-r opacity-30',
        )}
      />
      <div
        className={joinClassNames(
          'absolute inset-0 origin-left rounded-xs',
          colorClassNames.bg,
          hasShadow && ['shadow-elevation-risk-bar', colorClassNames.shadow],
        )}
        style={{
          width: maintMarginUsageBarWidth,
        }}
      />
    </div>
  );
}
