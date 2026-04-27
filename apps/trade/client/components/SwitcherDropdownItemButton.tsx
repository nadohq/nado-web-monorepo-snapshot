import { mergeClassNames } from '@nadohq/web-common';
import { DropdownUi, DropdownUiItemProps } from '@nadohq/web-ui';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { StatusIndicator } from 'client/components/StatusIndicator';
import { ReactNode } from 'react';

type Props = DropdownUiItemProps & {
  label: ReactNode;
  labelContainerClassName?: string;
  sublabel?: string;
};

export function SwitcherDropdownItemButton({
  label,
  active,
  sublabel,
  labelContainerClassName,
  ...rest
}: Props) {
  return (
    <DropdownMenu.Item asChild>
      <DropdownUi.Item
        endIcon={
          active && <StatusIndicator sizeVariant="sm" colorVariant="positive" />
        }
        {...rest}
      >
        {/* Extra container need to stack content and not interfere with icons */}
        <div className="flex flex-1 flex-col gap-y-1.5 overflow-hidden text-left">
          <div
            className={mergeClassNames(
              'text-text-primary truncate text-sm',
              labelContainerClassName,
            )}
          >
            {label}
          </div>
          <div className="text-text-tertiary truncate empty:hidden">
            {sublabel}
          </div>
        </div>
      </DropdownUi.Item>
    </DropdownMenu.Item>
  );
}
