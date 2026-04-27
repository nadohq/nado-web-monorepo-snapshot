import { joinClassNames, mergeClassNames } from '@nadohq/web-common';
import * as RadixDialog from '@radix-ui/react-dialog';
import { Z_INDEX } from '../../consts';
import { AnimationContainer } from '../AnimationContainer';
import { ConditionalAsChild } from '../ConditionalAsChild';
import { DIALOG_HORIZONTAL_PADDING } from './consts';
import {
  BaseDialogBodyProps,
  BaseDialogFooterProps,
  BaseDialogProps,
  BaseDialogTitleProps,
} from './types';

/**
 * A container for the dialog content. This container is animated and pops in on mounting.
 *
 * @param open - Whether the dialog is open
 * @param onOpenChange - A callback function that is called when the dialog is opened or closed
 * @param className - A string of class names to apply to the dialog content
 * @param children - The content of the dialog
 */
function DialogContainer({
  open,
  onOpenChange,
  className,
  children,
}: BaseDialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Overlay
        className={joinClassNames(
          'bg-overlay-dialog',
          'fixed inset-0',
          'flex items-center justify-center',
          Z_INDEX.dialogOverlay,
        )}
      >
        <RadixDialog.Content
          // Need to pass this because we're not using `Radix.Description`.
          // See https://www.radix-ui.com/primitives/docs/components/dialog#description.
          aria-describedby={undefined}
          // Sonner bug workaround: https://github.com/radix-ui/primitives/issues/2690#issuecomment-2009617202
          onPointerDownOutside={(e) => {
            // don't dismiss dialog when clicking inside the toast
            if (
              e.target instanceof Element &&
              e.target.closest('[data-sonner-toast]')
            ) {
              e.preventDefault();
            }
          }}
          asChild
        >
          <AnimationContainer.PopIn
            // Disabling the opacity change for a smoother transition during dialog navigation
            disableFadeIn
            initialYOffset={20}
            className={mergeClassNames(
              'w-120 max-w-[95vw]',
              'relative flex flex-col',
              'overflow-hidden rounded-xl',
              'bg-surface-card text-text-tertiary',
              'shadow-elevation-dialog',
              className,
              Z_INDEX.dialogContainer,
            )}
            dataTestId="base-dialog-container"
          >
            {children}
          </AnimationContainer.PopIn>
        </RadixDialog.Content>
      </RadixDialog.Overlay>
    </RadixDialog.Root>
  );
}

function Title({ className, children }: BaseDialogTitleProps) {
  return (
    <RadixDialog.Title
      className={mergeClassNames(
        'text-text-primary text-lg font-medium',
        'border-overlay-divider h-12 border-b',
        DIALOG_HORIZONTAL_PADDING,
        className,
      )}
      data-testid="base-dialog-title"
    >
      {children}
    </RadixDialog.Title>
  );
}

function Body({ children, className, asChild }: BaseDialogBodyProps) {
  return (
    <ConditionalAsChild
      asChild={asChild}
      fallback="div"
      className={mergeClassNames(
        'flex flex-col gap-y-4 py-4',
        // Prevent dialog content from overflowing the screen
        'no-scrollbar max-h-[75vh] overflow-x-hidden overflow-y-auto',
        'text-text-secondary text-sm',
        DIALOG_HORIZONTAL_PADDING,
        className,
      )}
      dataTestId="base-dialog-body"
    >
      {children}
    </ConditionalAsChild>
  );
}

function Footer({ className, children }: BaseDialogFooterProps) {
  return (
    <div
      className={mergeClassNames(
        'border-overlay-divider border-t',
        'py-2',
        DIALOG_HORIZONTAL_PADDING,
        className,
      )}
    >
      {children}
    </div>
  );
}

export const BaseDialog = {
  Container: DialogContainer,
  Title,
  Body,
  Footer,
};
