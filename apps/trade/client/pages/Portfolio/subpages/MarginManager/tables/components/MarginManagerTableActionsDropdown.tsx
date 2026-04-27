import { DropdownUi, Icons, SecondaryButton } from '@nadohq/web-ui';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CollateralDialogType } from 'client/modules/app/dialogs/types';

export type MarginManagerActionType =
  | CollateralDialogType
  | 'trade_spot'
  | 'trade_perp';

export interface MarginManagerDropdownAction {
  type: MarginManagerActionType;
  label: string;
  productId: number;
}

interface Props {
  actions: MarginManagerDropdownAction[];
  performOnClickAction: (action: MarginManagerDropdownAction) => void;
}

export function MarginManagerTableActionsDropdown({
  actions,
  performOnClickAction,
}: Props) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <SecondaryButton size="xs">
          <Icons.DotsThreeVerticalBold size={12} />
        </SecondaryButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content asChild sideOffset={4} side="left" align="end">
        <DropdownUi.Content>
          {actions.map((action: MarginManagerDropdownAction) => {
            const { type, label } = action;

            return (
              <DropdownMenu.Item key={type} asChild>
                <DropdownUi.Item
                  className="capitalize"
                  onClick={() => performOnClickAction(action)}
                >
                  {label}
                </DropdownUi.Item>
              </DropdownMenu.Item>
            );
          })}
        </DropdownUi.Content>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
