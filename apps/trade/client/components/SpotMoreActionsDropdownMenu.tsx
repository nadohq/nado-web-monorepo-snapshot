import { joinClassNames } from '@nadohq/web-common';
import { DropdownUi, IconButton, Icons, SizeVariant } from '@nadohq/web-ui';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { BigNumber } from 'bignumber.js';
import { useShowDialogForProduct } from 'client/hooks/ui/navigation/useShowDialogForProduct';
import { useIsConnected } from 'client/hooks/util/useIsConnected';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { useTranslation } from 'react-i18next';

interface Props {
  triggerSizeVariant: Extract<SizeVariant, 'xs' | 'sm'>;
  productId: number;
  balanceAmount: BigNumber;
}

export function SpotMoreActionsDropdownMenu({
  triggerSizeVariant,
  productId,
  balanceAmount,
}: Props) {
  const { t } = useTranslation();
  const { show } = useDialog();
  const showDialogForProduct = useShowDialogForProduct();

  const isConnected = useIsConnected();
  const isBorrowDisabled = !isConnected;
  const isRepayDisabled = balanceAmount.gte(0);

  const textClassName = (() => {
    return {
      xs: 'text-xs',
      sm: 'text-sm',
    }[triggerSizeVariant];
  })();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <IconButton
          icon={Icons.DotsThreeVerticalBold}
          size={triggerSizeVariant}
        />
      </DropdownMenu.Trigger>
      {/* we use Portal to avoid z-fighting with other table rows and overflow issues with the parent table */}
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          asChild
          align="end"
          sideOffset={4}
          onClick={(event) => {
            /* any click in popover should not trigger row's onClick */
            event.stopPropagation();
          }}
        >
          <DropdownUi.Content
            className={joinClassNames('min-w-24', textClassName)}
          >
            <DropdownMenu.Item asChild>
              <DropdownUi.Item
                disabled={isBorrowDisabled}
                onClick={() => {
                  showDialogForProduct({
                    dialogType: 'borrow',
                    productId,
                  });
                }}
              >
                {t(($) => $.buttons.borrow)}
              </DropdownUi.Item>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <DropdownUi.Item
                disabled={isRepayDisabled}
                onClick={() => {
                  showDialogForProduct({
                    dialogType: 'repay',
                    productId,
                  });
                }}
              >
                {t(($) => $.buttons.repay)}
              </DropdownUi.Item>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <DropdownUi.Item
                onClick={() => {
                  show({
                    type: 'spot_money_market_details',
                    params: {
                      productId,
                    },
                  });
                }}
              >
                {t(($) => $.assetDetails)}
              </DropdownUi.Item>
            </DropdownMenu.Item>
          </DropdownUi.Content>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
