import {
  BaseTestProps,
  joinClassNames,
  mergeClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';
import * as BaseSwitch from '@radix-ui/react-switch';

interface SwitchToggleProps extends BaseTestProps {
  id: string;
  checked: boolean;
  disabled?: boolean;

  onCheckedChange(checked: boolean): void;
}

function SwitchToggle({
  id,
  checked,
  disabled,
  onCheckedChange,
  dataTestId,
}: SwitchToggleProps) {
  return (
    <BaseSwitch.Root
      className="data-[state=checked]:bg-accent bg-disabled relative h-4 w-8 rounded-full"
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      data-testid={dataTestId}
    >
      <BaseSwitch.Thumb
        className={joinClassNames(
          'bg-surface-card block size-3 rounded-full',
          'translate-x-0.5 transform-gpu duration-100',
          'will-change-transform data-[state=checked]:translate-x-4.5',
        )}
      />
    </BaseSwitch.Root>
  );
}

export interface SwitchLabelProps extends WithChildren {
  id: string;
  className?: string;
}

function SwitchLabel({ id, children, className }: SwitchLabelProps) {
  return (
    <label
      className={mergeClassNames('text-text-primary', className)}
      htmlFor={id}
    >
      {children}
    </label>
  );
}

interface SwitchRowProps extends WithChildren, WithClassnames {
  disabled?: boolean;
}

function SwitchRow({ disabled, children, className }: SwitchRowProps) {
  return (
    <div
      className={mergeClassNames(
        'flex items-center justify-between text-sm',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        className,
      )}
    >
      {children}
    </div>
  );
}

export const Switch = {
  Toggle: SwitchToggle,
  Label: SwitchLabel,
  Row: SwitchRow,
};
