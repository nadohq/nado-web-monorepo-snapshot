import {
  joinClassNames,
  WithChildren,
  WithClassnames,
} from '@nadohq/web-common';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { SizeVariant } from '../../types';
import { getStateOverlayClassNames } from '../../utils';
import { Icons } from '../Icons';

type CheckboxSizeVariant = Extract<SizeVariant, 'xs' | 'sm'>;

interface CheckboxCheckProps extends RadixCheckbox.CheckboxProps {
  sizeVariant: CheckboxSizeVariant;
  disabled?: boolean;
  dataTestId?: string;
}

function CheckboxCheck({
  checked,
  className,
  sizeVariant,
  disabled,
  dataTestId,
  ...rest
}: CheckboxCheckProps) {
  const stateOverlayClassNames = getStateOverlayClassNames({
    disabled,
    active: checked === true,
    borderRadiusVariant: 'xs',
  });

  const sizeClassNames = {
    xs: 'size-3',
    sm: 'size-4',
  }[sizeVariant];

  const iconSize = {
    xs: 8,
    sm: 10,
  }[sizeVariant];

  return (
    <RadixCheckbox.Root
      {...rest}
      className={joinClassNames(
        'flex shrink-0 items-center justify-center rounded-xs border transition-colors',
        'disabled:border-disabled disabled:cursor-not-allowed',
        checked
          ? 'bg-primary border-primary'
          : 'hover:border-primary border-disabled',
        stateOverlayClassNames,
        sizeClassNames,
        className,
      )}
      disabled={disabled}
      checked={checked}
      data-testid={dataTestId}
    >
      <RadixCheckbox.Indicator>
        <Icons.Check className="text-background" size={iconSize} />
      </RadixCheckbox.Indicator>
    </RadixCheckbox.Root>
  );
}

export interface CheckboxLabelProps extends WithChildren, WithClassnames {
  id: string;
  sizeVariant: CheckboxSizeVariant;
}

function CheckboxLabel({
  id,
  children,
  sizeVariant,
  className,
}: CheckboxLabelProps) {
  const sizeClassNames = {
    xs: 'text-xs',
    sm: 'text-sm',
  }[sizeVariant];

  return (
    <label className={joinClassNames(sizeClassNames, className)} htmlFor={id}>
      {children}
    </label>
  );
}

function CheckboxRow({ children, className }: WithChildren<WithClassnames>) {
  return (
    <div
      className={joinClassNames(
        // `relative` crucial here, as Radix applies absolute positioning and a
        // transform to the checkbox `input`, which in some cases may break layout.
        // See: https://github.com/radix-ui/primitives/issues/2778 for an example.
        'text-text-primary relative flex items-center gap-x-1.5',
        'has-[:disabled]:text-text-tertiary',
        className,
      )}
    >
      {children}
    </div>
  );
}

export const Checkbox = {
  Check: CheckboxCheck,
  Label: CheckboxLabel,
  Row: CheckboxRow,
};
