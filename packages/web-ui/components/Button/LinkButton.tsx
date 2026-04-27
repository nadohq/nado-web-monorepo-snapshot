import { mergeClassNames } from '@nadohq/web-common';
import { Icons } from '../Icons';
import { Button } from './Button';
import { ButtonProps } from './types';

export type LinkButtonProps = ButtonProps & {
  colorVariant: 'accent' | 'primary' | 'secondary';
  withExternalIcon?: boolean;
};

export function LinkButton({
  className,
  colorVariant,
  disabled,
  withExternalIcon,
  ...rest
}: LinkButtonProps) {
  const textColor = {
    accent: 'text-accent',
    secondary: 'text-text-secondary',
    primary: 'text-text-primary',
  }[colorVariant];

  const hoverTextColor = {
    accent: 'hover:brightness-110',
    secondary: 'hover:text-text-primary',
    primary: '',
  }[colorVariant];

  return (
    <Button
      className={mergeClassNames(
        'gap-x-1 underline transition-colors',
        textColor,
        // Must conditionally test for disabled prop since :disabled selector doesn't work for link components
        disabled ? 'brightness-75' : hoverTextColor,
        className,
      )}
      endIcon={withExternalIcon ? <Icons.ArrowUpRight /> : rest.endIcon}
      disabled={disabled}
      {...rest}
    />
  );
}
