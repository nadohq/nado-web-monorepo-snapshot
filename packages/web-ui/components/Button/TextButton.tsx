import { mergeClassNames } from '@nadohq/web-common';
import { DistributedOmit } from 'type-fest';
import { Button } from './Button';
import { ButtonProps } from './types';

export type TextButtonProps = DistributedOmit<ButtonProps, 'isLoading'> & {
  colorVariant: 'primary' | 'secondary' | 'accent' | 'tertiary';
  dataTestId?: string;
};

export function TextButton({
  children,
  className,
  colorVariant,
  dataTestId,
  ...rest
}: TextButtonProps) {
  const colorVariantClassName = {
    accent: 'text-accent hover:text-accent hover:brightness-110',
    primary: 'text-text-primary',
    secondary: 'text-text-secondary hover:text-text-primary',
    tertiary: 'text-text-tertiary hover:text-text-secondary',
  }[colorVariant];

  return (
    <Button
      className={mergeClassNames(
        'disabled:text-disabled disabled:hover:text-disabled',
        'transition-colors',
        'gap-x-1.5',
        colorVariantClassName,
        className,
      )}
      {...rest}
      dataTestId={dataTestId}
    >
      {children}
    </Button>
  );
}
