import { mergeClassNames } from '@nadohq/web-common';
import { BorderRadiusVariant, SizeVariant } from '../../types';
import { getStateOverlayClassNames } from '../../utils/';
import { Button } from './Button';
import {
  STANDARD_BUTTON_HORIZONTAL_PADDING_CLASSNAME,
  STANDARD_BUTTON_TEXT_SIZE_CLASSNAME,
  STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME,
} from './consts';
import { ButtonProps } from './types';

export type PrimaryButtonProps = Exclude<ButtonProps, 'size'> & {
  size?: SizeVariant;
  borderRadiusVariant?: Extract<BorderRadiusVariant, 'sm' | 'none'>;
};

/**
 * PrimaryButton component represents a primary button in the UI.
 *
 * @param className - Additional class names to apply to the button.
 * @param size - The size of the button. Default is 'base'.
 */
export function PrimaryButton({
  className,
  size = 'base',
  ...rest
}: PrimaryButtonProps) {
  const stateOverlayClassNames = getStateOverlayClassNames({
    borderRadiusVariant: 'sm',
    disabled: rest.disabled,
    isLoading: rest.isLoading,
  });

  const stateClassNames = (() => {
    if (rest.isLoading || rest.disabled) {
      return 'bg-surface-3 text-text-primary';
    }
    return 'text-text-button-primary';
  })();

  return (
    <Button
      className={mergeClassNames(
        'bg-primary rounded-sm font-medium',
        stateClassNames,
        stateOverlayClassNames,
        STANDARD_BUTTON_TEXT_SIZE_CLASSNAME[size],
        STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME[size],
        STANDARD_BUTTON_HORIZONTAL_PADDING_CLASSNAME[size],
        className,
      )}
      {...rest}
    />
  );
}
