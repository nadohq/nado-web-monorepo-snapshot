import { mergeClassNames } from '@nadohq/web-common';
import { DistributedOmit } from 'type-fest';
import { getStateOverlayClassNames } from '../../utils';
import { Button } from './Button';
import { STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME } from './consts';
import { ButtonProps } from './types';

export type TabButtonProps = DistributedOmit<ButtonProps, 'isLoading'> & {
  active?: boolean;
  dataTestId?: string;
};

export function TabButton({
  className,
  active,
  dataTestId,
  ...rest
}: TabButtonProps) {
  const stateOverlayClassNames = getStateOverlayClassNames({
    borderRadiusVariant: 'sm',
    disabled: rest.disabled,
    active,
  });

  return (
    <Button
      dataTestId={dataTestId}
      className={mergeClassNames(
        'bg-surface-2 rounded-md px-2.5 text-sm',
        STANDARD_BUTTON_VERTICAL_PADDING_CLASSNAME['xs'],
        active ? 'text-text-primary' : 'text-text-tertiary',
        stateOverlayClassNames,
        className,
      )}
      {...rest}
    />
  );
}
