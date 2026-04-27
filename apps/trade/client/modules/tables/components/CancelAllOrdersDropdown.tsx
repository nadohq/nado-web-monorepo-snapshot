import { BaseTestProps, WithChildren } from '@nadohq/web-common';
import { CountIndicator, DropdownUi, SecondaryButton } from '@nadohq/web-ui';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  CancelAllOrdersFilter,
  useExecuteCancelAllOrders,
} from 'client/hooks/execute/cancelOrder/useExecuteCancelAllOrders';
import { getOrderSideLabel } from 'client/modules/trading/utils/getOrderSideLabel';
import { useTranslation } from 'react-i18next';

interface Props {
  cancelOrdersFilter: CancelAllOrdersFilter;
}

export function CancelAllOrdersDropdown({ cancelOrdersFilter }: Props) {
  const { t } = useTranslation();

  const {
    cancelAllOrders,
    cancelLongOrders,
    cancelShortOrders,
    numOrders,
    numLongOrders,
    numShortOrders,
    canCancelAll,
    canCancelLong,
    canCancelShort,
  } = useExecuteCancelAllOrders(cancelOrdersFilter);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger disabled={!canCancelAll} asChild>
        <SecondaryButton
          // Override the default padding to match the height of the header row
          className="py-1.5"
          destructive
          size="xs"
          disabled={!canCancelAll}
          data-testid="cancel-all-orders-dropdown-button"
        >
          {t(($) => $.buttons.cancelOrders)}
        </SecondaryButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content asChild align="end" sideOffset={4}>
          <DropdownUi.Content className="min-w-40 text-xs">
            <CancelAllOrdersDropdownItem
              count={numOrders}
              disabled={!canCancelAll}
              onClick={cancelAllOrders}
              dataTestId="cancel-all-orders-dropdown-item-all"
            >
              {t(($) => $.buttons.cancelAll)}
            </CancelAllOrdersDropdownItem>
            <CancelAllOrdersDropdownItem
              count={numLongOrders}
              disabled={!canCancelLong}
              onClick={cancelLongOrders}
              dataTestId="cancel-all-orders-dropdown-item-long"
            >
              {t(($) => $.buttons.cancel)}{' '}
              <span className={canCancelLong ? 'text-positive' : undefined}>
                {getOrderSideLabel({
                  t,
                  isPerp: true,
                  alwaysShowOrderDirection: true,
                  isLong: true,
                })}
              </span>
            </CancelAllOrdersDropdownItem>
            <CancelAllOrdersDropdownItem
              count={numShortOrders}
              disabled={!canCancelShort}
              onClick={cancelShortOrders}
              dataTestId="cancel-all-orders-dropdown-item-short"
            >
              {t(($) => $.buttons.cancel)}{' '}
              <span className={canCancelShort ? 'text-negative' : undefined}>
                {getOrderSideLabel({
                  t,
                  isPerp: true,
                  alwaysShowOrderDirection: true,
                  isLong: false,
                })}
              </span>
            </CancelAllOrdersDropdownItem>
          </DropdownUi.Content>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

interface CancelAllOrdersDropdownItemProps extends WithChildren, BaseTestProps {
  count: number;
  disabled: boolean;
  onClick(): void;
}

function CancelAllOrdersDropdownItem({
  children,
  count,
  disabled,
  onClick,
  dataTestId,
}: CancelAllOrdersDropdownItemProps) {
  return (
    <DropdownMenu.Item asChild>
      <DropdownUi.Item
        className="gap-x-1"
        disabled={disabled}
        onClick={onClick}
        endIcon={
          <CountIndicator className="ml-auto" count={count} variant="primary" />
        }
        dataTestId={dataTestId}
      >
        {children}
      </DropdownUi.Item>
    </DropdownMenu.Item>
  );
}
