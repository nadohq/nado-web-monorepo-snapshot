import { SecondaryButton } from '@nadohq/web-ui';
import {
  CancelAllOrdersFilter,
  useExecuteCancelAllOrders,
} from 'client/hooks/execute/cancelOrder/useExecuteCancelAllOrders';
import { getOrderSideLabel } from 'client/modules/trading/utils/getOrderSideLabel';
import { Trans, useTranslation } from 'react-i18next';

interface Props {
  cancelOrdersFilter: CancelAllOrdersFilter;
}

/**
 * Mobile component with buttons to cancel orders by direction.
 * Similar to ClosePositionsButtons for positions.
 */
export function CancelOrdersButtons({
  cancelOrdersFilter: { productIds, orderDisplayTypes, iso },
}: Props) {
  const { t } = useTranslation();

  const {
    cancelAllOrders,
    cancelLongOrders,
    cancelShortOrders,
    canCancelAll,
    canCancelLong,
    canCancelShort,
  } = useExecuteCancelAllOrders({
    productIds,
    orderDisplayTypes,
    iso,
  });

  return (
    <div className="grid grid-cols-3 gap-x-2">
      <SecondaryButton
        size="xs"
        disabled={!canCancelAll}
        onClick={cancelAllOrders}
      >
        {t(($) => $.buttons.cancelAll)}
      </SecondaryButton>
      <SecondaryButton
        size="xs"
        className="gap-x-1"
        disabled={!canCancelLong}
        onClick={cancelLongOrders}
      >
        <Trans
          i18nKey={($) => $.buttons.cancelSide}
          values={{
            side: getOrderSideLabel({
              t,
              isPerp: true,
              alwaysShowOrderDirection: true,
              isLong: true,
            }),
          }}
          components={{
            sidecolor: (
              <span className={canCancelLong ? 'text-positive' : undefined} />
            ),
          }}
        />
      </SecondaryButton>
      <SecondaryButton
        size="xs"
        className="gap-x-1"
        disabled={!canCancelShort}
        onClick={cancelShortOrders}
      >
        <Trans
          i18nKey={($) => $.buttons.cancelSide}
          values={{
            side: getOrderSideLabel({
              t,
              isPerp: true,
              alwaysShowOrderDirection: true,
              isLong: false,
            }),
          }}
          components={{
            sidecolor: (
              <span className={canCancelShort ? 'text-negative' : undefined} />
            ),
          }}
        />
      </SecondaryButton>
    </div>
  );
}
