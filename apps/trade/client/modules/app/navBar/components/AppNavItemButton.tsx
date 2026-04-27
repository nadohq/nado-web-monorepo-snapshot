import { mergeClassNames } from '@nadohq/web-common';
import {
  Button,
  ButtonProps,
  getStateOverlayClassNames,
  Icons,
} from '@nadohq/web-ui';

export type AppNavItemButtonProps = ButtonProps & {
  withCaret?: boolean;
  active?: boolean;
};

export function AppNavItemButton({
  className,
  withCaret,
  active,
  ...rest
}: AppNavItemButtonProps) {
  const stateOverlayClassNames = getStateOverlayClassNames({
    borderRadiusVariant: 'sm',
    disabled: rest.disabled,
  });

  return (
    <Button
      className={mergeClassNames(
        'group flex items-center justify-start gap-x-1',
        'rounded-sm p-3 font-medium',
        active
          ? 'text-text-primary'
          : 'text-text-tertiary hover:text-text-primary data-[state="open"]:text-text-primary',
        stateOverlayClassNames,
        className,
      )}
      endIcon={
        withCaret && (
          <Icons.CaretDown className='group-data-[state="open"]:rotate-180' />
        )
      }
      {...rest}
    />
  );
}
