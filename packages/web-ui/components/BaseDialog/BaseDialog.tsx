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
          'fixed inset-0 flex',
          'items-end justify-center',
          'lg:items-center',
          Z_INDEX.dialogOverlay,
        )}
      >
        <RadixDialog.Content
          // Need to pass this because we're not using `Radix.Description`.
          // See https://www.radix-ui.com/primitives/docs/components/dialog#description.
          aria-describedby={undefined}
          onPointerDownOutside={(e) => {
            // don't dismiss dialog when clicking inside the toast
            // Sonner bug workaround: https://github.com/radix-ui/primitives/issues/2690#issuecomment-2009617202
            if (
              e.target instanceof Element &&
              e.target.closest('[data-sonner-toast]')
            ) {
              e.preventDefault();
            }

            // don't dismiss dialog when any Privy modal is on screen
            if (document.getElementById('privy-modal-content')) {
              e.preventDefault();
            }
          }}
          asChild
        >
          <AnimationContainer.PopIn
            // Disabling the opacity change for a smoother transition during dialog navigation
            disableFadeIn
            className={mergeClassNames(
              // on mobile, dialogs look like full-width bottom sheets, so we want to round the
              // top corners and leave some space at the bottom for the safe area
              'w-full max-w-[100vw] rounded-t-xl pb-4',
              // on desktop, dialogs look like modals, so we want to round all corners
              'lg:w-120 lg:max-w-[95vw] lg:rounded-xl lg:pb-0',
              'bg-surface-card',
              'relative flex flex-col',
              'overflow-hidden',
              'text-text-tertiary',
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
        'h-12',
        'border-overlay-divider border-b',
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
