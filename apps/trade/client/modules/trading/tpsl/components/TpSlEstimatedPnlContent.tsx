import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { TpSlOrderFormPriceState } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { Trans } from 'react-i18next';

interface Props {
  priceState: TpSlOrderFormPriceState;
}

/**
 * Renders the estimated PnL line for a single TP or SL section.
 * Returns null when the section doesn't have the data required to compute PnL.
 */
export function TpSlEstimatedPnlContent({ priceState }: Props) {
  const { estimatedPnlUsd, estimatedPnlFrac, isTakeProfit } = priceState;

  if (!estimatedPnlUsd || !estimatedPnlFrac) {
    return null;
  }

  const isProfit = estimatedPnlUsd.isPositive();

  const formattedEstimatedPnlUsd = formatNumber(estimatedPnlUsd, {
    formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
  });
  const formattedEstimatedPnlFrac = formatNumber(estimatedPnlFrac, {
    formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_INT,
  });

  return (
    <p
      className="text-text-tertiary text-left text-xs"
      data-testid={isTakeProfit ? 'tpsl-estimated-tp' : 'tpsl-estimated-sl'}
    >
      <Trans
        i18nKey={
          isProfit
            ? ($) => $.tpslEstimatedPnl.profit
            : ($) => $.tpslEstimatedPnl.loss
        }
        values={{
          usd: formattedEstimatedPnlUsd,
          roe: formattedEstimatedPnlFrac,
        }}
        components={{
          highlight: (
            <span className={getSignDependentColorClassName(estimatedPnlUsd)} />
          ),
        }}
      />
    </p>
  );
}
