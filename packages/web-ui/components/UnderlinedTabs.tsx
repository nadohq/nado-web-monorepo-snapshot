import { joinClassNames } from '@nadohq/web-common';
import { Button as BaseButton, TabButtonProps } from './Button';

function Button({
  className,
  active,
  disabled,
  dataTestId,
  ...rest
}: TabButtonProps) {
  const activeButtonClasses = 'text-text-primary after:scale-x-100';
  const inactiveButtonClasses = joinClassNames(
    'text-text-tertiary after:scale-x-0',
    !disabled && 'hover:text-text-primary',
  );
  const underlineClasses =
    'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-accent after:transition-transform after:transform-gpu';

  return (
    <BaseButton
      dataTestId={dataTestId}
      className={joinClassNames(
        'relative py-3 text-center text-sm font-medium',
        active ? activeButtonClasses : inactiveButtonClasses,
        underlineClasses,
        className,
      )}
      disabled={disabled}
      {...rest}
    />
  );
}

export const UnderlinedTabs = {
  Button,
};
