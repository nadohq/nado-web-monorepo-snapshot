import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { joinClassNames } from '@nadohq/web-common';
import { TpSlOrderFormPriceState } from 'client/modules/trading/tpsl/hooks/useTpSlOrderForm/types';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { Trans } from 'react-i18next';

interface Props {
  tpState?: TpSlOrderFormPriceState;
  slState?: TpSlOrderFormPriceState;
}

export function TpSlDialogEstimatedPnl({ tpState, slState }: Props) {
  const hasTp =
    tpState?.estimatedPnlUsd &&
    tpState?.estimatedPnlFrac &&
    tpState?.hasRequiredValues;

  const hasSl =
    slState?.estimatedPnlUsd &&
    slState?.estimatedPnlFrac &&
    slState?.hasRequiredValues;

  if (!hasTp && !hasSl) {
    return null;
  }

  return (
    <p
      className="text-text-tertiary text-left text-xs"
      data-testid="tpsl-dialog-estimated-pnl"
    >
      <EstimationSummary
        tpState={hasTp ? tpState : undefined}
        slState={hasSl ? slState : undefined}
      />
    </p>
  );
}

function EstimationSummary({ tpState, slState }: Props) {
  if (tpState && slState) {
    return (
      <Trans
        i18nKey={($) => $.tpslEstimatedPnlBoth}
        components={[
          <PnlText key="tp" priceState={tpState} />,
          <PnlText key="sl" priceState={slState} />,
        ]}
      />
    );
  }

  // We know at least one exists because of the check in the parent
  // But the type system doesn't for this component in isolation
  const activeState = tpState ?? slState;
  if (!activeState) {
    return null;
  }

  return (
    <Trans
      i18nKey={($) => $.tpslEstimatedPnlSingle}
      components={[<PnlText key="0" priceState={activeState} />]}
    />
  );
}

function PnlText({ priceState }: { priceState: TpSlOrderFormPriceState }) {
  if (
    !priceState.estimatedPnlUsd ||
    !priceState.estimatedPnlFrac ||
    !priceState.hasRequiredValues
  ) {
    return null;
  }

  const type = priceState.isTakeProfit ? 'tp' : 'sl';
  const outcome = priceState.estimatedPnlUsd.isPositive() ? 'profit' : 'loss';

  const usdFormatted = formatNumber(priceState.estimatedPnlUsd, {
    formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
  });
  const fracFormatted = formatNumber(priceState.estimatedPnlFrac, {
    formatSpecifier: PresetNumberFormatSpecifier.PERCENTAGE_INT,
  });

  const colorClassName = joinClassNames(
    'text-nowrap',
    getSignDependentColorClassName(priceState.estimatedPnlUsd),
  );

  // Key examples: tpslEstimatedPnlPart.tp.profit, tpslEstimatedPnlPart.sl.loss
  return (
    <Trans
      i18nKey={($) => $.tpslEstimatedPnlParts[type][outcome]}
      values={{
        usd: usdFormatted,
        roe: fracFormatted,
      }}
      components={[<span key="0" className={colorClassName} />]}
    />
  );
}
