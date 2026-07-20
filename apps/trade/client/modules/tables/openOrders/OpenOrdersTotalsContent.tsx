import {
  CustomNumberFormatSpecifier,
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@nadohq/react-client';
import { Divider } from '@nadohq/web-ui';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import {
  OpenOrdersTotalsSubTabId,
  useOpenOrdersTotals,
} from 'client/modules/tables/openOrders/hooks/useOpenOrdersTotals';
import { getSignDependentColorClassName } from 'client/utils/ui/getSignDependentColorClassName';
import { useTranslation } from 'react-i18next';

interface Props {
  /** The active sub-tab — totals reflect only this sub-tab's orders. */
  activeSubTabId: OpenOrdersTotalsSubTabId;
  productIds?: number[];
}

/**
 * Summary of the order value total and net delta for the active open orders
 * sub-tab, shown inline with the sub-tab pills.
 */
export function OpenOrdersTotalsContent({ activeSubTabId, productIds }: Props) {
  const { t } = useTranslation();
  const totals = useOpenOrdersTotals({ activeSubTabId, productIds });

  return (
    <div
      // Vertical padding is only on mobile to match the sub-tab pills.
      className="flex items-center gap-x-2 px-3 py-2.5 sm:py-0"
    >
      <ValueWithLabel.Horizontal
        fitWidth
        sizeVariant="xs"
        label={t(($) => $.totals)}
        labelClassName="label-separator"
        valueContent={formatNumber(totals?.totalOrderValueUsd, {
          formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
        })}
        dataTestId="open-orders-total-value"
      />
      <Divider vertical className="h-2" />
      <ValueWithLabel.Horizontal
        fitWidth
        sizeVariant="xs"
        label={t(($) => $.netDelta)}
        labelClassName="label-separator"
        valueClassName={getSignDependentColorClassName(totals?.netDeltaUsd)}
        valueContent={formatNumber(totals?.netDeltaUsd, {
          formatSpecifier: CustomNumberFormatSpecifier.SIGNED_CURRENCY_2DP,
        })}
        dataTestId="open-orders-net-delta"
      />
    </div>
  );
}
