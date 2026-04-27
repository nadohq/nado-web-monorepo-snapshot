import {
  CustomNumberFormatSpecifier,
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import {
  BaseTestProps,
  mergeClassNames,
  WithClassnames,
} from '@nadohq/web-common';
import { BigNumber } from 'bignumber.js';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';

interface Props extends BaseTestProps, WithClassnames {
  pnlUsd: BigNumber | undefined;
  pnlFrac: BigNumber | undefined;
}

export function PnlValueWithPercentage({
  dataTestId,
  className,
  pnlUsd,
  pnlFrac,
}: Props) {
  return (
    <div
      className={mergeClassNames(
        'flex gap-x-1',
        getSignDependentColorClassName(pnlUsd),
        className,
      )}
      data-testid={dataTestId}
    >
      <span>
        {formatNumber(pnlUsd, {
          formatSpecifier: CustomNumberFormatSpecifier.SIGNED_CURRENCY_2DP,
        })}
      </span>
      {/* Only render percentage when available to avoid noisy `-- (--)` display */}
      {pnlFrac && (
        <span>
          (
          {formatNumber(pnlFrac, {
            formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_2DP,
          })}
          )
        </span>
      )}
    </div>
  );
}
