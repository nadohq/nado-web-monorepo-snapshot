import { PriceTriggerCriteria } from '@nadohq/client';
import { formatNumber } from '@nadohq/react-client';
import { mergeClassNames, WithClassnames } from '@nadohq/web-common';
import { getIsTriggerPriceAbove } from 'client/modules/trading/utils/trigger/getIsTriggerPriceAbove';
import { getTriggerReferencePriceType } from 'client/modules/trading/utils/trigger/getTriggerReferencePriceType';
import { getTriggerReferencePriceTypeLabel } from 'client/modules/trading/utils/trigger/getTriggerReferencePriceTypeLabel';
import { useTranslation } from 'react-i18next';

interface Props {
  priceTriggerCriteria: PriceTriggerCriteria;
  formatSpecifier: string;
}

export function OrderPriceTriggerCondition({
  className,
  priceTriggerCriteria,
  formatSpecifier,
}: WithClassnames<Props>) {
  const { t } = useTranslation();

  const formattedPrice = formatNumber(priceTriggerCriteria.triggerPrice, {
    formatSpecifier,
  });
  const triggerCriteriaPriceIsAbove = getIsTriggerPriceAbove(
    priceTriggerCriteria.type,
  );
  const triggerReferencePriceType =
    getTriggerReferencePriceType(priceTriggerCriteria);

  return (
    <div className={mergeClassNames('flex flex-col gap-y-1.5', className)}>
      <div>
        {getTriggerReferencePriceTypeLabel(t, triggerReferencePriceType)}
      </div>
      <div>
        {triggerCriteriaPriceIsAbove ? '>' : '<'} {formattedPrice}
      </div>
    </div>
  );
}
