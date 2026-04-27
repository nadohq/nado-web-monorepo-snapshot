import { BaseTestProps, WithChildren } from '@nadohq/web-common';
import { CountIndicator, DropdownUi, SecondaryButton } from '@nadohq/web-ui';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  CloseAllPositionsFilter,
  useExecuteCloseAllPositions,
} from 'client/hooks/execute/placeOrder/useExecuteCloseAllPositions';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { getOrderSideLabel } from 'client/modules/trading/utils/getOrderSideLabel';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  closePositionsFilter: CloseAllPositionsFilter;
}

export function CloseAllPositionsDropdown({
  closePositionsFilter: { productIds },
}: Props) {
  const { t } = useTranslation();
  const { show } = useDialog();
  const { canClose, numLongPositions, numShortPositions, numPositions } =
    useExecuteCloseAllPositions({ productIds });

  const onShowDialog = useCallback(
    (params: CloseAllPositionsFilter) => {
      show({
        type: 'close_all_positions',
        params,
      });
    },
    [show],
  );

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger disabled={!canClose} asChild>
        <SecondaryButton
          destructive
          // Override the default padding to match the height of the header row
          className="py-1.5"
          size="xs"
          disabled={!canClose}
          dataTestId="close-all-positions-dropdown-button"
        >
          {t(($) => $.buttons.closePositions)}
        </SecondaryButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content asChild align="end" sideOffset={4}>
          <DropdownUi.Content className="min-w-40 text-xs">
            <CloseAllPositionsDropdownItem
              count={numPositions}
              disabled={!numPositions}
              onClick={() => {
                onShowDialog({ productIds });
              }}
              dataTestId="close-all-positions-dropdown-item-all"
            >
              {t(($) => $.buttons.closeAll)}
            </CloseAllPositionsDropdownItem>
            <CloseAllPositionsDropdownItem
              count={numLongPositions}
              disabled={!numLongPositions}
              onClick={() => {
                onShowDialog({ productIds, onlySide: 'long' });
              }}
              dataTestId="close-all-positions-dropdown-item-long"
            >
              {t(($) => $.buttons.close)}
              <span className={numLongPositions ? 'text-positive' : undefined}>
                {getOrderSideLabel({
                  t,
                  isPerp: true,
                  alwaysShowOrderDirection: false,
                  isLong: true,
                })}
              </span>
            </CloseAllPositionsDropdownItem>
            <CloseAllPositionsDropdownItem
              count={numShortPositions}
              disabled={!numShortPositions}
              onClick={() => {
                onShowDialog({ productIds, onlySide: 'short' });
              }}
              dataTestId="close-all-positions-dropdown-item-short"
            >
              {t(($) => $.buttons.close)}
              <span className={numShortPositions ? 'text-negative' : undefined}>
                {getOrderSideLabel({
                  t,
                  isPerp: true,
                  alwaysShowOrderDirection: false,
                  isLong: false,
                })}
              </span>
            </CloseAllPositionsDropdownItem>
          </DropdownUi.Content>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

interface CloseAllPositionsDropdownItemProps
  extends BaseTestProps, WithChildren {
  count: number;
  disabled: boolean;
  onClick(): void;
}

function CloseAllPositionsDropdownItem({
  children,
  count,
  disabled,
  onClick,
  dataTestId,
}: CloseAllPositionsDropdownItemProps) {
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
