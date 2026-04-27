import { WithChildren, WithClassnames } from '@nadohq/web-common';
import { ButtonAsLinkProps } from '@nadohq/web-ui';

export interface ToastProps {
  ttl?: number;
  onDismiss(): void;
}

export interface ToastBodyProps extends WithClassnames, WithChildren {}

export interface ToastContainerProps extends ToastBodyProps {}

export interface ToastSeparatorProps extends WithClassnames {
  ttl?: number;
}

export interface ToastHeaderProps extends ToastBodyProps {
  onDismiss(): void;
}

export interface ToastFooterLinkProps extends Omit<
  ButtonAsLinkProps,
  'as' | 'color'
> {}
