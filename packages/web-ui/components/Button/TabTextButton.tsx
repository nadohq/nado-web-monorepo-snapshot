import { joinClassNames } from '@nadohq/web-common';
import { DistributedOmit } from 'type-fest';
import { TextButton } from './TextButton';
import { ButtonProps } from './types';

export type TabTextButtonProps = DistributedOmit<ButtonProps, 'isLoading'> & {
  active: boolean;
  dataTestId?: string;
};

export function TabTextButton({
  className,
  active,
  dataTestId,
  ...rest
}: TabTextButtonProps) {
  return (
    <TextButton
      colorVariant="tertiary"
      className={joinClassNames(
        'font-medium',
        active && 'text-text-primary',
        className,
      )}
      {...rest}
      dataTestId={dataTestId}
    />
  );
}
