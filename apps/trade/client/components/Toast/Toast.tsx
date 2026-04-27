import { joinClassNames, mergeClassNames } from '@nadohq/web-common';
import { Button, Icons, LinkButton } from '@nadohq/web-ui';
import {
  TOAST_HEADER_ICON_SIZE,
  TOAST_WIDTH,
} from 'client/components/Toast/consts';
import {
  ToastBodyProps,
  ToastContainerProps,
  ToastFooterLinkProps,
  ToastHeaderProps,
  ToastSeparatorProps,
} from 'client/components/Toast/types';
import Link from 'next/link';

/**
 * Base Toast container component.
 */
function Container({ children, className }: ToastContainerProps) {
  return (
    <div
      className={mergeClassNames(
        'flex flex-col rounded-lg',
        'bg-background cursor-default overflow-clip',
        TOAST_WIDTH,
        // Apply a min-width to fit content without overflow with 360px as the ideal width
        'max-w-screen min-w-min',
        'max-h-[50vh] sm:max-h-72',
        className,
      )}
      data-testid="toast-container"
    >
      {children}
    </div>
  );
}

function Header({ className, children, onDismiss }: ToastHeaderProps) {
  return (
    <div className="flex w-full items-center p-1.5">
      <div
        className={mergeClassNames(
          'text-text-primary text-sm',
          'flex flex-1',
          className,
        )}
        data-testid="toast-header"
      >
        {children}
      </div>
      <Button
        endIcon={<Icons.X size={TOAST_HEADER_ICON_SIZE} />}
        className="text-text-tertiary"
        onClick={onDismiss}
        dataTestId="toast-dismiss-button"
      />
    </div>
  );
}

/**
 * An optionally animated divider that serves as a timer for the toast.
 */
function Separator({ ttl, className }: ToastSeparatorProps) {
  const animationStyles = (() => {
    if (!ttl || ttl === Infinity) {
      return {};
    }
    return {
      className:
        'animate-toast-timer group-hover/toast-container:[animation-play-state:paused]',
      style: { animationDuration: `${ttl}ms` },
    };
  })();

  return (
    <div
      className={mergeClassNames(
        'bg-accent h-px origin-left',
        animationStyles.className,
        className,
      )}
      style={animationStyles.style}
    />
  );
}

function Body({ children, className }: ToastBodyProps) {
  return (
    <div
      className={mergeClassNames(
        'text-text-primary text-xs',
        'w-full px-1.5 py-2',
        className,
      )}
      data-testid="toast-body"
    >
      {children}
    </div>
  );
}

export function FooterLink({
  className,
  children,
  ...rest
}: ToastFooterLinkProps) {
  return (
    <LinkButton
      as={Link}
      colorVariant="secondary"
      // w-max keeps the text content left-aligned, hence we don't need items-start from parent usages
      className={joinClassNames('text-2xs w-max', className)}
      {...rest}
    >
      {children}
    </LinkButton>
  );
}

export const Toast = {
  Container,
  Header,
  FooterLink,
  Separator,
  Body,
};
