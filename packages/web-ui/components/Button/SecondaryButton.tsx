import { mergeClassNames } from '@nadohq/web-common';
import { SizeVariant } from '../../types';
import { getStateOverlayClassNames } from '../../utils';
import { Button } from './Button';
import {
  STANDARD_BUTTON_HORIZONTAL_PADDING_CLASSNAME,
  STANDARD_BUTTON_TEXT_SIZE_CLASSNAME,
  STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME,
} from './consts';
import { ButtonProps } from './types';

export type SecondaryButtonProps = ButtonProps & {
  size?: SizeVariant;
  destructive?: boolean;
};

/**
 * @param size - The size of the button. Default is 'base'.
 * @param destructive - Whether the button is destructive or not. Default is false.
 */
export function SecondaryButton({
  size = 'base',
  className,
  destructive,
  dataTestId,
  ...rest
}: SecondaryButtonProps) {
  const stateOverlayClassNames = getStateOverlayClassNames({
    borderRadiusVariant: 'sm',
    disabled: rest.disabled,
    isLoading: rest.isLoading,
  });

  const stateClassNames = (() => {
    if (rest.isLoading || rest.disabled) {
      return 'bg-surface-3 text-text-primary';
    }
    return destructive ? 'text-negative' : 'text-text-primary';
  })();

  return (
    <Button
      className={mergeClassNames(
        'bg-surface-2 rounded-sm font-medium',
        stateClassNames,
        stateOverlayClassNames,
        STANDARD_BUTTON_HORIZONTAL_PADDING_CLASSNAME[size],
        STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME[size],
        STANDARD_BUTTON_TEXT_SIZE_CLASSNAME[size],
        className,
      )}
      dataTestId={dataTestId}
      {...rest}
    />
  );
}
