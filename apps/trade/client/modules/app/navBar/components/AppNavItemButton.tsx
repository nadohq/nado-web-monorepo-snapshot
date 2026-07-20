import { mergeClassNames } from '@nadohq/web-common';
import {
  Button,
  ButtonProps,
  getStateOverlayClassNames,
  Icons,
  StatusIndicator,
} from '@nadohq/web-ui';

export type AppNavItemButtonProps = ButtonProps & {
  withCaret?: boolean;
  active?: boolean;
  /**
   * When enabled, renders a pulsing status indicator to call attention to the
   * item (e.g. a nav dropdown containing a "live" page).
   */
  showLiveIndicator?: boolean;
};

export function AppNavItemButton({
  className,
  withCaret,
  active,
  showLiveIndicator,
  children,
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
    >
      {children}
      {showLiveIndicator && (
        <StatusIndicator sizeVariant="sm" colorVariant="positive" pulse />
      )}
    </Button>
  );
}
